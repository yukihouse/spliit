import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      /** The OAuth provider's opaque account id (JWT `sub`), never persisted. */
      id?: string
    } & DefaultSession['user']
  }
}
