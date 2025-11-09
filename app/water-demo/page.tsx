"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react"
import Link from "next/link"

interface MemberHoldDisplay {
  name: string
  amountCents: number
  status: "pending" | "authorized" | "failed" | "captured" | "released"
  paymentIntentId?: string
}

export default function WaterDemoPage() {
  const [demoState, setDemoState] = useState<
    "ready" | "tapping" | "processing" | "approved" | "declined" | "captured" | "released"
  >("ready")
  const [groupId, setGroupId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [memberHolds, setMemberHolds] = useState<MemberHoldDisplay[]>([
    { name: "Olma", amountCents: 600, status: "pending" },
    { name: "Noah", amountCents: 600, status: "pending" },
    { name: "Hashim", amountCents: 600, status: "pending" },
  ])
  const [merchantStatus, setMerchantStatus] = useState<"pending" | "approved" | "declined">("pending")
  const [forceDeclineMember, setForceDeclineMember] = useState<string | null>(null)

  const startDemo = async () => {
    // Create demo group with test payment methods
    const response = await fetch("/api/create-group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Water Case Demo Group",
        members: [
          { name: "Olma", email: "olma@demo.com", paymentMethodId: "pm_card_visa" },
          { name: "Noah", email: "noah@demo.com", paymentMethodId: "pm_card_visa" },
          { name: "Hashim", email: "hashim@demo.com", paymentMethodId: "pm_card_visa" },
        ],
      }),
    })

    const data = await response.json()
    setGroupId(data.group.id)
    setDemoState("ready")
    setMemberHolds([
      { name: "Olma", amountCents: 600, status: "pending" },
      { name: "Noah", amountCents: 600, status: "pending" },
      { name: "Hashim", amountCents: 600, status: "pending" },
    ])
    setMerchantStatus("pending")
  }

  const tapCard = async () => {
    if (!groupId) return

    setDemoState("tapping")
    await new Promise((resolve) => setTimeout(resolve, 800))

    setDemoState("processing")

    // Call simulate-tap API
    const response = await fetch("/api/simulate-tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        totalCents: 1800,
        merchant: "Corner Store",
        forceDecline: forceDeclineMember,
      }),
    })

    const data = await response.json()
    setTransactionId(data.transaction.id)

    // Update member holds with real data
    const holds: MemberHoldDisplay[] = data.memberHolds.map((h: any) => ({
      name: h.memberName,
      amountCents: h.amountCents,
      status: h.status,
      paymentIntentId: h.paymentIntentId,
    }))

    setMemberHolds(holds)
    setMerchantStatus(data.merchantAuthStatus)
    setDemoState(data.merchantAuthStatus === "approved" ? "approved" : "declined")
  }

  const captureTransaction = async () => {
    if (!groupId || !transactionId) return

    const response = await fetch("/api/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, transactionId }),
    })

    const data = await response.json()
    setMemberHolds((prev) => prev.map((h) => ({ ...h, status: "captured" })))
    setDemoState("captured")
  }

  const releaseHolds = async () => {
    if (!groupId || !transactionId) return

    const response = await fetch("/api/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, transactionId }),
    })

    const data = await response.json()
    setMemberHolds((prev) => prev.map((h) => ({ ...h, status: "released" })))
    setDemoState("released")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GroupCard Live Demo</h1>
                <p className="text-sm text-muted-foreground">Real Stripe Integration</p>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">The Water Case Demo</h2>
              <p className="text-balance">
                Olma, Noah, and Hashim are buying a case of water for $18. Each person will pay $6 using real Stripe
                payment holds.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Demo Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={startDemo} variant="outline" className="w-full bg-transparent" disabled={groupId !== null}>
              {groupId ? "Demo Group Created" : "Start Water Case Demo"}
            </Button>
            <Button onClick={tapCard} disabled={demoState !== "ready" && demoState !== "declined"} className="w-full">
              Tap GroupCard ($18)
            </Button>
            <Button
              onClick={() => {
                setForceDeclineMember("member_2")
                if (groupId) tapCard()
              }}
              variant="destructive"
              className="w-full"
              disabled={demoState !== "ready"}
            >
              Simulate Decline (Noah Fails)
            </Button>
            <Button onClick={captureTransaction} disabled={demoState !== "approved"} className="w-full">
              Merchant Captures
            </Button>
            <Button onClick={releaseHolds} disabled={demoState !== "approved"} variant="secondary" className="w-full">
              Merchant Never Captures
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-6 border-2 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <h3 className="font-semibold">Merchant View: One Authorization Only</h3>
            </div>
            <Badge
              variant={
                merchantStatus === "approved" ? "default" : merchantStatus === "declined" ? "destructive" : "secondary"
              }
            >
              {merchantStatus === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
              {merchantStatus === "declined" && <XCircle className="mr-1 h-3 w-3" />}
              {merchantStatus === "pending" && <Clock className="mr-1 h-3 w-3" />}
              {merchantStatus.charAt(0).toUpperCase() + merchantStatus.slice(1)}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Merchant Sees:</span>
              <span className="text-xl font-bold">One Card</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Total Amount:</span>
              <span className="text-xl font-bold">$18.00</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Authorization:</span>
              <span className="text-xl font-bold">
                {merchantStatus === "approved" && "Approved"}
                {merchantStatus === "declined" && "Declined"}
                {merchantStatus === "pending" && "Waiting..."}
              </span>
            </div>
          </div>

          {demoState === "captured" && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-950/20 border border-green-500 rounded-lg">
              <p className="text-sm font-medium text-center">Transaction captured successfully.</p>
            </div>
          )}

          {demoState === "released" && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-500 rounded-lg">
              <p className="text-sm font-medium text-center">All holds released.</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h3 className="font-semibold">Backend Split Holds</h3>
            <Badge variant="outline">Hidden from Merchant</Badge>
          </div>

          <div className="space-y-3">
            {memberHolds.map((hold) => (
              <div key={hold.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {hold.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{hold.name}</p>
                    <p className="text-sm text-muted-foreground">${(hold.amountCents / 100).toFixed(2)}</p>
                    {hold.paymentIntentId && (
                      <p className="text-xs text-muted-foreground font-mono">{hold.paymentIntentId}</p>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    hold.status === "authorized" || hold.status === "captured"
                      ? "default"
                      : hold.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {(hold.status === "authorized" || hold.status === "captured") && (
                    <CheckCircle className="mr-1 h-3 w-3" />
                  )}
                  {hold.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                  {hold.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {hold.status.charAt(0).toUpperCase() + hold.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>

          {demoState === "processing" && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-300 rounded-lg">
              <p className="text-sm text-center">Creating $6 authorization holds via Stripe...</p>
            </div>
          )}

          {demoState === "approved" && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-950/20 border border-green-500 rounded-lg">
              <p className="text-sm font-medium text-center">All holds authorized. Waiting for capture...</p>
            </div>
          )}

          {demoState === "declined" && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-950/20 border border-red-500 rounded-lg">
              <p className="text-sm font-medium text-center">
                At least one hold failed. All successful holds canceled.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
