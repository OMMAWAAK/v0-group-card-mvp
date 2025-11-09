import { Card } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { TrendingDown, TrendingUp, Activity } from "lucide-react"

interface QuickStatsProps {
  transactions: Transaction[]
}

export function QuickStats({ transactions }: QuickStatsProps) {
  const approved = transactions.filter((t) => t.status === "approved")
  const declined = transactions.filter((t) => t.status === "declined")

  const totalSpent = approved.reduce((sum, t) => (t.type === "auth" || t.type === "capture" ? sum + t.amount : sum), 0)

  const thisMonth = approved
    .filter((t) => {
      const txDate = new Date(t.timestamp)
      const now = new Date()
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">${thisMonth.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Declined</p>
            <p className="text-2xl font-bold">{declined.length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
