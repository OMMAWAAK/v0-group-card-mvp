export interface GroupCardAccount {
  id: string
  email: string
  firstName: string
  lastName: string
  balance: number
  createdAt: Date
  stripePaymentIntentId?: string
}

export interface LinkedBankAccount {
  id: string
  accountId: string
  bankName: string
  last4: string
  status: "pending" | "linked" | "failed"
  linkedAt: Date
}

export interface Transaction {
  id: string
  accountId: string
  type: "auth" | "capture" | "refund"
  amount: number
  status: "pending" | "approved" | "declined"
  merchant: string
  timestamp: Date
  authCode?: string
}

export interface FundingOption {
  id: string
  name: string
  description: string
  priceInCents: number
  balanceAmount: number
}

export interface GroupMember {
  id: string
  name: string
  email: string
  paymentMethodId: string // Stripe payment method ID
  isLinked: boolean
}

export interface Group {
  id: string
  name: string
  members: GroupMember[]
  createdAt: Date
}

export interface MemberConfirmation {
  memberId: string
  memberName: string
  confirmed: boolean
  confirmedAt?: Date
  declined: boolean
}

export interface MemberHold {
  memberId: string
  memberName: string
  amountCents: number
  paymentIntentId: string
  status: "pending" | "authorized" | "failed" | "captured" | "released"
  error?: string
}

export interface GroupTransaction {
  id: string
  groupId: string
  totalCents: number
  merchant: string
  merchantAuthStatus: "pending" | "approved" | "declined"
  confirmations: MemberConfirmation[]
  memberHolds: MemberHold[]
  status: "preauth" | "awaiting_confirmations" | "approved" | "declined" | "captured" | "released"
  timestamp: Date
  authCode?: string
}
