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
  }

  /**
   * Obtiene las claves públicas de Keycloak para validar JWTs
   */
  private async getJWKS(): Promise<any> {
    const jwksUrl = `${this.config.issuer}/protocol/openid-connect/certs`;
    
    if (this.jwksCache.has(jwksUrl)) {
      return this.jwksCache.get(jwksUrl);
    }

    try {
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
   * Valida un token JWT de Keycloak
   */
  async validateToken(token: string): Promise<JWTPayload | null> {
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

      // Verificar el JWT
      const { payload } = await jwtVerify(token, publicKey, {
        issuer: this.config.issuer,
        // Para client_credentials, no hay audience, usamos azp (authorized party)
        // audience: this.config.clientId
      });

      // Verificar que el token pertenece al cliente correcto
      if (payload.azp !== this.config.clientId && payload.aud !== this.config.clientId) {
        throw new Error('Token not issued for this client');
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