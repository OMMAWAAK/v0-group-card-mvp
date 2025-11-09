"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FUNDING_OPTIONS } from "@/lib/funding-options"
import { FundingCard } from "@/components/funding-card"
import { OnboardingForm } from "@/components/onboarding-form"
import { CheckoutEmbed } from "@/components/checkout-embed"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CreditCard } from "lucide-react"

type OnboardingStep = "info" | "funding" | "payment"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("info")
  const [selectedFunding, setSelectedFunding] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{
    email: string
    firstName: string
    lastName: string
  } | null>(null)

  const handleInfoComplete = (data: { email: string; firstName: string; lastName: string }) => {
    setUserInfo(data)
    setStep("funding")
  }

  const handleFundingSelect = () => {
    if (selectedFunding) {
      setStep("payment")
    }
  }

  const selectedOption = FUNDING_OPTIONS.find((o) => o.id === selectedFunding)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          {step !== "info" && (
            <Button variant="ghost" onClick={() => setStep(step === "payment" ? "funding" : "info")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GroupCard</h1>
              <p className="text-muted-foreground">Your shared spending card</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["Account Info", "Select Funding", "Payment"].map((label, idx) => {
              const stepKeys: OnboardingStep[] = ["info", "funding", "payment"]
              const currentStepIndex = stepKeys.indexOf(step)
              const isActive = idx === currentStepIndex
              const isComplete = idx < currentStepIndex

              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                        isComplete
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                  {idx < 2 && <div className={`h-[2px] flex-1 mx-2 ${isComplete ? "bg-primary" : "bg-muted"}`} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {step === "info" && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Create Your Account</h2>
              <OnboardingForm onComplete={handleInfoComplete} />
            </div>
          )}

          {step === "funding" && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Choose Your Starting Balance</h2>
              <p className="text-muted-foreground mb-6">Select how much you'd like to add to your GroupCard</p>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {FUNDING_OPTIONS.map((option) => (
                  <FundingCard
                    key={option.id}
                    option={option}
                    selected={selectedFunding === option.id}
                    onSelect={() => setSelectedFunding(option.id)}
                  />
                ))}
              </div>

              <Button onClick={handleFundingSelect} disabled={!selectedFunding} className="w-full" size="lg">
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && selectedOption && userInfo && (
            <div>
              <h2 className="text-2xl font-semibold mb-2">Complete Your Payment</h2>
              <p className="text-muted-foreground mb-6">
                Adding ${selectedOption.balanceAmount} to your card for $
                {(selectedOption.priceInCents / 100).toFixed(2)}
              </p>

              <CheckoutEmbed fundingOptionId={selectedOption.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
