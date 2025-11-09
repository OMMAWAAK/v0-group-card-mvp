import { redirect } from "next/navigation"
import { getCurrentGroup, getGroupTransactionHistory } from "@/app/actions/group"
import { GroupTransactionSimulator } from "@/components/group-transaction-simulator"
import { GroupTransactionHistory } from "@/components/group-transaction-history"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function GroupPage() {
  const group = await getCurrentGroup()

  if (!group) {
    redirect("/group/setup")
  }

  const transactions = await getGroupTransactionHistory()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{group.name}</h1>
                <p className="text-sm text-muted-foreground">Split-Tender Simulator</p>
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Group Members Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Group Members</h2>
            <Badge variant="secondary">{group.members.length} members</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {group.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant={member.isLinked ? "default" : "secondary"}>
                  {member.isLinked ? "Linked" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <GroupTransactionSimulator group={group} />

        {/* Transaction History */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
          <GroupTransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  )
}
