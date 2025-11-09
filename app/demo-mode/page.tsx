"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check } from "lucide-react"
import Link from "next/link"

interface MemberStatus {
  memberId: string
  name: string
  amountCents: number
  confirmationStatus: "waiting" | "approved" | "declined"
  holdStatus: "none" | "pending" | "authorized" | "failed" | "captured" | "released"
}

interface EventLog {
  timestamp: string
  message: string
}

type Step = "start" | "tap" | "confirm" | "approve" | "finalize"

export default function DemoModePage() {
  const searchParams = useSearchParams()
  const isDemoParam = searchParams.get("demo") === "1"

  const [zoom, setZoom] = useState(90)
  const [compactMode, setCompactMode] = useState(true)
  const [currentStep, setCurrentStep] = useState<Step>("start")
  const [narration, setNarration] = useState("Olma, Noah, and Hashim are buying a case of water for $18.")

  const [memberStatuses, setMemberStatuses] = useState<MemberStatus[]>([
    { memberId: "", name: "Olma", amountCents: 600, confirmationStatus: "waiting", holdStatus: "none" },
    { memberId: "", name: "Noah", amountCents: 600, confirmationStatus: "waiting", holdStatus: "none" },
    { memberId: "", name: "Hashim", amountCents: 600, confirmationStatus: "waiting", holdStatus: "none" },
  ])

  const [merchantStatus, setMerchantStatus] = useState<"pending" | "approved" | "declined">("pending")
  const [groupId, setGroupId] = useState<string>("")
  const [transactionId, setTransactionId] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [eventLog, setEventLog] = useState<EventLog[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setEventLog((prev) => [{ timestamp, message }, ...prev].slice(0, 15))
  }

  const startDemo = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      setCurrentStep("start")
      setNarration("Olma, Noah, and Hashim are buying a case of water for $18.")
      setMemberStatuses([
        { memberId: "", name: "Olma", amountCents: 600, confirmationStatus: "waiting", holdStatus: "none" },
        { memberId: "", name: "Noah", amountCents: 600, confirmationStatus: "waiting", holdStatus: "none" },
        { memberId: "", name: "Hashim", amountCents: 600, confirmationStatus: "waiting", holdStatus: "none" },
      ])
      setMerchantStatus("pending")
      setTransactionId("")
      setEventLog([])

      addLog("Demo reset - Creating demo group...")

      const response = await fetch("/api/create-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName: "Water Demo Group",
          members: [
            { name: "Olma", email: "olma@demo.com" },
            { name: "Noah", email: "noah@demo.com" },
            { name: "Hashim", email: "hashim@demo.com" },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API error:", errorData)
        throw new Error(errorData.error || "Failed to create group")
      }

      const { group } = await response.json()
      console.log("[v0] Group created:", group)
      setGroupId(group.id)

      setMemberStatuses([
        {
          memberId: group.members[0].id,
          name: "Olma",
          amountCents: 600,
          confirmationStatus: "waiting",
          holdStatus: "none",
        },
        {
          memberId: group.members[1].id,
          name: "Noah",
          amountCents: 600,
          confirmationStatus: "waiting",
          holdStatus: "none",
        },
        {
          memberId: group.members[2].id,
          name: "Hashim",
          amountCents: 600,
          confirmationStatus: "waiting",
          holdStatus: "none",
        },
      ])

      addLog(`Demo group created: ${group.id}`)
      addLog("All members have preloaded cards ready")
      setNarration("Olma, Noah, and Hashim are buying a case of water for $18.")
    } catch (error) {
      console.error("[v0] Error in startDemo:", error)
      addLog("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  const tapGroupCard = async () => {
    if (isProcessing || !groupId) return
    setIsProcessing(true)

    try {
      setCurrentStep("tap")
      setNarration("Olma taps the GroupCard at Corner Store. Merchant requests $18 authorization.")
      addLog("Olma taps GroupCard at Corner Store")
      addLog("Merchant POS requests $18 authorization")

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const response = await fetch("/api/simulate-tap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          totalCents: 1800,
          merchant: "Corner Store",
        }),
      })

      if (!response.ok) throw new Error("Failed to simulate tap")

      const result = await response.json()
      console.log("[v0] Tap result:", result)

      setTransactionId(result.transaction.id)

      addLog("Backend pauses merchant authorization")
      addLog("Sending confirmation requests to all members...")

      setCurrentStep("confirm")
      setNarration('Each member sees: "Confirm your $6 share of Olma\'s $18 purchase."')

      setMerchantStatus("pending")
    } catch (error) {
      console.error("[v0] Error in tapGroupCard:", error)
      addLog("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMemberConfirm = async (memberId: string, memberName: string, approved: boolean) => {
    if (!transactionId) return

    try {
      addLog(`${memberName} ${approved ? "confirms" : "declines"} their $6 share`)

      setMemberStatuses((prev) =>
        prev.map((m) =>
          m.memberId === memberId ? { ...m, confirmationStatus: approved ? "approved" : "declined" } : m,
        ),
      )

      const response = await fetch("/api/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          memberId,
          confirmed: approved,
        }),
      })

      if (!response.ok) throw new Error("Failed to record confirmation")

      const { transaction } = await response.json()

      const allConfirmed = transaction.confirmations.every((c: any) => c.confirmed)
      const anyDeclined = transaction.confirmations.some((c: any) => c.declined)

      if (anyDeclined) {
        setCurrentStep("approve")
        setMerchantStatus("declined")
        setNarration("One member declined. The GroupCard automatically canceled the entire purchase.")
        addLog("⚠ One member declined → Transaction canceled")
        addLog("No holds created, merchant authorization DECLINED")
      } else if (allConfirmed) {
        addLog("All members approved! Creating authorization holds...")
        setNarration("All members approved! Backend creates separate $6 authorization holds.")

        const authResponse = await fetch("/api/simulate-tap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId,
            totalCents: 1800,
            merchant: "Corner Store",
            confirmations: transaction.confirmations,
            skipConfirmations: true,
          }),
        })

        if (!authResponse.ok) throw new Error("Failed to create holds")

        const authResult = await authResponse.json()
        console.log("[v0] Auth result:", authResult)

        authResult.memberHolds.forEach((hold: any) => {
          setMemberStatuses((prev) =>
            prev.map((m) => (m.memberId === hold.memberId ? { ...m, holdStatus: hold.status as any } : m)),
          )
          addLog(`${hold.memberName}'s $6 hold ${hold.status}`)
        })

        const allAuthorized = authResult.memberHolds.every((h: any) => h.status === "authorized")

        if (allAuthorized) {
          setCurrentStep("approve")
          setMerchantStatus("approved")
          setNarration("All holds succeeded → Merchant sees one APPROVED authorization.")
          addLog("✓ All member holds authorized")
          addLog("✓ Merchant authorization APPROVED")
        } else {
          setCurrentStep("approve")
          setMerchantStatus("declined")
          setNarration("One or more holds failed. Transaction declined.")
          addLog("⚠ Hold authorization failed → Transaction declined")
        }
      }
    } catch (error) {
      console.error("[v0] Error in handleMemberConfirm:", error)
      addLog("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const merchantCaptures = async () => {
    if (isProcessing || merchantStatus !== "approved") return
    setIsProcessing(true)

    try {
      setCurrentStep("finalize")
      addLog("Merchant captures transaction...")

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMemberStatuses((prev) => prev.map((m) => ({ ...m, holdStatus: "captured" as const })))

      setNarration("The merchant captures the charge. Each member is billed $6.")
      addLog("✓ All $6 holds captured successfully")
      addLog("✓ Each member charged $6")
      addLog("Total $18 purchase settled successfully")
    } catch (error) {
      console.error("[v0] Error in merchantCaptures:", error)
      addLog("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  const merchantReleases = async () => {
    if (isProcessing || merchantStatus !== "approved") return
    setIsProcessing(true)

    try {
      setCurrentStep("finalize")
      addLog("Merchant never captures (timeout/cancel)...")

      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMemberStatuses((prev) => prev.map((m) => ({ ...m, holdStatus: "released" as const })))

      setNarration("The merchant never captured the charge. All holds have been released.")
      addLog("✓ All holds released")
      addLog("No charges made to any member")
    } catch (error) {
      console.error("[v0] Error in merchantReleases:", error)
      addLog("Error: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsProcessing(false)
    }
  }

  // Initialize demo on mount if demo param is set
  useEffect(() => {
    if (isDemoParam && !groupId) {
      startDemo()
    }
  }, [isDemoParam])

  const showMembers = currentStep !== "start"
  const showConfirmButtons = currentStep === "confirm"
  const showHolds =
    (currentStep === "approve" || currentStep === "finalize") && memberStatuses.some((m) => m.holdStatus !== "none")

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50"
      style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
    >
      <div className="border-b border-gray-300 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className={compactMode ? "text-2xl md:text-3xl font-bold" : "text-3xl md:text-4xl font-bold"}>
              GroupCard Demo Mode
            </h1>
            <Button variant="outline" size={compactMode ? "default" : "lg"} asChild className="bg-transparent">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-1">
            {/* Simplified step sequence */}
            {["Start", "Tap", "Confirm", "Approve", "Finalize"].map((step, index) => {
              const isActive =
                (index === 0 && currentStep === "start") ||
                (index === 1 && currentStep === "tap") ||
                (index === 2 && currentStep === "confirm") ||
                (index === 3 && currentStep === "approve") ||
                (index === 4 && currentStep === "finalize")
              const isPast =
                (index < 1 &&
                  (currentStep === "tap" ||
                    currentStep === "confirm" ||
                    currentStep === "approve" ||
                    currentStep === "finalize")) ||
                (index < 2 && (currentStep === "confirm" || currentStep === "approve" || currentStep === "finalize")) ||
                (index < 3 && (currentStep === "approve" || currentStep === "finalize")) ||
                (index < 4 && currentStep === "finalize")
              return (
                <div key={step} className="flex items-center gap-1 flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`flex items-center justify-center rounded-full border-2 font-bold transition-colors ${
                        compactMode ? "h-8 w-8 text-xs" : "h-12 w-12 text-lg"
                      } ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isPast
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-400"
                      }`}
                    >
                      {isPast ? <Check className={compactMode ? "h-4 w-4" : "h-6 w-6"} /> : index + 1}
                    </div>
                    <span
                      className={`font-semibold text-center ${compactMode ? "text-xs" : "text-sm md:text-base"} ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : isPast
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {index < 4 && (
                    <div className={`h-1 flex-1 ${isPast ? "bg-green-600" : "bg-gray-300 dark:bg-gray-700"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card
            className={`bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700 ${compactMode ? "p-4" : "p-6"}`}
          >
            <h2
              className={`font-bold mb-3 text-blue-900 dark:text-blue-100 ${compactMode ? "text-lg" : "text-xl md:text-2xl"}`}
            >
              Story
            </h2>
            <p
              className={`leading-relaxed text-balance text-gray-900 dark:text-gray-100 ${compactMode ? "text-base" : "text-lg md:text-xl"}`}
            >
              {narration}
            </p>
          </Card>

          <Card className={`border-2 border-gray-300 dark:border-gray-700 ${compactMode ? "p-4" : "p-6"}`}>
            <div className="mb-4">
              <Badge
                className={`bg-purple-600 text-white mb-2 ${compactMode ? "text-xs px-3 py-1" : "text-sm md:text-base px-4 py-2"}`}
              >
                Merchant View: One Authorization Only
              </Badge>
              <div className="mt-2">
                <Badge
                  className={`font-bold ${compactMode ? "text-lg px-4 py-2" : "text-xl md:text-2xl px-6 py-3"} ${
                    merchantStatus === "approved"
                      ? "bg-green-600 text-white"
                      : merchantStatus === "declined"
                        ? "bg-red-600 text-white"
                        : "bg-gray-400 text-white"
                  }`}
                >
                  {merchantStatus === "approved" && "APPROVED"}
                  {merchantStatus === "declined" && "DECLINED"}
                  {merchantStatus === "pending" && showConfirmButtons && "WAITING FOR CONFIRMATIONS..."}
                  {merchantStatus === "pending" && !showConfirmButtons && "PENDING"}
                </Badge>
              </div>
            </div>

            {showMembers && (
              <div className="mb-4">
                <h3
                  className={`font-bold mb-3 text-gray-900 dark:text-gray-100 ${compactMode ? "text-sm" : "text-base md:text-lg"}`}
                >
                  {showHolds ? "Backend Split Holds" : "Member Confirmations"}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {memberStatuses.map((member) => (
                    <div
                      key={member.name}
                      className={`flex flex-col items-center border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 ${compactMode ? "gap-1 p-2" : "gap-2 p-3"}`}
                    >
                      <span
                        className={`font-bold text-gray-900 dark:text-gray-100 ${compactMode ? "text-xs" : "text-sm"}`}
                      >
                        {member.name}
                      </span>
                      <span
                        className={`font-bold text-blue-600 dark:text-blue-400 ${compactMode ? "text-base" : "text-lg"}`}
                      >
                        ${(member.amountCents / 100).toFixed(0)}
                      </span>

                      {showConfirmButtons && member.confirmationStatus === "waiting" && (
                        <div className="flex flex-col gap-1 w-full">
                          <Button
                            size="sm"
                            onClick={() => handleMemberConfirm(member.memberId, member.name, true)}
                            className="w-full text-xs"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleMemberConfirm(member.memberId, member.name, false)}
                            className="w-full text-xs"
                          >
                            Decline
                          </Button>
                        </div>
                      )}

                      {(!showConfirmButtons || member.confirmationStatus !== "waiting") && (
                        <Badge
                          variant={
                            (showHolds && member.holdStatus === "authorized") ||
                            (showHolds && member.holdStatus === "captured") ||
                            (!showHolds && member.confirmationStatus === "approved")
                              ? "default"
                              : (showHolds && member.holdStatus === "failed") ||
                                  (!showHolds && member.confirmationStatus === "declined")
                                ? "destructive"
                                : "secondary"
                          }
                          className={compactMode ? "text-xs px-2 py-0.5" : "text-xs px-2 py-1"}
                        >
                          {showHolds ? (
                            <>
                              {member.holdStatus === "none" && "No Hold"}
                              {member.holdStatus === "pending" && "Pending"}
                              {member.holdStatus === "authorized" && "Authorized"}
                              {member.holdStatus === "failed" && "Failed"}
                              {member.holdStatus === "captured" && "Captured"}
                              {member.holdStatus === "released" && "Released"}
                            </>
                          ) : (
                            <>
                              {member.confirmationStatus === "waiting" && "Waiting"}
                              {member.confirmationStatus === "approved" && "Confirmed"}
                              {member.confirmationStatus === "declined" && "Declined"}
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-2 border-gray-300 dark:border-gray-700 pt-3">
              <h4 className={`font-bold mb-2 text-gray-900 dark:text-gray-100 ${compactMode ? "text-xs" : "text-sm"}`}>
                System Log
              </h4>
              <div className={`space-y-0.5 overflow-y-auto ${compactMode ? "max-h-24 text-xs" : "max-h-32 text-sm"}`}>
                {eventLog.map((log, index) => (
                  <div key={index} className="flex gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-mono text-gray-500 flex-shrink-0 text-xs">{log.timestamp}</span>
                    <span className="text-xs">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <Card className={`mt-4 border-2 border-gray-300 dark:border-gray-700 ${compactMode ? "p-4" : "p-6"}`}>
          <h3
            className={`font-bold mb-3 text-gray-900 dark:text-gray-100 ${compactMode ? "text-sm" : "text-base md:text-lg"}`}
          >
            Demo Controls
          </h3>

          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium">Zoom:</label>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-900"
              >
                <option value={75}>75%</option>
                <option value={90}>90%</option>
                <option value={100}>100%</option>
                <option value={110}>110%</option>
                <option value={125}>125%</option>
              </select>
            </div>
            <Button
              onClick={() => setCompactMode(!compactMode)}
              variant={compactMode ? "default" : "outline"}
              size="sm"
            >
              Compact: {compactMode ? "ON" : "OFF"}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={startDemo}
              disabled={isProcessing}
              size={compactMode ? "default" : "lg"}
              variant="default"
              className={compactMode ? "h-auto py-3 text-sm" : "text-base py-4 h-auto"}
            >
              {isProcessing && currentStep === "start" ? "Starting..." : "1. Start Demo"}
            </Button>

            <Button
              onClick={tapGroupCard}
              disabled={!groupId || currentStep !== "start" || isProcessing}
              size={compactMode ? "default" : "lg"}
              className={compactMode ? "h-auto py-3 text-sm" : "text-base py-4 h-auto"}
            >
              {isProcessing && currentStep === "tap" ? "Processing..." : "2. Tap GroupCard"}
            </Button>

            <Button
              onClick={merchantCaptures}
              disabled={merchantStatus !== "approved" || currentStep === "finalize" || isProcessing}
              size={compactMode ? "default" : "lg"}
              className={compactMode ? "h-auto py-3 text-sm" : "text-base py-4 h-auto"}
            >
              {isProcessing && currentStep === "finalize" ? "Capturing..." : "3. Merchant Captures"}
            </Button>

            <Button
              onClick={merchantReleases}
              disabled={merchantStatus !== "approved" || currentStep === "finalize" || isProcessing}
              variant="secondary"
              size={compactMode ? "default" : "lg"}
              className={compactMode ? "h-auto py-3 text-sm" : "text-base py-4 h-auto"}
            >
              {isProcessing && currentStep === "finalize" ? "Releasing..." : "4. Merchant Releases"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
