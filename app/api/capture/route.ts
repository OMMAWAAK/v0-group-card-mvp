export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getGroup, getGroupTransactions, updateGroupTransaction } from "@/lib/mock-database"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, transactionId } = body as { groupId: string; transactionId: string }

    console.log("[v0] Capturing transaction:", { groupId, transactionId })

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

    if (transaction.status !== "approved") {
      return NextResponse.json({ error: "Transaction must be in approved state to capture" }, { status: 400 })
    }

    // Capture all authorized holds
    const capturePromises = transaction.memberHolds
      .filter((h) => h.status === "authorized" && h.paymentIntentId)
      .map(async (hold) => {
        try {
          const captured = await stripe.paymentIntents.capture(hold.paymentIntentId)
          hold.status = "captured"
          console.log("[v0] Captured hold:", hold.paymentIntentId, captured.status)
        } catch (error) {
          console.error("[v0] Failed to capture hold:", hold.paymentIntentId, error)
          throw error
        }
      })

    await Promise.all(capturePromises)

    // Update transaction status
    updateGroupTransaction(groupId, transactionId, {
      status: "captured",
      memberHolds: transaction.memberHolds,
    })

    return NextResponse.json({
      success: true,
      transaction: {
        ...transaction,
        status: "captured",
      },
    })
  } catch (error) {
    console.error("[v0] Error capturing transaction:", error)
    return NextResponse.json({ error: "Failed to capture transaction" }, { status: 500 })
  }
}
