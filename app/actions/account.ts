"use server"

import { cookies } from "next/headers"
import {
  createAccount,
  getAccount,
  addBankAccount,
  getBankAccounts,
  addTransaction,
  getTransactions,
  updateAccountBalance,
} from "@/lib/mock-database"

export async function createGroupCardAccount(data: {
  email: string
  firstName: string
  lastName: string
  fundingAmount: number
  stripePaymentIntentId?: string
}) {
  const account = createAccount({
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    balance: data.fundingAmount,
    stripePaymentIntentId: data.stripePaymentIntentId,
  })

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("groupcard_account_id", account.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return account
}

export async function getCurrentAccount() {
  const cookieStore = await cookies()
  const accountId = cookieStore.get("groupcard_account_id")?.value

  if (!accountId) return null

  return getAccount(accountId)
}

export async function linkBankAccount(data: {
  bankName: string
  accountNumber: string
  routingNumber: string
}) {
  const account = await getCurrentAccount()
  if (!account) throw new Error("No account found")

  // Simulate bank verification (in production, use Plaid or similar)
  const last4 = data.accountNumber.slice(-4)

  const bankAccount = addBankAccount(account.id, {
    bankName: data.bankName,
    last4,
    status: "linked",
    linkedAt: new Date(),
  })

  return bankAccount
}

export async function getLinkedBanks() {
  const account = await getCurrentAccount()
  if (!account) return []

  return getBankAccounts(account.id)
}

export async function simulateTransaction(data: {
  amount: number
  merchant: string
}) {
  const account = await getCurrentAccount()
  if (!account) throw new Error("No account found")

  // Check if sufficient balance
  const approved = account.balance >= data.amount

  if (approved) {
    // Deduct from balance
    updateAccountBalance(account.id, -data.amount)
  }

  const transaction = addTransaction({
    accountId: account.id,
    type: "auth",
    amount: data.amount,
    status: approved ? "approved" : "declined",
    merchant: data.merchant,
    timestamp: new Date(),
    authCode: approved ? `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
  })

  return transaction
}

export async function getAccountTransactions() {
  const account = await getCurrentAccount()
  if (!account) return []

  return getTransactions(account.id)
}
