import Stripe from "stripe"

import { appEnv } from "@/lib/env"

let stripeClient: Stripe | null | undefined

export function getStripeClient() {
  if (!appEnv.stripeSecretKey) {
    return null
  }

  if (!stripeClient) {
    stripeClient = new Stripe(appEnv.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
      appInfo: {
        name: "Ambassadors Care",
        version: "0.1.0",
      },
    })
  }

  return stripeClient
}

export function formatStripePaymentMethodLabel({
  brand,
  last4,
}: {
  brand?: string | null
  last4?: string | null
}) {
  if (!brand || !last4) {
    return null
  }

  return `${brand.charAt(0).toUpperCase()}${brand.slice(1)} ending in ${last4}`
}
