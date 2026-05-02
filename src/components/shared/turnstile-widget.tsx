"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "error-callback"?: () => void
          "expired-callback"?: () => void
          theme?: "light" | "dark" | "auto"
          size?: "normal" | "compact"
        }
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

/**
 * Cloudflare Turnstile widget.
 *
 * - When `sitekey` is missing, renders nothing (development behavior). The
 *   server-side verifier mirrors this by passing requests through when the
 *   secret is unset, so dev still works.
 * - On success it both calls `onToken` AND writes the token to the named
 *   hidden input so plain `<form action={serverAction}>` flows pick it up.
 */
export function TurnstileWidget({
  sitekey,
  fieldName = "turnstileToken",
  onToken,
  className,
}: {
  sitekey?: string | null
  fieldName?: string
  onToken?: (token: string) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState("")
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!sitekey || !scriptLoaded || !containerRef.current) return
    if (!window.turnstile) return
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey,
      callback: (next) => {
        setToken(next)
        onToken?.(next)
      },
      "error-callback": () => setToken(""),
      "expired-callback": () => setToken(""),
      theme: "light",
    })
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [sitekey, scriptLoaded, onToken])

  if (!sitekey) return null

  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
      <input type="hidden" name={fieldName} value={token} readOnly />
    </div>
  )
}
