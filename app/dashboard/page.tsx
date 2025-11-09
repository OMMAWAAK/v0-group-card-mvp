import { redirect } from "next/navigation"
import { getCurrentAccount, getAccountTransactions } from "@/app/actions/account"
import { BalanceCard } from "@/components/balance-card"
import { TransactionList } from "@/components/transaction-list"
import { QuickStats } from "@/components/quick-stats"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreditCard, Settings, LinkIcon, Users, PlayCircle, Presentation } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const account = await getCurrentAccount()

  if (!account) {
    redirect("/onboarding")
  }

  const transactions = await getAccountTransactions()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">GroupCard</h1>
                <p className="text-sm text-muted-foreground">{account.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="default" size="sm" asChild>
                <Link href="/demo-mode">
                  <Presentation className="mr-2 h-4 w-4" />
                  Demo Mode
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/demo">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Water Demo
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/group/setup">
                  <Users className="mr-2 h-4 w-4" />
                  Group Simulator
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/link-bank">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link Bank
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/simulate">
                  <Settings className="mr-2 h-4 w-4" />
                  Simulate
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">See How GroupCard Works</h3>
              <p className="text-sm text-muted-foreground">
                Watch Olma, Noah, and Hashim split $18 for a water case with one merchant authorization
              </p>
            </div>
            <Button asChild>
              <Link href="/demo-mode">
                <Presentation className="mr-2 h-4 w-4" />
                Demo Mode
              </Link>
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <BalanceCard balance={account.balance} accountHolder={`${account.firstName} ${account.lastName}`} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <QuickStats transactions={transactions} />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
              <TransactionList transactions={transactions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
