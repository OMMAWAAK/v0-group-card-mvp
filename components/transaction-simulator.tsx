"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, CheckCircle, XCircle, Store } from "lucide-react"
import { simulateTransaction } from "@/app/actions/account"
import { useRouter } from "next/navigation"

const MERCHANT_PRESETS = [
  { name: "Starbucks", amount: 5.5 },
  { name: "Amazon", amount: 49.99 },
  { name: "Uber", amount: 18.75 },
  { name: "Netflix", amount: 15.99 },
  { name: "Target", amount: 67.32 },
  { name: "Gas Station", amount: 45.0 },
]

interface TransactionResult {
  success: boolean
  status: "approved" | "declined"
  authCode?: string
  message: string
}

export function TransactionSimulator({ currentBalance }: { currentBalance: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [formData, setFormData] = useState({
    merchant: "",
    amount: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const amount = Number.parseFloat(formData.amount)

      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount")
      }

      const transaction = await simulateTransaction({
        merchant: formData.merchant,
        amount,
      })

      setResult({
        success: transaction.status === "approved",
        status: transaction.status,
        authCode: transaction.authCode,
        message:
          transaction.status === "approved"
            ? `Transaction approved! Your new balance is $${(currentBalance - amount).toFixed(2)}`
            : "Transaction declined due to insufficient funds",
      })

      // Refresh the page to show updated balance and transactions
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      setResult({
        success: false,
        status: "declined",
        message: err instanceof Error ? err.message : "Transaction failed",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePresetClick = (preset: (typeof MERCHANT_PRESETS)[0]) => {
    setFormData({
      merchant: preset.name,
      amount: preset.amount.toString(),
    })
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Transaction Simulator</h2>
            <p className="text-sm text-muted-foreground">Test your card with simulated purchases</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Balance</span>
            <span className="text-lg font-bold">${currentBalance.toFixed(2)}</span>
          </div>
        </div>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            <div className="flex items-center gap-2">
              {result.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5" />}
              <AlertDescription>
                <div>
                  <p className="font-medium">{result.message}</p>
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
              placeholder="e.g., Starbucks, Amazon"
              value={formData.merchant}
              onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Transaction...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Simulate Transaction
              </>
            )}
          </Button>
        </form>
      </Card>

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

      <div className="p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>How it works:</strong> Enter a merchant name and amount to simulate a card transaction. The system
          will check your balance and either approve or decline the transaction. All approved transactions will deduct
          from your balance and appear in your transaction history.
        </p>
      </div>
    </div>
  )
}
