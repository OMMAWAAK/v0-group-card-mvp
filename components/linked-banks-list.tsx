import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LinkedBankAccount } from "@/lib/types"
import { Building2, Check, Clock, XCircle } from "lucide-react"

interface LinkedBanksListProps {
  banks: LinkedBankAccount[]
}

export function LinkedBanksList({ banks }: LinkedBanksListProps) {
  if (banks.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Linked Accounts</h3>

      <div className="space-y-3">
        {banks.map((bank) => {
          const statusConfig = {
            linked: { icon: Check, color: "bg-green-500/10 text-green-700 dark:text-green-400", label: "Linked" },
            pending: { icon: Clock, color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400", label: "Pending" },
            failed: { icon: XCircle, color: "bg-red-500/10 text-red-700 dark:text-red-400", label: "Failed" },
          }[bank.status]

          const StatusIcon = statusConfig.icon

          return (
            <Card key={bank.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{bank.bankName}</p>
                    <p className="text-sm text-muted-foreground">••••{bank.last4}</p>
                  </div>
                </div>

                <Badge className={statusConfig.color} variant="secondary">
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {statusConfig.label}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Linked on {new Date(bank.linkedAt).toLocaleDateString()}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
