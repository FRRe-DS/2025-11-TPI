"use client"; // Obligatorio para usar hooks

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { data: session } = useSession(); // 1. Obtenemos la sesión
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    // Solo intentamos buscar si hay sesión y token
    if (session && (session as any).accessToken) {
      obtenerProductos();
    }
  }, [session]);

  async function obtenerProductos() {
    // 2. Extraemos el token
    const token = (session as any).accessToken;

    try {
      // 3. Llamamos a TU Backend (ojo con el puerto 3000)
      const res = await fetch("http://localhost:3000/api/productos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // 4. ¡LA CLAVE! Enviamos el token Bearer
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      } else {
        console.error("Error al obtener productos:", res.status);
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(productos, null, 2)}</pre>
    </div>
  );
}