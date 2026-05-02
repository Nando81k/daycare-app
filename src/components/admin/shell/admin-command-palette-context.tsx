"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type AdminCommandPaletteContextValue = {
  open: boolean
  setOpen: (next: boolean) => void
  toggle: () => void
}

const Ctx = createContext<AdminCommandPaletteContextValue | null>(null)

export function AdminCommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  // Global ⌘K / Ctrl+K listener.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdminCommandPalette() {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error(
      "useAdminCommandPalette must be used within AdminCommandPaletteProvider"
    )
  }
  return ctx
}
