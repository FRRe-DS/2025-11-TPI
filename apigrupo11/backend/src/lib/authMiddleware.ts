import { NextRequest, NextResponse } from 'next/server';
import { KeycloakAuth } from './auth';
import { corsHeaders } from '@/app/api/_utils';

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

    let tokenData: any;
    const hasClientConfig = process.env.KEYCLOAK_CLIENT_ID && process.env.KEYCLOAK_CLIENT_SECRET;

    if (hasClientConfig) {
      // Si hay client configurado, intentar usar introspección primero
      tokenData = await keycloak.introspectToken(token);
      
      // Si la introspección falla (por ejemplo, cliente sin permisos), usar validación JWKS como fallback
      if (!tokenData || !tokenData.active) {
        const jwtPayload = await keycloak.validateToken(token, false);
        
        if (!jwtPayload) {
          return {
            error: NextResponse.json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            )
          };
        }
        
        // Convertir el payload JWT al formato esperado por el resto del código
        const scopeValue = (jwtPayload as any).scope || '';
        tokenData = {
          active: true,
          sub: jwtPayload.sub,
          email: jwtPayload.email,
          preferred_username: jwtPayload.preferred_username,
          username: jwtPayload.preferred_username,
          realm_access: jwtPayload.realm_access,
          scope: scopeValue
        };
        console.log('[INFO] Token validation successful, returning 200');
      }
    } else {
      console.log('[INFO] No hay client, validando solo con JWKS');
      // Si no hay client, validar solo con JWKS (acepta cualquier client del realm)
      const jwtPayload = await keycloak.validateToken(token, false);

      if (!jwtPayload) {
        console.log('[INFO] Token validation failed, returning 401');
        return {
          error: NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          )
        };
      }
      
      // Convertir el payload JWT al formato esperado
      const scopeValue = (jwtPayload as any).scope || '';
      tokenData = {
        active: true,
        sub: jwtPayload.sub,
        email: jwtPayload.email,
        preferred_username: jwtPayload.preferred_username,
        username: jwtPayload.preferred_username,
        realm_access: jwtPayload.realm_access,
        scope: scopeValue
      };
      console.log('[INFO] Token validation successful, returning 200');
    }

    // Development bypass: if SKIP_AUTH=true allow requests without validating scopes
    if (process.env.SKIP_AUTH === 'true') {
      console.warn('[WARN] SKIP_AUTH enabled - bypassing real token scope checks (development only)');
      return {
        user: {
          sub: tokenData.sub || 'dev-user',
          email: tokenData.email || 'dev@example.local',
          username: tokenData.preferred_username || tokenData.username || 'dev',
          roles: tokenData.realm_access?.roles || ['admin'],
          scopes: tokenData.scope?.split(' ') || (options.requiredScopes || ['productos:read', 'productos:write'])
        }
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
