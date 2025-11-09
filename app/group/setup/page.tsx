"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Plus, X, Loader2, Zap } from "lucide-react"
import { createNewGroup } from "@/app/actions/group"
import type { GroupMember } from "@/lib/types"

export default function GroupSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [members, setMembers] = useState<Omit<GroupMember, "id" | "paymentMethodId">[]>([
    { name: "Alice Smith", email: "alice@example.com", isLinked: true },
    { name: "Bob Johnson", email: "bob@example.com", isLinked: true },
    { name: "Carol Davis", email: "carol@example.com", isLinked: true },
  ])

  const loadWaterDemo = () => {
    setGroupName("Water Case Demo Group")
    setMembers([
      { name: "Olma", email: "olma@demo.com", isLinked: true },
      { name: "Noah", email: "noah@demo.com", isLinked: true },
      { name: "Hashim", email: "hashim@demo.com", isLinked: true },
    ])
  }

  const addMember = () => {
    setMembers([...members, { name: "", email: "", isLinked: false }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: "name" | "email", value: string) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock: Generate payment method IDs for demo
      const membersWithPayment: GroupMember[] = members.map((m, i) => ({
        id: `mem_${Date.now()}_${i}`,
        ...m,
        paymentMethodId: `pm_card_visa`,
        isLinked: true,
      }))

      await createNewGroup({
        name: groupName,
        members: membersWithPayment,
      })

      router.push("/group")
    } catch (error) {
      console.error("[v0] Error creating group:", error)
      alert("Failed to create group")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Create Group</h1>
            <p className="text-sm text-muted-foreground">Setup your split-tender group</p>
          </div>
        </div>

        <div className="mb-6">
          <Button type="button" onClick={loadWaterDemo} variant="outline" className="w-full bg-transparent" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Load Water Case Demo (Olma, Noah, Hashim)
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="e.g., Weekend Trip, Roommates"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Group Members</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMember}>
                <Plus className="h-4 w-4 mr-1" />
                Add Member
              </Button>
            </div>

            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={member.email}
                    onChange={(e) => updateMember(index, "email", e.target.value)}
                    required
                  />
                  {members.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading || members.length === 0} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Group...
              </>
            ) : (
              "Create Group & Start Testing"
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This is a demo environment. Payment methods are simulated using Stripe test cards. In
            production, each member would link their real bank account via Plaid before being added to the group.
          </p>
        </div>
      </Card>
    </div>
  )
}
