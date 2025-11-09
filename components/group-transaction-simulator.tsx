"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, CheckCircle, XCircle, Store, Users, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Group, MemberHold, MemberConfirmation } from "@/lib/types"

const MERCHANT_PRESETS = [
  { name: "Starbucks", amount: 15.5 },
  { name: "Chipotle", amount: 42.99 },
  { name: "Movie Theater", amount: 68.75 },
  { name: "Uber", amount: 24.99 },
  { name: "Dinner Restaurant", amount: 127.5 },
  { name: "Gas Station", amount: 85.0 },
]

interface SimulationResult {
  merchantAuthStatus: "approved" | "declined" | "pending"
  memberHolds: MemberHold[]
  confirmations?: MemberConfirmation[]
  status: string
  authCode?: string
  txnId: string
}

export function GroupTransactionSimulator({ group }: { group: Group }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
  })
  const [forceDecline, setForceDecline] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const amount = Number.parseFloat(formData.amount)

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount")
      }

      const totalCents = Math.round(amount * 100)

      console.log("[v0] Simulating tap:", { totalCents, merchant: formData.merchant })

      const response = await fetch("/api/simulate-tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          totalCents,
          merchant: formData.merchant,
          forceDecline: forceDecline || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to simulate transaction")
      }

      console.log("[v0] Tap result:", data)

      setResult({
        merchantAuthStatus: data.transaction.merchantAuthStatus,
        memberHolds: data.transaction.memberHolds || [],
        confirmations: data.transaction.confirmations || [],
        status: data.transaction.status,
        authCode: data.transaction.authCode,
        txnId: data.transaction.id,
      })

      // Refresh after a moment
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (err) {
      console.error("[v0] Error simulating tap:", err)
      alert(err instanceof Error ? err.message : "Transaction failed")
    } finally {
      setLoading(false)
    }
  }

  const handleCapture = async () => {
    if (!result) return

    setCapturing(true)
    try {
      const response = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          txnId: result.txnId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to capture transaction")
      }

      alert("Transaction captured successfully! All member charges finalized.")
      setResult(null)
      router.refresh()
    } catch (err) {
      console.error("[v0] Error capturing:", err)
      alert(err instanceof Error ? err.message : "Capture failed")
    } finally {
      setCapturing(false)
    }
  }

  const handleRelease = async () => {
    if (!result) return

    setReleasing(true)
    try {
      const response = await fetch("/api/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          txnId: result.txnId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to release transaction")
      }

      alert("Transaction released! All member holds canceled.")
      setResult(null)
      router.refresh()
    } catch (err) {
      console.error("[v0] Error releasing:", err)
      alert(err instanceof Error ? err.message : "Release failed")
    } finally {
      setReleasing(false)
    }
  }

  const handlePresetClick = (preset: (typeof MERCHANT_PRESETS)[0]) => {
    setFormData({
      merchant: preset.name,
      amount: preset.amount.toString(),
    })
    setResult(null)
    setForceDecline("")
  }

  return (
    <div className="space-y-6">
      {/* Merchant View */}
      <Card className="p-6 border-2 border-primary">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-1">
              Merchant View
            </Badge>
            <h2 className="text-xl font-bold">One Authorization Only</h2>
            <p className="text-sm text-muted-foreground">Single tap results in one merchant auth decision</p>
          </div>
        </div>

        {result && (
          <Alert variant={result.merchantAuthStatus === "approved" ? "default" : "destructive"} className="mb-4">
            <div className="flex items-center gap-2">
              {result.merchantAuthStatus === "approved" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <AlertDescription>
                <div>
                  <p className="font-bold text-lg">Merchant Authorization: {result.merchantAuthStatus.toUpperCase()}</p>
                  {result.authCode && (
                    <Badge variant="outline" className="mt-2">
                      Auth Code: {result.authCode}
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="merchant">Merchant Name</Label>
            <Input
              id="merchant"
              placeholder="e.g., Starbucks, Chipotle"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Total Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Tap...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Tap GroupCard
              </>
            )}
          </Button>
        </form>

        {result && result.merchantAuthStatus === "approved" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Button onClick={handleCapture} disabled={capturing} variant="default">
              {capturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Capturing...
                </>
              ) : (
                "Capture Payment"
              )}
            </Button>
            <Button onClick={handleRelease} disabled={releasing} variant="outline">
              {releasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Releasing...
                </>
              ) : (
                "Release (Never Capture)"
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Backend Member Holds */}
      {result && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              {result.status === "awaiting_confirmations" ? (
                <>
                  <h3 className="text-lg font-semibold">Member Confirmations</h3>
                  <p className="text-sm text-muted-foreground">Waiting for {group.members.length} members to approve</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">Backend Split Holds</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.members.length} member authorizations processed in parallel
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {result.status === "awaiting_confirmations" && result.confirmations && result.confirmations.length > 0 ? (
              result.confirmations.map((confirmation) => (
                <div key={confirmation.memberId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: confirmation.confirmed
                          ? "#22c55e"
                          : confirmation.declined
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    />
                    <div>
                      <p className="font-medium">{confirmation.memberName}</p>
                      <p className="text-sm text-muted-foreground">Confirmation pending</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={confirmation.confirmed ? "default" : confirmation.declined ? "destructive" : "secondary"}
                    >
                      {confirmation.confirmed && <CheckCircle className="mr-1 h-3 w-3" />}
                      {confirmation.declined && <XCircle className="mr-1 h-3 w-3" />}
                      {!confirmation.confirmed && !confirmation.declined && <Clock className="mr-1 h-3 w-3" />}
                      {confirmation.confirmed ? "Approved" : confirmation.declined ? "Declined" : "Waiting"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : result.memberHolds && result.memberHolds.length > 0 ? (
              result.memberHolds.map((hold) => (
                <div key={hold.memberId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          hold.status === "authorized"
                            ? "#22c55e"
                            : hold.status === "failed"
                              ? "#ef4444"
                              : hold.status === "pending"
                                ? "#f59e0b"
                                : "#6b7280",
                      }}
                    />
                    <div>
                      <p className="font-medium">{hold.memberName}</p>
                      <p className="text-sm text-muted-foreground">${(hold.amountCents / 100).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        hold.status === "authorized"
                          ? "default"
                          : hold.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {hold.status === "authorized" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {hold.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                      {hold.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                      {hold.status}
                    </Badge>
                    {hold.error && <p className="text-xs text-destructive mt-1">{hold.error}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No member data available</p>
            )}
          </div>
        </Card>
      )}

      {/* Quick Merchant Presets */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Quick Test Merchants</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MERCHANT_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              onClick={() => handlePresetClick(preset)}
              disabled={loading}
              className="justify-between"
            >
              <span>{preset.name}</span>
              <span className="font-semibold">${preset.amount.toFixed(2)}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Test Controls */}
      <Card className="p-6 bg-muted">
        <h3 className="font-semibold mb-3">Test Controls</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="forceDecline">Force Member Decline (for testing)</Label>
            <select
              id="forceDecline"
              className="w-full mt-1 p-2 border rounded-md"
              value={forceDecline}
              onChange={(e) => setForceDecline(e.target.value)}
            >
              <option value="">None (all succeed)</option>
              {group.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Select a member to simulate their hold failing</p>
          </div>
        </div>
      </Card>

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>How Split-Tender Works:</strong> When you tap the GroupCard, one merchant authorization is created.
          Behind the scenes, separate Stripe authorization holds (capture_method='manual') are created for each member's
          split. If ALL member holds succeed, the merchant auth is approved. If ANY fail, the merchant auth is declined
          and all successful holds are canceled (all-or-nothing). After approval, you can either capture (finalize
          charges) or release (cancel all holds).
        </p>
      </div>
    </div>
  )
}
