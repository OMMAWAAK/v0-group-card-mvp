"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react"
import type { GroupTransaction } from "@/lib/types"

export function GroupTransactionHistory({ transactions }: { transactions: GroupTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No transactions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use the simulator above to test your first split-tender transaction
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn) => (
        <Card key={txn.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold">{txn.merchant}</p>
              <p className="text-sm text-muted-foreground">{new Date(txn.timestamp).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">${(txn.totalCents / 100).toFixed(2)}</p>
              <Badge
                variant={
                  txn.status === "captured"
                    ? "default"
                    : txn.status === "approved"
                      ? "secondary"
                      : txn.status === "declined"
                        ? "destructive"
                        : "outline"
                }
              >
                {txn.status}
              </Badge>
            </div>
          </div>

          {/* Member Holds */}
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">Member Splits:</p>
            {txn.memberHolds.map((hold) => (
              <div key={hold.memberId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {hold.status === "captured" && <CheckCircle className="h-3 w-3 text-green-600" />}
                  {hold.status === "authorized" && <Clock className="h-3 w-3 text-yellow-600" />}
                  {hold.status === "failed" && <XCircle className="h-3 w-3 text-red-600" />}
                  {hold.status === "released" && <DollarSign className="h-3 w-3 text-gray-400" />}
                  <span className="text-muted-foreground">{hold.memberName}</span>
                </div>
                <span className="font-medium">${(hold.amountCents / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {txn.authCode && (
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Auth Code: <span className="font-mono">{txn.authCode}</span>
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
