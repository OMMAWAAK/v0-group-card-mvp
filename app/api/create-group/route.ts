export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { createGroup } from "@/lib/mock-database"
import type { GroupMember } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, groupName, members } = body as { name?: string; groupName?: string; members: GroupMember[] }

    const finalName = name || groupName

    if (!finalName || !members || members.length === 0) {
      return NextResponse.json({ error: "Group name and members are required" }, { status: 400 })
    }

    const invalidMembers = members.filter((m) => !m.paymentMethodId)
    if (invalidMembers.length > 0) {
      return NextResponse.json({ error: "All members must have a payment method linked" }, { status: 400 })
    }

    const processedMembers = members.map((m, index) => ({
      ...m,
      id: m.id || `mem_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`,
      paymentMethodId: m.paymentMethodId || `pm_card_visa_${index}`, // Auto-generate for demo
    }))

    const group = createGroup({ name: finalName, members: processedMembers })

    console.log("[v0] Group created successfully:", group.id)
    return NextResponse.json({ group })
  } catch (error) {
    console.error("[v0] Error creating group:", error)
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
  }
}
