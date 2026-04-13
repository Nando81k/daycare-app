import { AppLogo } from "@/components/layout/app-logo"

import { AuthBrandPanel } from "./auth-brand-panel"
import { AuthWorkspaceTabs, type AuthWorkspaceTab } from "./auth-workspace-tabs"

export function AuthWorkspace({ defaultTab }: { defaultTab: AuthWorkspaceTab }) {
  return (
    <section className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10 lg:p-12">
        <div className="flex justify-center md:justify-start">
          <AppLogo />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <AuthWorkspaceTabs defaultTab={defaultTab} />
        </div>

        <p className="text-center text-xs text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Ambassadors Care. All rights reserved.
        </p>
      </div>

      <AuthBrandPanel />
    </section>
  )
}
