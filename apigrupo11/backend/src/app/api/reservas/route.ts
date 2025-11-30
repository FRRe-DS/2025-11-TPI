import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productoDB } from "@/lib/database";
import { ReservaInput } from "@/lib/types";
import { badRequest, corsHeaders } from "@/app/api/_utils";
import { requireAuth } from "@/lib/authMiddleware";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, { requiredScopes: ['reservas:read'] });
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(req.url);
  const usuarioId = searchParams.get("usuarioId") ? Number(searchParams.get("usuarioId")) : undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const estado = (searchParams.get("estado") as any) || undefined;
  
  console.log('GET reservas - usuarioId:', usuarioId, 'page:', page, 'limit:', limit, 'estado:', estado);
  const list = db.listarReservas(usuarioId, page, limit, estado);
  console.log('Reservas encontradas:', list.length);
  
  return NextResponse.json(list, { headers: corsHeaders });
}

export async function POST(req: Request) {
  const authResult = await requireAuth(req as NextRequest, { requiredScopes: ['reservas:write'] });
  if (authResult.error) return authResult.error;

  const body = (await req.json().catch(() => null)) as ReservaInput | null;
  if (!body || !body.idCompra || !body.usuarioId || !body.productos || !Array.isArray(body.productos)) {
    return badRequest("Los datos proporcionados son inválidos.", "idCompra, usuarioId y productos son requeridos");
  }
  
  // Validar que los productos existan en la base de datos real
  const productosData: Array<{ id: number; precio: number; cantidad: number }> = [];
  
  try {
    for (const item of body.productos) {
      console.log('Buscando producto con ID:', item.idProducto);
      const producto = await productoDB.getById(item.idProducto);
      console.log('Producto encontrado:', producto);
      if (!producto) {
        return NextResponse.json(
          { code: "PRODUCT_NOT_FOUND", message: `Producto ${item.idProducto} no existe` },
          { status: 404, headers: corsHeaders }
        );
      }
      
      // Validar stock disponible
      if (producto.stockDisponible < item.cantidad) {
        return NextResponse.json(
          { code: "INSUFFICIENT_STOCK", message: `Stock insuficiente para producto ${item.idProducto}. Disponible: ${producto.stockDisponible}, Solicitado: ${item.cantidad}` },
          { status: 400, headers: corsHeaders }
        );
      }
      
      // Guardar datos del producto para la reserva
      productosData.push({
        id: item.idProducto,
        precio: parseFloat(producto.precio as any),
        cantidad: item.cantidad
      });
      
      // Actualizar stock en la base de datos
      await productoDB.updateStock(item.idProducto, -item.cantidad);
    }
  } catch (error) {
    console.error('Error validating products:', error);
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Error al validar productos" },
      { status: 500, headers: corsHeaders }
    );
  }
  
  // Crear la reserva con los precios y nombres reales
  const reservaInput = {
    ...body,
    productos: await Promise.all(body.productos.map(async (p, index) => {
      const producto = await productoDB.getById(p.idProducto);
      return {
        ...p,
        nombre: producto?.nombre || 'Producto',
        precioUnitario: productosData[index].precio
      };
    }))
  };
  
  const result = db.reservar(reservaInput);
  
  if (!result.ok) {
    if (result.error?.includes("Stock insuficiente")) {
      return NextResponse.json(
        { code: "INSUFFICIENT_STOCK", message: result.error },
        { status: 400, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { code: "INVALID_DATA", message: result.error || "Error al crear la reserva" },
      { status: 400, headers: corsHeaders }
    );
  }
  
  return NextResponse.json(result.reserva, { status: 201, headers: corsHeaders });
}
