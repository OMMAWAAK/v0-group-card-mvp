import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Plus } from "lucide-react"

interface BalanceCardProps {
  balance: number
  accountHolder: string
}

export function BalanceCard({ balance, accountHolder }: BalanceCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Available Balance</p>
            <h2 className="text-4xl font-bold mt-1">${balance.toFixed(2)}</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="pt-2 border-t border-white/20">
          <p className="text-sm opacity-90">Card Holder</p>
          <p className="font-medium">{accountHolder}</p>
        </div>

        <Button variant="secondary" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Funds
        </Button>
      </div>
    </Card>
  )
}
