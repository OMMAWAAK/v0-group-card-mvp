"use server"

import { stripe } from "@/lib/stripe"
import { FUNDING_OPTIONS } from "@/lib/funding-options"

export async function startCheckoutSession(fundingOptionId: string) {
  const fundingOption = FUNDING_OPTIONS.find((f) => f.id === fundingOptionId)
  if (!fundingOption) {
    throw new Error(`Funding option with id "${fundingOptionId}" not found`)
  }

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: fundingOption.name,
            description: fundingOption.description,
          },
          unit_amount: fundingOption.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      fundingOptionId: fundingOption.id,
      balanceAmount: fundingOption.balanceAmount.toString(),
    },
  })

  return session.client_secret
}

export async function checkPaymentStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_details?.email,
  }
}
