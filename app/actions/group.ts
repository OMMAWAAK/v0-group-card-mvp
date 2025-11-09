"use server"

import { cookies } from "next/headers"
import { createGroup, getGroup, getGroupTransactions } from "@/lib/mock-database"
import type { GroupMember } from "@/lib/types"

export async function createNewGroup(data: { name: string; members: GroupMember[] }) {
  const group = createGroup({
    name: data.name,
    members: data.members,
  })

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("groupcard_group_id", group.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })

  return group
}

export async function getCurrentGroup() {
  const cookieStore = await cookies()
  const groupId = cookieStore.get("groupcard_group_id")?.value

  if (!groupId) return null

  return getGroup(groupId)
}

export async function getGroupTransactionHistory() {
  const group = await getCurrentGroup()
  if (!group) return []

  return getGroupTransactions(group.id)
}
