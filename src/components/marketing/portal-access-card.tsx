"use client"

import { useActionState } from "react"
import { Building2Icon, LockIcon, UserRoundIcon } from "lucide-react"

import { signInWithCredentials, signUpParent } from "@/app/actions/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function PortalAccessCard() {
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithCredentials,
    undefined
  )
  const [signUpState, signUpAction, signUpPending] = useActionState(signUpParent, undefined)

  return (
    <Card className="border-border/70 bg-background/94 shadow-[0_34px_90px_-56px_rgba(31,64,62,0.58)]">
      <CardHeader className="gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3">
            Secure sign-in
          </Badge>
          <Badge variant="outline" className="rounded-full px-3">
            Auth + roles enabled
          </Badge>
        </div>
        <div>
          <CardTitle className="font-heading text-xl tracking-tight">Access your account</CardTitle>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            One login for families and admins. Routing is automatic after authentication.
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="sign-in">
          <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-border/60 bg-secondary/70 p-1">
            <TabsTrigger
              value="sign-in"
              className="rounded-lg data-active:border-primary/35 data-active:bg-background data-active:shadow-[0_16px_30px_-24px_rgba(31,64,62,0.48)]"
            >
              <LockIcon className="size-4" />
              Sign in
            </TabsTrigger>
            <TabsTrigger
              value="create-account"
              className="rounded-lg data-active:border-primary/35 data-active:bg-background data-active:shadow-[0_16px_30px_-24px_rgba(31,64,62,0.48)]"
            >
              <Building2Icon className="size-4" />
              Create parent account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in" className="mt-3">
            <form action={signInAction} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" name="email" type="email" placeholder="you@example.com" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" name="password" type="password" required />
              </div>

              {signInState?.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {signInState.error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={signInPending}>
                {signInPending ? "Signing in..." : "Sign in to portal"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="create-account" className="mt-3">
            <form action={signUpAction} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="signup-name">Full name</Label>
                <Input id="signup-name" name="name" type="text" placeholder="Parent or guardian" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" name="password" type="password" required />
              </div>

              <p className="rounded-xl border border-border/65 bg-secondary/54 px-4 py-3 text-sm leading-6 text-muted-foreground">
                Parent signup is open. Admin access is invite-only.
              </p>

              {signUpState?.error ? (
                <p className="text-sm text-destructive" role="alert">
                  {signUpState.error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={signUpPending}>
                <UserRoundIcon className="size-4" />
                {signUpPending ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
