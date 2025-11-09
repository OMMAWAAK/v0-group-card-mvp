import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/types"
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No transactions yet</p>
          <p className="text-sm mt-1">Your transaction history will appear here</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="divide-y">
      {transactions.map((transaction) => {
        const isDebit = transaction.type === "auth" || transaction.type === "capture"
        const statusColor =
          transaction.status === "approved"
            ? "bg-green-500/10 text-green-700 dark:text-green-400"
            : transaction.status === "declined"
              ? "bg-red-500/10 text-red-700 dark:text-red-400"
              : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"

        return (
          <div
            key={transaction.id}
            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isDebit
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "bg-green-500/10 text-green-600 dark:text-green-400"
                }`}
              >
                {isDebit ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
              </div>

              <div>
                <p className="font-medium">{transaction.merchant}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{new Date(transaction.timestamp).toLocaleString()}</p>
                  {transaction.authCode && (
                    <Badge variant="outline" className="text-xs">
                      {transaction.authCode}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`font-semibold ${isDebit ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
              >
                {isDebit ? "-" : "+"}${transaction.amount.toFixed(2)}
              </p>
              <Badge className={`${statusColor} mt-1`} variant="secondary">
                {transaction.status}
              </Badge>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
