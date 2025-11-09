"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building2 } from "lucide-react"
import { linkBankAccount } from "@/app/actions/account"

export function BankLinkForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate routing number (9 digits)
      if (!/^\d{9}$/.test(formData.routingNumber)) {
        throw new Error("Routing number must be 9 digits")
      }

      // Validate account number (4-17 digits)
      if (!/^\d{4,17}$/.test(formData.accountNumber)) {
        throw new Error("Account number must be 4-17 digits")
      }

      await linkBankAccount(formData)
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link bank account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Link Your Bank Account</h2>
          <p className="text-sm text-muted-foreground">Securely connect your bank for easy funding</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            placeholder="e.g., Chase, Bank of America"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div>
          <Label htmlFor="routingNumber">Routing Number</Label>
          <Input
            id="routingNumber"
            placeholder="9 digits"
            maxLength={9}
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, "") })}
            disabled={loading}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">The 9-digit number at the bottom left of your check</p>
        </div>

        <div>
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            placeholder="4-17 digits"
            maxLength={17}
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "") })}
            disabled={loading}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">The account number from your bank statement</p>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Linking Account...
              </>
            ) : (
              "Link Bank Account"
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Demo Mode:</strong> This is a simulated bank linking process. In production, you would integrate with
          Plaid or Stripe Financial Connections for secure bank authentication.
        </p>
      </div>
    </Card>
  )
}
