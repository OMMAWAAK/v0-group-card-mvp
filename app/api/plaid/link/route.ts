export const runtime = "nodejs"

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, accountNumber, routingNumber } = body

    if (!memberId || !accountNumber || !routingNumber) {
      return NextResponse.json({ error: "Member ID, account number, and routing number are required" }, { status: 400 })
    }

    // Mock Plaid sandbox - in production this would call Plaid API
    // For now, just return success
    const mockPaymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return NextResponse.json({
      success: true,
      paymentMethodId: mockPaymentMethodId,
      last4: accountNumber.slice(-4),
      status: "linked",
    })
  } catch (error) {
    console.error("[v0] Error linking bank account:", error)
    return NextResponse.json({ error: "Failed to link bank account" }, { status: 500 })
  }
}
