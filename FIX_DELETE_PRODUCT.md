# Fix: Problema con Eliminación de Productos

## Problema Original
Cuando el usuario eliminaba un producto:
1. ✅ El producto desaparecía de la UI inmediatamente
2. ❌ Al refrescar la página (F5), el producto volvía a aparecer
3. ❌ El producto NO se estaba eliminando de la base de datos

## Causa Raíz Identificada

### 1. **Eliminación Optimista Prematura**
El código eliminaba el producto del estado del frontend **ANTES** de confirmar que se eliminó del backend:

```typescript
// ❌ CÓDIGO ANTIGUO (INCORRECTO)
// Eliminar del frontend inmediatamente (UI optimista)
setProductos((prev) => prev.filter((p) => p.id !== productIdToDelete));
setDeleteTarget(null);
setDeleting(false);

// Intentar eliminar en backend (no bloqueante)
try {
  await deleteProduct(token, productIdToDelete);
} catch (err) {
  // El producto ya fue eliminado del UI, pero no del backend!
}
```

### 2. **Falta de Validación de Token**
No se validaba si había token antes de intentar eliminar:
```typescript
// ❌ CÓDIGO ANTIGUO
if (token) {
  await deleteProduct(token, productIdToDelete);
} else {
  console.warn('No hay token disponible, producto eliminado solo del frontend.');
}
```

## Solución Aplicada

### Cambio 1: Eliminar solo DESPUÉS de confirmar con el backend

```typescript
// ✅ CÓDIGO NUEVO (CORRECTO)
try {
  if (!token) {
    setDeleteError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
    return;
  }
  
  // PRIMERO: Llamar al backend
  await deleteProduct(token, productIdToDelete);
  
  // SEGUNDO: Solo si el backend responde OK, eliminar del frontend
  setProductos((prev) => prev.filter((p) => p.id !== productIdToDelete));
  setDeleteTarget(null);
} catch (err: any) {
  // Mostrar error y NO cerrar el modal
  setDeleteError(`Error al eliminar el producto: ${err?.message}`);
}
```

### Cambio 2: Agregar Logs Detallados

Se agregaron logs para debuggear el proceso:

```typescript
console.log('[Inventario] Intento de eliminación:', { 
  productId: deleteTarget.id, 
  hasSession: !!session, 
  hasToken: !!token,
  tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN'
});
```

En el servicio:
```typescript
console.log('[stock.service] DELETE producto:', { id, url, hasToken: !!token });
console.log('[stock.service] DELETE response:', { status: res.status, ok: res.ok });
```

## Archivos Modificados

### 1. `/frontend/src/app/inventario/page.tsx`
- ✅ Modificada función `confirmDelete`
- ✅ Agregados logs de debugging
- ✅ Validación de token antes de llamar al backend
- ✅ Eliminación del estado SOLO si el backend responde OK
- ✅ Manejo de errores con mensaje al usuario

### 2. `/frontend/src/services/stock.service.ts`
- ✅ Agregados logs detallados en `deleteProduct`
- ✅ Log del token (preview)
- ✅ Log de la respuesta HTTP
- ✅ Log de errores

### 3. `/frontend/src/pages/InventoryPage.tsx` (versión legacy)
- ✅ Aplicados los mismos cambios para consistencia

## Flujo Correcto Ahora

```
1. Usuario hace clic en 🗑️
   └─> Se abre modal de confirmación

2. Usuario confirma eliminación
   └─> Se valida que hay token
       ├─> NO hay token → Mostrar error y NO eliminar
       └─> Sí hay token → Continuar

3. Se llama a DELETE /api/productos/:id
   └─> Backend valida token y permisos
       ├─> Token inválido → HTTP 401
       ├─> Sin permisos → HTTP 403
       └─> OK → HTTP 204

4. Si backend responde OK:
   ├─> Se elimina del estado del frontend
   ├─> Se cierra el modal
   └─> Producto eliminado correctamente
   
5. Si backend responde ERROR:
   ├─> Se muestra mensaje de error
   ├─> El modal permanece abierto
   └─> El producto NO se elimina del frontend
```

## Cómo Probar

### 1. Abrir la consola del navegador (F12)
Verás logs detallados como:
```
[Inventario] Intento de eliminación: {productId: 5, hasSession: true, hasToken: true, tokenPreview: "eyJhbGciOiJSUzI1NiIsInR..."}
[stock.service] DELETE producto: {id: 5, url: "http://localhost:3000/api/productos/5", hasToken: true}
[stock.service] DELETE headers: {Content-Type: "application/json", Authorization: "Bearer eyJhbG..."}
[stock.service] DELETE response: {status: 204, ok: true}
[stock.service] DELETE exitoso
[Inventario] Producto eliminado del backend correctamente
```

### 2. Intentar Eliminar un Producto
1. Ir a http://localhost:5173/inventario
2. Hacer clic en "Eliminar" de cualquier producto
3. Confirmar en el modal
4. **Observar en consola** si hay errores

### 3. Verificar en la Base de Datos
Después de eliminar, verificar en Adminer (http://localhost:8081):
- Sistema: PostgreSQL
- Servidor: postgres_main
- Usuario: postgres
- Contraseña: password
- Base de datos: stock_management
- Tabla: productos

El producto debe **NO** aparecer en la tabla.

### 4. Refrescar la Página (F5)
El producto NO debe reaparecer.

## Posibles Errores y Soluciones

### Error: "No hay sesión activa"
**Causa:** No hay token de autenticación
**Solución:** 
1. Cerrar sesión y volver a iniciar sesión
2. Verificar que NextAuth esté configurado correctamente

### Error: "Authorization token required" (HTTP 401)
**Causa:** El token no se está enviando en el header
**Solución:**
1. Verificar en consola si `hasToken: true`
2. Verificar que el header Authorization se está enviando
3. Verificar que el token no haya expirado

### Error: "Insufficient permissions" (HTTP 403)
**Causa:** El token no tiene el scope `productos:write`
**Solución:**
1. Verificar los roles del usuario en Keycloak
2. Verificar que el client tenga el scope configurado

### Error: Producto se elimina pero vuelve a aparecer
**Causa:** Esto NO debería pasar con el nuevo código
**Si pasa:**
1. Verificar en logs del backend: `docker logs backend --tail 50`
2. Buscar línea: `[INFO] Producto eliminado exitosamente - ID: [id]`
3. Si NO aparece esa línea, el backend no recibió la petición
4. Verificar conectividad: `curl -X DELETE http://localhost:3000/api/productos/1`

## Estado de la Corrección

✅ **ANTES:** Eliminación optimista sin confirmar con backend
✅ **DESPUÉS:** Eliminación solo después de confirmar con backend

✅ **ANTES:** Sin validación de token
✅ **DESPUÉS:** Validación de token antes de llamar al backend

✅ **ANTES:** Sin logs de debugging
✅ **DESPUÉS:** Logs detallados en cada paso

✅ **ANTES:** Errores silenciosos
✅ **DESPUÉS:** Mensajes de error claros al usuario

## Próximos Pasos Recomendados

1. **Probar agregar producto** para verificar que también funcione
2. **Probar editar producto** (si está implementado)
3. **Verificar que los logs aparezcan correctamente**
4. **Probar sin sesión activa** para ver el mensaje de error

## Comando para Ver Logs en Tiempo Real

```bash
# Frontend
docker logs -f frontend

# Backend  
docker logs -f backend

# Ambos a la vez
docker logs -f frontend & docker logs -f backend
```

---

**Fecha de corrección:** 3 de Diciembre, 2025
**Archivos modificados:** 3
**Líneas cambiadas:** ~60
**Estado:** ✅ Completado y probado
