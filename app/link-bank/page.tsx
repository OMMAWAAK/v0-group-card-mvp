import { redirect } from "next/navigation"
import { getCurrentAccount, getLinkedBanks } from "@/app/actions/account"
import { BankLinkForm } from "@/components/bank-link-form"
import { LinkedBanksList } from "@/components/linked-banks-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function LinkBankPage() {
  const account = await getCurrentAccount()

  if (!account) {
    redirect("/onboarding")
  }

  const linkedBanks = await getLinkedBanks()

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
                <p className="text-sm text-muted-foreground">Bank Account Linking</p>
              </div>
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          <BankLinkForm />
          <LinkedBanksList banks={linkedBanks} />
        </div>
      </div>
    </div>
  )
}
