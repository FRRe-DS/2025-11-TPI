import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'

async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID as string,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    // Provider de credenciales simple para modo local/desarrollo.
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text', placeholder: 'test-user' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Credenciales por defecto para desarrollo
        const username = credentials?.username ?? 'test-user';
        const password = credentials?.password ?? 'password123';

        // Si proporcionas variables de entorno para usuario de desarrollo, úsalas
        const devUser = process.env.DEV_AUTH_USER || 'test-user';
        const devPass = process.env.DEV_AUTH_PASS || 'password123';

        if (username === devUser && password === devPass) {
          // Retornamos un objeto de usuario que NextAuth almacenará en la sesión
          return {
            id: 'dev-1',
            name: 'Dev User',
            email: 'dev@example.com'
          };
        }

        // Autenticación fallida
        return null;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && (token as any).user) {
        session.user = (token as any).user;
      }
      return session;
    }
  },
  // Para desarrollo queremos cookies basadas en huella menos estrictas
  session: {
    strategy: 'jwt'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }