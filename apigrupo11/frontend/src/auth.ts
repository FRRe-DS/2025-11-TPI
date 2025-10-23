import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

export const config = {
  providers: [
    {
      id: "keycloak",
      name: "Keycloak",
      type: "oidc",
      issuer: process.env.KEYCLOAK_ISSUER,
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      checks: ["pkce", "state"],
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          roles: profile.realm_access?.roles || [],
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      
      // Add roles from profile
      if (profile) {
        token.roles = (profile as any).realm_access?.roles || [];
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.user.roles = token.roles as string[];
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);