import { NextRequest, NextResponse } from "next/server";
import { productoDB, reservasDB } from "@/lib/database";
import { ReservaInput } from "@/lib/types";
import { badRequest, corsHeaders } from "@/app/api/_utils";
import { requireAuth } from "@/lib/authMiddleware";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  console.log('[INFO] Solicitud recibida: GET /api/reservas');
  const authResult = await requireAuth(req, { requiredScopes: ['reservas:read'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para GET /api/reservas');
    return authResult.error;
  }

  const { searchParams } = new URL(req.url);
  const usuarioId = searchParams.get("usuarioId") ? Number(searchParams.get("usuarioId")) : undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const estado = (searchParams.get("estado") as any) || undefined;
  
  console.log(`[INFO] Consultando reservas - UsuarioId: ${usuarioId || 'todos'}, Página: ${page}, Límite: ${limit}, Estado: ${estado || 'todos'}`);
  const list = await reservasDB.list({ usuarioId, page, limit, estado });
  console.log(`[INFO] Reservas obtenidas exitosamente - ${list.length} reservas encontradas`);
  console.log(`[INFO] Retornando lista de reservas`);
  
  return NextResponse.json(list, { headers: corsHeaders });
}

export async function POST(req: Request) {
  console.log('[INFO] Solicitud recibida: POST /api/reservas');
  const authResult = await requireAuth(req as NextRequest, { requiredScopes: ['reservas:write'] });
  if (authResult.error) {
    console.log('[WARN] Autenticación fallida para POST /api/reservas');
    return authResult.error;
  }

  const body = (await req.json().catch(() => null)) as ReservaInput | null;
  if (!body || !body.idCompra || !body.usuarioId || !body.productos || !Array.isArray(body.productos)) {
    console.log('[WARN] Validación fallida - Faltan campos requeridos');
    return badRequest("Los datos proporcionados son inválidos.", "idCompra, usuarioId y productos son requeridos");
  }
  
  console.log(`[INFO] Procesando reserva - IdCompra: ${body.idCompra}, UsuarioId: ${body.usuarioId}, Productos: ${body.productos.length}`);
  
  // Validar que los productos existan en la base de datos real
  const productosData: Array<{ id: number; precio: number; cantidad: number }> = [];
  
  try {
    console.log('[INFO] Validando productos contra la base de datos');
    for (const item of body.productos) {
      console.log(`[INFO] Validando producto - ID: ${item.idProducto}, Cantidad: ${item.cantidad}`);
      const producto = await productoDB.getById(item.idProducto);
      if (!producto) {
        console.log(`[WARN] Producto no encontrado - ID: ${item.idProducto}`);
        return NextResponse.json(
          { code: "PRODUCT_NOT_FOUND", message: `Producto ${item.idProducto} no existe` },
          { status: 404, headers: corsHeaders }
        );
      }
      console.log(`[INFO] Producto encontrado - Nombre: ${producto.nombre}, Stock disponible: ${producto.stockDisponible}`);
      
      // Validar stock disponible
      if (producto.stockDisponible < item.cantidad) {
        console.log(`[WARN] Stock insuficiente - Producto ID: ${item.idProducto}, Disponible: ${producto.stockDisponible}, Solicitado: ${item.cantidad}`);
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
      console.log(`[INFO] Actualizando stock en base de datos - Producto ID: ${item.idProducto}, Delta: -${item.cantidad}`);
      await productoDB.updateStock(item.idProducto, -item.cantidad);
      console.log(`[INFO] Stock actualizado exitosamente para producto ID: ${item.idProducto}`);
    }
    console.log('[INFO] Todos los productos validados exitosamente');
  } catch (error) {
    console.error('[ERROR] Error al validar productos:', error);
    return NextResponse.json(
      { code: "VALIDATION_ERROR", message: "Error al validar productos" },
      { status: 500, headers: corsHeaders }
    );
  }
  
  // Crear la reserva con los precios y nombres reales
  console.log('[INFO] Preparando datos de reserva con detalles de productos');
  const reservaInput = {
    idCompra: body.idCompra,
    usuarioId: body.usuarioId,
    productos: await Promise.all(body.productos.map(async (p, index) => {
      const producto = await productoDB.getById(p.idProducto);
      return {
        idProducto: p.idProducto,
        cantidad: p.cantidad,
        nombre: producto?.nombre || 'Producto',
        precioUnitario: productosData[index].precio
      };
    }))
  };
  
  console.log('[INFO] Creando reserva en la base de datos');
  const result = await reservasDB.create(reservaInput);
  
  console.log(`[INFO] Reserva creada exitosamente - IdCompra: ${body.idCompra}`);
  console.log('[INFO] Retornando respuesta de reserva');
  return NextResponse.json(result, { status: 201, headers: corsHeaders });
}
