export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getGroup, addGroupTransaction } from "@/lib/mock-database"
import type { MemberHold, MemberConfirmation } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { groupId, totalCents, merchant, confirmations, skipConfirmations } = body as {
      groupId: string
      totalCents: number
      merchant: string
      confirmations?: MemberConfirmation[]
      skipConfirmations?: boolean
    }

    console.log("[v0] Simulating tap:", { groupId, totalCents, merchant })

    if (!groupId || !totalCents || !merchant) {
      return NextResponse.json({ error: "Group ID, total amount, and merchant are required" }, { status: 400 })
    }

    const group = getGroup(groupId)
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    const initialConfirmations: MemberConfirmation[] =
      confirmations ||
      group.members.map((member) => ({
        memberId: member.id,
        memberName: member.name,
        confirmed: skipConfirmations || false,
        declined: false,
      }))

    const allConfirmed = initialConfirmations.every((c) => c.confirmed)
    const anyDeclined = initialConfirmations.some((c) => c.declined)

    // If not all confirmed yet, return transaction in awaiting_confirmations state
    if (!skipConfirmations && (!allConfirmed || anyDeclined)) {
      const transaction = addGroupTransaction(groupId, {
        groupId,
        totalCents,
        merchant,
        merchantAuthStatus: anyDeclined ? "declined" : "pending",
        confirmations: initialConfirmations,
        memberHolds: [],
        status: anyDeclined ? "declined" : "awaiting_confirmations",
        timestamp: new Date(),
      })

      console.log("[v0] Waiting for confirmations")
      return NextResponse.json({
        transaction,
        merchantAuthStatus: anyDeclined ? "declined" : "pending",
        awaitingConfirmations: true,
      })
    }

    console.log("[v0] All members confirmed, creating holds")

    // Calculate equal split
    const memberCount = group.members.length
    const splitAmountCents = Math.floor(totalCents / memberCount)
    const remainder = totalCents - splitAmountCents * memberCount

    console.log("[v0] Split calculation:", { memberCount, splitAmountCents, remainder })

    // Create payment intents for each member in parallel
    const memberHolds: MemberHold[] = []
    const paymentIntentPromises = group.members.map(async (member, index) => {
      // Add remainder to first member
      const amount = index === 0 ? splitAmountCents + remainder : splitAmountCents

      console.log("[v0] Creating PaymentIntent for member:", member.name, amount)

      try {
        // Create PaymentIntent with manual capture
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "usd",
          payment_method: member.paymentMethodId,
          capture_method: "manual",
          confirm: true,
          metadata: {
            groupId,
            memberId: member.id,
            memberName: member.name,
            merchant,
          },
        })

        console.log("[v0] PaymentIntent created:", paymentIntent.id, paymentIntent.status)

        const hold: MemberHold = {
          memberId: member.id,
          memberName: member.name,
          amountCents: amount,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status === "requires_capture" ? "authorized" : "failed",
        }

        return hold
      } catch (error) {
        console.error("[v0] Failed to create PaymentIntent for member:", member.name, error)
        const hold: MemberHold = {
          memberId: member.id,
          memberName: member.name,
          amountCents: amount,
          paymentIntentId: "",
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        }
        return hold
      }
    })

    const holds = await Promise.all(paymentIntentPromises)
    memberHolds.push(...holds)

    // Check if all holds succeeded
    const allAuthorized = memberHolds.every((h) => h.status === "authorized")
    const merchantAuthStatus = allAuthorized ? "approved" : "declined"

    console.log("[v0] All holds result:", { allAuthorized, merchantAuthStatus })

    // If any failed, cancel all successful holds
    if (!allAuthorized) {
      console.log("[v0] Canceling successful holds due to failure")
      const cancelPromises = memberHolds
        .filter((h) => h.status === "authorized" && h.paymentIntentId)
        .map(async (hold) => {
          try {
            await stripe.paymentIntents.cancel(hold.paymentIntentId)
            hold.status = "released"
            console.log("[v0] Canceled hold:", hold.paymentIntentId)
          } catch (error) {
            console.error("[v0] Failed to cancel hold:", hold.paymentIntentId, error)
          }
        })

      await Promise.all(cancelPromises)
    }

    // Store transaction
    const transaction = addGroupTransaction(groupId, {
      groupId,
      totalCents,
      merchant,
      merchantAuthStatus,
      confirmations: initialConfirmations,
      memberHolds,
      status: allAuthorized ? "approved" : "declined",
      timestamp: new Date(),
      authCode: allAuthorized ? `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined,
    })

    return NextResponse.json({
      transaction,
      merchantAuthStatus,
      memberHolds,
    })
  } catch (error) {
    console.error("[v0] Error simulating tap:", error)
    return NextResponse.json({ error: "Failed to simulate transaction" }, { status: 500 })
  }
}
