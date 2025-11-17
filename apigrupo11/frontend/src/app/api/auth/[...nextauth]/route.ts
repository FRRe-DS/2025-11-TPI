import NextAuth, { AuthOptions, Session, Account } from "next-auth"
import { JWT } from "next-auth/jwt"
import KeycloakProvider from "next-auth/providers/keycloak"

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
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID as string,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET as string,
      issuer: process.env.KEYCLOAK_ISSUER as string,

      // --- AGREGA ESTE BLOQUE ---
      // Le decimos a NextAuth que solo pida el permiso 'openid'.
      // Esto es para probar si el error es por 'profile' o 'email'.
      authorization: {
        params: {
          scope: 'openid'
        }
      }
      // --- FIN DE LO AGREGADO ---
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      // Initial sign in
      if (account) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
          refreshToken: account.refresh_token,
          user: token.user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && token.accessToken) {
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error;
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }