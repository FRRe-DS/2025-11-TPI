import { NextResponse } from "next/server";
import { productoDB, reservaDB } from "@/lib/database.prisma";
import { ReservaInput } from "@/lib/types";
import { badRequest } from "@/app/api/_utils";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as ReservaInput | null;
    if (!body) return badRequest("Los datos proporcionados son inválidos.");
    if (!body.idCompra || typeof body.usuarioId !== "number" || !Array.isArray(body.productos)) {
      return badRequest("Los datos proporcionados son inválidos.", "idCompra, usuarioId y productos son requeridos");
    }

    // Validar y actualizar stock
    const productosData = [];
    for (const item of body.productos) {
      const producto = await productoDB.getById(item.idProducto);
      if (!producto) {
        return NextResponse.json(
          { error: `Producto ${item.idProducto} no encontrado` },
          { status: 404 }
        );
      }
      if (producto.stockDisponible < item.cantidad) {
        return badRequest("Stock insuficiente", `Producto ${item.idProducto} no tiene suficiente stock`);
      }
      
      // Actualizar stock
      await productoDB.updateStock(item.idProducto, -item.cantidad);
      
      productosData.push({
        productoId: item.idProducto,
        productoNombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: parseFloat(producto.precio as any)
      });
    }

    // Crear reserva
    const reserva = await reservaDB.create({
      idCompra: body.idCompra,
      usuarioId: body.usuarioId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      productos: productosData
    });

    return NextResponse.json(reserva);
  } catch (error) {
    console.error('[ERROR] Error al reservar stock:', error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
