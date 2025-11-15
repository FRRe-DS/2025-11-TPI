import NextAuth, { AuthOptions, Session, Account } from "next-auth"
import { JWT } from "next-auth/jwt"
import KeycloakProvider from "next-auth/providers/keycloak"

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
    // ... (el resto de tus callbacks quedan igual) ...
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && token.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }