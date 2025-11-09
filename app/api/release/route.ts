export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getGroup, getGroupTransactions, updateGroupTransaction } from "@/lib/mock-database"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, transactionId } = body as { groupId: string; transactionId: string }

    console.log("[v0] Releasing transaction:", { groupId, transactionId })

    if (!groupId || !transactionId) {
      return NextResponse.json({ error: "Group ID and transaction ID are required" }, { status: 400 })
    }

    const group = getGroup(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const transactions = getGroupTransactions(groupId)
    const transaction = transactions.find((t) => t.id === transactionId)
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Cancel all authorized holds
    const releasePromises = transaction.memberHolds
      .filter((h) => (h.status === "authorized" || h.status === "pending") && h.paymentIntentId)
      .map(async (hold) => {
        try {
          await stripe.paymentIntents.cancel(hold.paymentIntentId)
          hold.status = "released"
          console.log("[v0] Released hold:", hold.paymentIntentId)
        } catch (error) {
          console.error("[v0] Failed to release hold:", hold.paymentIntentId, error)
        }
      })

    await Promise.all(releasePromises)

    // Update transaction status
    updateGroupTransaction(groupId, transactionId, {
      status: "released",
      memberHolds: transaction.memberHolds,
    })

    return NextResponse.json({
      success: true,
      transaction: {
        ...transaction,
        status: "released",
      },
    })
  } catch (error) {
    console.error("[v0] Error releasing transaction:", error)
    return NextResponse.json({ error: "Failed to release transaction" }, { status: 500 })
  }
}
