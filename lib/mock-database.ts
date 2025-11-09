import type { GroupCardAccount, LinkedBankAccount, Transaction, Group, GroupTransaction } from "./types"

// Mock in-memory database (replace with real database in production)
export const mockAccounts = new Map<string, GroupCardAccount>()
export const mockBankAccounts = new Map<string, LinkedBankAccount[]>()
export const mockTransactions = new Map<string, Transaction[]>()
export const mockGroups = new Map<string, Group>()
export const mockGroupTransactions = new Map<string, GroupTransaction[]>()

export function createAccount(data: Omit<GroupCardAccount, "id" | "createdAt">): GroupCardAccount {
  const id = `acc_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const account: GroupCardAccount = {
    ...data,
    id,
    createdAt: new Date(),
  }
  mockAccounts.set(id, account)
  return account
}

export function getAccount(id: string): GroupCardAccount | undefined {
  return mockAccounts.get(id)
}

export function updateAccountBalance(accountId: string, amount: number): boolean {
  const account = mockAccounts.get(accountId)
  if (!account) return false

  account.balance += amount
  mockAccounts.set(accountId, account)
  return true
}

export function addBankAccount(
  accountId: string,
  bankAccount: Omit<LinkedBankAccount, "id" | "linkedAt">,
): LinkedBankAccount {
  const id = `bank_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const newBankAccount: LinkedBankAccount = {
    ...bankAccount,
    id,
    linkedAt: new Date(),
  }

  const existing = mockBankAccounts.get(accountId) || []
  existing.push(newBankAccount)
  mockBankAccounts.set(accountId, existing)

  return newBankAccount
}

export function getBankAccounts(accountId: string): LinkedBankAccount[] {
  return mockBankAccounts.get(accountId) || []
}

export function addTransaction(transaction: Omit<Transaction, "id">): Transaction {
  const id = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const newTransaction: Transaction = {
    ...transaction,
    id,
  }

  const existing = mockTransactions.get(transaction.accountId) || []
  existing.unshift(newTransaction) // Add to beginning for latest-first
  mockTransactions.set(transaction.accountId, existing)

  return newTransaction
}

export function getTransactions(accountId: string): Transaction[] {
  return mockTransactions.get(accountId) || []
}

export function createGroup(data: Omit<Group, "id" | "createdAt">): Group {
  const id = `grp_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const group: Group = {
    ...data,
    id,
    createdAt: new Date(),
  }
  mockGroups.set(id, group)
  return group
}

export function getGroup(id: string): Group | undefined {
  return mockGroups.get(id)
}

export function addGroupTransaction(groupId: string, transaction: Omit<GroupTransaction, "id">): GroupTransaction {
  const id = `gtxn_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const newTransaction: GroupTransaction = {
    ...transaction,
    id,
  }

  const existing = mockGroupTransactions.get(groupId) || []
  existing.unshift(newTransaction) // Add to beginning for latest-first
  mockGroupTransactions.set(groupId, existing)

  return newTransaction
}

export function getGroupTransactions(groupId: string): GroupTransaction[] {
  return mockGroupTransactions.get(groupId) || []
}

export function updateGroupTransaction(groupId: string, txnId: string, updates: Partial<GroupTransaction>): boolean {
  const transactions = mockGroupTransactions.get(groupId) || []
  const index = transactions.findIndex((t) => t.id === txnId)

  if (index === -1) return false

  transactions[index] = { ...transactions[index], ...updates }
  mockGroupTransactions.set(groupId, transactions)
  return true
}

export function updateTransactionConfirmation(
  transactionId: string,
  memberId: string,
  confirmed: boolean,
): GroupTransaction | null {
  // Find transaction across all groups
  for (const [groupId, transactions] of mockGroupTransactions.entries()) {
    const txn = transactions.find((t) => t.id === transactionId)
    if (txn) {
      const confirmationIndex = txn.confirmations.findIndex((c) => c.memberId === memberId)
      if (confirmationIndex !== -1) {
        txn.confirmations[confirmationIndex].confirmed = confirmed
        txn.confirmations[confirmationIndex].declined = !confirmed
        txn.confirmations[confirmationIndex].confirmedAt = new Date()

        // Check if all confirmations are complete
        const allConfirmed = txn.confirmations.every((c) => c.confirmed)
        const anyDeclined = txn.confirmations.some((c) => c.declined)

        if (anyDeclined) {
          txn.status = "declined"
          txn.merchantAuthStatus = "declined"
        } else if (allConfirmed) {
          // Ready for authorization
          txn.status = "preauth"
        }

        mockGroupTransactions.set(groupId, transactions)
        return txn
      }
    }
  }
  return null
}

export function getGroupTransaction(transactionId: string): GroupTransaction | null {
  for (const transactions of mockGroupTransactions.values()) {
    const txn = transactions.find((t) => t.id === transactionId)
    if (txn) return txn
  }
  return null
}
