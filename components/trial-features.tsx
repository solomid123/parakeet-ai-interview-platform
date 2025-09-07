"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Zap, Lock } from "lucide-react"

interface TrialBadgeProps {
  timeRemaining?: string
  className?: string
}

export function TrialBadge({ timeRemaining = "10 mins", className }: TrialBadgeProps) {
  return (
    <Badge variant="secondary" className={`bg-red-100 text-red-800 border-red-200 ${className}`}>
      <Clock className="w-3 h-3 mr-1" />
      {timeRemaining} (Trial)
    </Badge>
  )
}

interface TrialLimitationProps {
  feature: string
  description: string
  upgradeRequired?: boolean
}

export function TrialLimitation({ feature, description, upgradeRequired = false }: TrialLimitationProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {upgradeRequired ? (
            <Lock className="w-5 h-5 text-orange-600 mt-0.5" />
          ) : (
            <Zap className="w-5 h-5 text-orange-600 mt-0.5" />
          )}
          <div>
            <h4 className="font-medium text-orange-900 mb-1">{feature}</h4>
            <p className="text-sm text-orange-800">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CreditRequiredProps {
  action: string
  creditsRequired: number
  userCredits: number
}

export function CreditRequired({ action, creditsRequired, userCredits }: CreditRequiredProps) {
  const hasEnoughCredits = userCredits >= creditsRequired

  return (
    <div
      className={`p-3 rounded-lg border ${hasEnoughCredits ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${hasEnoughCredits ? "text-green-900" : "text-red-900"}`}>{action}</p>
          <p className={`text-xs ${hasEnoughCredits ? "text-green-700" : "text-red-700"}`}>
            Requires {creditsRequired} credit{creditsRequired > 1 ? "s" : ""} • You have {userCredits}
          </p>
        </div>
        {!hasEnoughCredits && (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Insufficient Credits
          </Badge>
        )}
      </div>
    </div>
  )
}
