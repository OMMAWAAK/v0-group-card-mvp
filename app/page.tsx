import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Users, Shield, Zap, Presentation } from "lucide-react"
import { getCurrentGroup } from "./actions/group"

export default async function HomePage() {
  const group = await getCurrentGroup()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CreditCard className="h-8 w-8" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-balance">Shared Spending Made Simple</h1>

          <p className="text-xl text-muted-foreground text-balance">
            GroupCard splits purchases in real-time. One card tap, individual confirmations, instant settlement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/demo-mode">
                <Presentation className="mr-2 h-5 w-5" />
                Start Demo Mode
              </Link>
            </Button>

            {group ? (
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/group">
                  <Users className="mr-2 h-5 w-5" />
                  View My Group
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/group/setup">
                  <Users className="mr-2 h-5 w-5" />
                  Create Group
                </Link>
              </Button>
            )}
          </div>

          <div className="pt-6">
            <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 text-balance">
                See how Olma, Noah, and Hashim split $18 for water - one merchant authorization with member
                confirmations and backend split holds
              </p>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Group Confirmations</h3>
            <p className="text-sm text-muted-foreground">
              Every member approves purchases in real-time before authorization
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Secure Holds</h3>
            <p className="text-sm text-muted-foreground">Individual authorization holds on each member's linked card</p>
          </Card>

          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Instant Settlement</h3>
            <p className="text-sm text-muted-foreground">Charges settle immediately when merchant captures</p>
          </Card>

          <Card className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">One Card Tap</h3>
            <p className="text-sm text-muted-foreground">Merchant sees single authorization, not individual cards</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
