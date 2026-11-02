import { effectiveBaseUrl, env } from '@/lib/env'
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'

// Auth.js builds sign-in/callback URLs from the incoming request's Host
// header unless AUTH_URL is set, which would let a spoofed Host (e.g. a
// self-hosted deployment reachable directly, bypassing a reverse proxy that
// doesn't overwrite it) influence those URLs. Pinning it to our own
// already-trusted BASE_URL removes that header entirely from the equation.
// Respects an operator-provided AUTH_URL, if one is already set.
process.env.AUTH_URL ??= effectiveBaseUrl

/**
 * Sign-in is OAuth-only and deliberately has no adapter: Auth.js keeps the
 * whole session in a signed JWT cookie, so no user record, email, or token
 * is ever written to Postgres. Each provider is only registered when both of
 * its env vars are set, so the app runs with sign-in fully disabled by
 * default.
 */
const providers = [
  ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
    ? [
        Google({
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
        }),
      ]
    : []),
  ...(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET
    ? [
        GitHub({
          clientId: env.AUTH_GITHUB_ID,
          clientSecret: env.AUTH_GITHUB_SECRET,
        }),
      ]
    : []),
]

export const isAuthEnabled = providers.length > 0

// Provider ids only (no secrets), safe to pass down to a client component so
// it can render one sign-in button per configured provider.
export const authProviderIds = providers.map((provider) => provider.id)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: 'jwt' },
  // Auth.js refuses to run at all without this outside a platform (Vercel,
  // Cloudflare Pages) it recognizes automatically — required for Docker/
  // self-hosted deployments. The actual Host header it would otherwise rely
  // on is already neutralized above by pinning AUTH_URL.
  trustHost: true,
  callbacks: {
    // `sub` (the OAuth provider's opaque account id) is enough to identify a
    // session; keep name/email only for display in the signed cookie, never
    // persisted server-side.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub
      return session
    },
  },
})
