import { jwtVerify, importJWK } from 'jose';
import { NextRequest } from 'next/server';

interface KeycloakConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  realm: string;
}

interface JWTPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

export class KeycloakAuth {
  private config: KeycloakConfig;
  private jwksCache: Map<string, any> = new Map();

  constructor() {
    this.config = {
      issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/master',
      clientId: process.env.KEYCLOAK_CLIENT_ID || '',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      realm: process.env.KEYCLOAK_REALM || 'master'
    };
    console.log('[INFO] Keycloak config:', this.config);
  }

  /**
   * Obtiene las claves públicas de Keycloak para validar JWTs
   */
  private async getJWKS(): Promise<any> {
    const issuer = process.env.KEYCLOAK_ISSUER || this.config.issuer;
    const jwksUrl = `${issuer}/protocol/openid-connect/certs`;
    
    if (this.jwksCache.has(jwksUrl)) {
      return this.jwksCache.get(jwksUrl);
    }

    try {
      console.log('[INFO] Fetching JWKS from:', jwksUrl);
      const response = await fetch(jwksUrl);
      const jwks = await response.json();
      this.jwksCache.set(jwksUrl, jwks);
      return jwks;
    } catch (error) {
      console.error('Error fetching JWKS:', error);
      throw new Error('Failed to fetch Keycloak public keys');
    }
  }

  /**
   * Valida un token usando el endpoint de introspección de Keycloak
   * Esta es la forma más confiable de validar tokens
   */
  async introspectToken(token: string): Promise<any | null> {
    try {
      const introspectUrl = `${this.config.issuer}/protocol/openid-connect/token/introspect`;
      
      console.log('[INFO] Introspecting token against:', introspectUrl);

      console.log('[INFO] Parametros de introspeccion:', {
        token: token,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });

      const response = await fetch(introspectUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: token,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });
      console.log('[INFO] Introspection response:', response);

      if (!response.ok) {
        console.error('Token introspection failed:', response.statusText);
        return null;
      }

      const data = await response.json();
      
      // Si el token no está activo, retornar null
      if (!data.active) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Token introspection error:', error);
      return null;
    }
  }

  /**
   * Valida un token JWT de Keycloak
   * @param token - El token JWT a validar
   * @param validateClientId - Si es true, valida que el token sea para el clientId configurado. Si es false, acepta cualquier client del realm.
   */
  async validateToken(token: string, validateClientId: boolean = false): Promise<JWTPayload | null> {
    try {
      const jwks = await this.getJWKS();
      
      // Decodificar el header del JWT para obtener el kid
      const [headerB64] = token.split('.');
      const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
      
      // Encontrar la clave correspondiente
      const key = jwks.keys.find((k: any) => k.kid === header.kid);
      if (!key) {
        throw new Error('Key not found in JWKS');
      }

      // Importar la clave JWK
      const publicKey = await importJWK(key);

      // IMPORTANTE: Leer el issuer en runtime
      const issuer = process.env.KEYCLOAK_ISSUER || this.config.issuer;
      console.log('[INFO] Validating token against issuer:', issuer);

      // Verificar el JWT - solo validamos el issuer (realm)
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: issuer,
      });

      // Validación opcional del clientId
      if (validateClientId) {
        const clientId = payload.azp || payload.aud;
        if (Array.isArray(clientId)) {
          if (!clientId.includes(this.config.clientId)) {
            throw new Error('Token not issued for this client');
          }
        } else if (clientId !== this.config.clientId) {
          throw new Error('Token not issued for this client');
        }
      }

      return payload as JWTPayload;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Extrae el token Bearer del header Authorization
   */
  extractTokenFromRequest(request: NextRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Obtiene un access token usando Client Credentials Grant
   */
  async getClientToken(): Promise<string | null> {
    try {
      const tokenUrl = `${this.config.issuer}/protocol/openid-connect/token`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get client token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting client token:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene los roles requeridos
   */
  hasRequiredRoles(payload: JWTPayload, requiredRoles: string[]): boolean {
    if (!requiredRoles.length) return true;

    const userRoles = payload.realm_access?.roles || [];
    return requiredRoles.some(role => userRoles.includes(role));
  }
}