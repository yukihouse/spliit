'use client'

import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * Rendered only when at least one OAuth provider is configured (see
 * `isAuthEnabled` in `src/auth.ts`). Sign-in itself goes through Auth.js's
 * built-in `/api/auth/signin` page, which already lists every configured
 * provider — no need to duplicate that here.
 */
export function AuthStatus() {
  const t = useTranslations('Header')
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  if (!session?.user) {
    return (
      <Button variant="ghost" size="sm" asChild className="-my-3 text-primary">
        <Link href="/api/auth/signin">{t('signIn')}</Link>
      </Button>
    )
  }

  const label = session.user.name ?? session.user.email ?? undefined

  return (
    <div className="flex items-center gap-2 text-sm">
      {label && (
        <span className="hidden sm:inline text-muted-foreground">{label}</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="-my-3 text-primary"
        onClick={() => signOut()}
      >
        {t('signOut')}
      </Button>
    </div>
  )
}
