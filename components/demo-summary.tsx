import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

export function DemoSummary() {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-600">Demo Summary</Badge>
          <h3 className="font-semibold">How GroupCard Works</h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Single Merchant Authorization</p>
              <p className="text-muted-foreground">
                Merchant sees one card and one $18 authorization, never multiple cards
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Backend Split Holds</p>
              <p className="text-muted-foreground">
                System creates three $6 Stripe PaymentIntents with manual capture for each member
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">All-or-Nothing Logic</p>
              <p className="text-muted-foreground">
                Merchant approved only if all three holds succeed. Any failure declines and cancels all holds
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Capture or Release</p>
              <p className="text-muted-foreground">
                Merchant can capture to charge all members or never capture to release all holds
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t mt-4">
          <p className="text-xs text-muted-foreground">
            All payment processing uses Stripe with Node.js runtime. No Edge runtime for payment operations.
          </p>
        </div>
      </div>
    </Card>
  )
}
