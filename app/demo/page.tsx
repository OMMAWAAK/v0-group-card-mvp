"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, ShoppingCart, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

interface MemberHoldStatus {
  name: string
  amountCents: number
  status: "pending" | "authorized" | "failed"
}

export default function DemoPage() {
  const [step, setStep] = useState<"intro" | "tap" | "holds" | "approved" | "declined" | "captured" | "released">(
    "intro",
  )
  const [memberHolds, setMemberHolds] = useState<MemberHoldStatus[]>([
    { name: "Olma", amountCents: 600, status: "pending" },
    { name: "Noah", amountCents: 600, status: "pending" },
    { name: "Hashim", amountCents: 600, status: "pending" },
  ])
  const [merchantStatus, setMerchantStatus] = useState<"pending" | "approved" | "declined">("pending")
  const [simulateDecline, setSimulateDecline] = useState(false)

  const resetDemo = () => {
    setStep("intro")
    setMemberHolds([
      { name: "Olma", amountCents: 600, status: "pending" },
      { name: "Noah", amountCents: 600, status: "pending" },
      { name: "Hashim", amountCents: 600, status: "pending" },
    ])
    setMerchantStatus("pending")
    setSimulateDecline(false)
  }

  const handleTapCard = async () => {
    setStep("tap")
    await new Promise((resolve) => setTimeout(resolve, 800))

    setStep("holds")
    for (let i = 0; i < memberHolds.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMemberHolds((prev) =>
        prev.map((hold, index) => {
          if (index === i) {
            if (simulateDecline && hold.name === "Noah") {
              return { ...hold, status: "failed" as const }
            }
            return { ...hold, status: "authorized" as const }
          }
          return hold
        }),
      )
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    const allAuthorized = !simulateDecline
    if (allAuthorized) {
      setMerchantStatus("approved")
      setStep("approved")
    } else {
      setMerchantStatus("declined")
      setStep("declined")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMemberHolds((prev) => prev.map((hold) => ({ ...hold, status: "pending" as const })))
    }
  }

  const handleCapture = async () => {
    setStep("captured")
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMemberHolds((prev) => prev.map((hold) => ({ ...hold, status: "authorized" as const })))
  }

  const handleRelease = async () => {
    setStep("released")
    await new Promise((resolve) => setTimeout(resolve, 800))
    setMemberHolds((prev) => prev.map((hold) => ({ ...hold, status: "pending" as const })))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">How GroupCard Works</h1>
                <p className="text-sm text-muted-foreground">The Water Case Demo</p>
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
        <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">The Scenario</h2>
              <p className="text-balance">
                Olma, Noah, and Hashim are buying a case of water for $18. They want to split the cost equally, so each
                person pays $6. Olma taps the GroupCard at the store.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Demo Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={resetDemo} variant="outline" className="w-full bg-transparent">
              Start Water Case Demo
            </Button>
            <Button onClick={handleTapCard} disabled={step !== "intro" && step !== "declined"} className="w-full">
              Tap GroupCard
            </Button>
            <Button
              onClick={() => {
                setSimulateDecline(true)
                resetDemo()
              }}
              variant="destructive"
              className="w-full"
            >
              Simulate Decline
            </Button>
            <Button onClick={handleCapture} disabled={step !== "approved"} variant="default" className="w-full">
              Merchant Captures
            </Button>
            <Button onClick={handleRelease} disabled={step !== "approved"} variant="secondary" className="w-full">
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
              <span className="font-medium">Authorization Status:</span>
              <span className="text-xl font-bold">
                {merchantStatus === "approved" && "Approved"}
                {merchantStatus === "declined" && "Declined"}
                {merchantStatus === "pending" && "Waiting..."}
              </span>
            </div>
          </div>

          {step === "captured" && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-950/20 border border-green-500 rounded-lg">
              <p className="text-sm font-medium text-center text-balance">Transaction captured. All members charged.</p>
            </div>
          )}

          {step === "released" && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-500 rounded-lg">
              <p className="text-sm font-medium text-center text-balance">
                Merchant never captured. All holds released.
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <h3 className="font-semibold">Backend Split Holds</h3>
            <Badge variant="outline">Hidden from Merchant</Badge>
          </div>

          {step === "tap" && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-300 rounded-lg mb-4">
              <p className="text-sm text-center font-medium text-balance">
                Olma tapped the GroupCard. Backend is splitting $18 three ways...
              </p>
            </div>
          )}

          <div className="space-y-3">
            {memberHolds.map((hold) => (
              <div key={hold.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {hold.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{hold.name}</p>
                    <p className="text-sm text-muted-foreground">${(hold.amountCents / 100).toFixed(2)} hold</p>
                  </div>
                </div>
                <Badge
                  variant={
                    hold.status === "authorized" ? "default" : hold.status === "failed" ? "destructive" : "secondary"
                  }
                >
                  {hold.status === "authorized" && <CheckCircle className="mr-1 h-3 w-3" />}
                  {hold.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                  {hold.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                  {hold.status.charAt(0).toUpperCase() + hold.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>

          {step === "holds" && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-300 rounded-lg">
              <p className="text-sm text-center text-balance">Creating individual $6 authorization holds...</p>
            </div>
          )}

          {step === "approved" && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-950/20 border border-green-500 rounded-lg">
              <p className="text-sm font-medium text-center text-balance">
                All holds succeeded. Merchant approved. Waiting for capture...
              </p>
            </div>
          )}

          {step === "declined" && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-950/20 border border-red-500 rounded-lg">
              <p className="text-sm font-medium text-center text-balance">
                One hold failed. Merchant authorization declined. All successful holds canceled.
              </p>
            </div>
          )}

          {step === "captured" && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-950/20 border border-green-500 rounded-lg">
              <p className="text-sm font-medium text-center text-balance">All holds captured. Each member paid $6.</p>
            </div>
          )}

          {step === "released" && (
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-500 rounded-lg">
              <p className="text-sm font-medium text-center text-balance">All holds released. No charges made.</p>
            </div>
          )}
        </Card>

        <Card className="p-6 mt-6 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold mb-4">How It Works</h3>
          <ol className="space-y-3 list-decimal list-inside text-sm">
            <li className={step === "intro" ? "font-semibold" : ""}>Olma taps the GroupCard at the merchant.</li>
            <li className={step === "tap" ? "font-semibold" : ""}>The merchant requests $18 for the water case.</li>
            <li className={step === "holds" ? "font-semibold" : ""}>
              Backend splits the charge three ways and creates $6 holds for each member.
            </li>
            <li className={step === "approved" || step === "declined" ? "font-semibold" : ""}>
              If all holds succeed, merchant sees approved. If any fail, merchant sees declined.
            </li>
            <li className={step === "captured" ? "font-semibold" : ""}>
              When merchant captures, each member is charged their $6 share.
            </li>
            <li className={step === "released" ? "font-semibold" : ""}>
              If merchant never captures, all holds are released after timeout.
            </li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
