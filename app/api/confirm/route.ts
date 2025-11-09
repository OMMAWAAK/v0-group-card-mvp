export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { updateTransactionConfirmation } from "@/lib/mock-database"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionId, memberId, confirmed } = body as {
      transactionId: string
      memberId: string
      confirmed: boolean
    }

    console.log("[v0] Member confirmation:", { transactionId, memberId, confirmed })

    if (!transactionId || !memberId || confirmed === undefined) {
      return NextResponse.json(
        { error: "Transaction ID, member ID, and confirmed status are required" },
        { status: 400 },
      )
    }

    const transaction = updateTransactionConfirmation(transactionId, memberId, confirmed)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("[v0] Error recording confirmation:", error)
    return NextResponse.json({ error: "Failed to record confirmation" }, { status: 500 })
  }
}
