"use client"

import { Card } from "@/components/ui/card"
import type { FundingOption } from "@/lib/types"
import { Check } from "lucide-react"

interface FundingCardProps {
  option: FundingOption
  selected: boolean
  onSelect: () => void
}

export function FundingCard({ option, selected, onSelect }: FundingCardProps) {
  const formattedPrice = (option.priceInCents / 100).toFixed(2)

  return (
    <Card
      className={`relative p-6 cursor-pointer transition-all hover:shadow-lg ${
        selected ? "ring-2 ring-primary shadow-lg" : ""
      }`}
      onClick={onSelect}
    >
      {selected && (
        <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-4 w-4" />
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{option.name}</h3>
        <p className="text-sm text-muted-foreground">{option.description}</p>

        <div className="pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${formattedPrice}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Adds ${option.balanceAmount} to your card</p>
        </div>
      </div>
    </Card>
  )
}
