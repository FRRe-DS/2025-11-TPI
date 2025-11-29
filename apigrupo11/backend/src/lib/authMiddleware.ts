import { NextRequest, NextResponse } from 'next/server';
import { KeycloakAuth } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    sub: string;
    email?: string;
    username?: string;
    roles: string[];
  };
}

/**
 * Middleware para validar tokens de Keycloak en las APIs
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: { requiredRoles?: string[] } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const keycloak = new KeycloakAuth();
    
    try {
      // Extraer token del header Authorization
      const token = keycloak.extractTokenFromRequest(req);
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        );
      }

      // Validar el token
      const payload = await keycloak.validateToken(token);
      
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Verificar roles si es necesario
      if (options.requiredRoles && !keycloak.hasRequiredRoles(payload, options.requiredRoles)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Agregar información del usuario al request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        sub: payload.sub,
        email: payload.email,
        username: payload.preferred_username,
        roles: payload.realm_access?.roles || []
      };

      return await handler(authenticatedReq);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Función helper para crear respuestas de error de autenticación
 */
export function createAuthErrorResponse(message: string, status: number = 401) {
  return NextResponse.json(
    { error: message, timestamp: new Date().toISOString() },
    { status }
  );
}

/**
 * Middleware para requerir autenticación con scopes específicos
 * Usa introspección de tokens para validar con Keycloak directamente
 */
export async function requireAuth(
  req: NextRequest, 
  options: { requiredScopes?: string[] } = {}
): Promise<{ error?: NextResponse; user?: any }> {
  const keycloak = new KeycloakAuth();
  
  try {
    // Extraer token del header Authorization
    const token = keycloak.extractTokenFromRequest(req);
    
    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Authorization token required' },
          { status: 401 }
        )
      };
    }

    // Validar el token usando introspección de Keycloak
    const tokenData = await keycloak.introspectToken(token);
    
    if (!tokenData || !tokenData.active) {
      return {
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    // Verificar scopes si es necesario
    if (options.requiredScopes) {
      const tokenScopes = tokenData.scope?.split(' ') || [];
      const hasAllScopes = options.requiredScopes.every((scope: string) => 
        tokenScopes.includes(scope)
      );
      
      if (!hasAllScopes) {
        return {
          error: NextResponse.json(
            { error: 'Insufficient permissions', requiredScopes: options.requiredScopes },
            { status: 403 }
          )
        };
      }
    }

    return {
      user: {
        sub: tokenData.sub,
        email: tokenData.email,
        username: tokenData.preferred_username || tokenData.username,
        roles: tokenData.realm_access?.roles || [],
        scopes: tokenData.scope?.split(' ') || []
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware simple que solo verifica si hay un token válido (legacy)
 */
export function withAuthHandler(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler);
}

/**
 * Middleware que requiere roles específicos (legacy)
 */
export function requireRoles(roles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(handler, { requiredRoles: roles });
  };
}