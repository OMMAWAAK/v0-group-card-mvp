import type { FundingOption } from "./types"

// Source of truth for all funding options
export const FUNDING_OPTIONS: FundingOption[] = [
  {
    id: "starter-10",
    name: "Starter Pack",
    description: "Perfect for trying out GroupCard",
    priceInCents: 1000, // $10.00
    balanceAmount: 10,
  },
  {
    id: "basic-25",
    name: "Basic Plan",
    description: "Great for small group expenses",
    priceInCents: 2500, // $25.00
    balanceAmount: 25,
  },
  {
    id: "standard-50",
    name: "Standard Plan",
    description: "Ideal for regular group activities",
    priceInCents: 5000, // $50.00
    balanceAmount: 50,
  },
  {
    id: "premium-100",
    name: "Premium Plan",
    description: "Best for larger group spending",
    priceInCents: 10000, // $100.00
    balanceAmount: 100,
  },
]
