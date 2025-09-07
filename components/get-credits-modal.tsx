"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, CreditCard, Zap, Star } from "lucide-react"

interface GetCreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const creditPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 5,
    price: 9.99,
    popular: false,
    features: ["5 Interview Sessions", "Basic AI Support", "Email Support"],
  },
  {
    id: "professional",
    name: "Professional",
    credits: 15,
    price: 24.99,
    popular: true,
    features: ["15 Interview Sessions", "Advanced AI Models", "Priority Support", "Resume Analysis"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 50,
    price: 79.99,
    popular: false,
    features: ["50 Interview Sessions", "All AI Models", "24/7 Support", "Custom Instructions", "Analytics"],
  },
]

export function GetCreditsModal({ open, onOpenChange }: GetCreditsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState("professional")

  const handlePurchase = () => {
    // Handle credit purchase
    console.log("Purchasing package:", selectedPackage)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-2xl">Get Interview Credits</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Choose the perfect plan for your interview preparation</p>
            <p className="text-sm text-gray-500">No subscription required • One-time payment • Instant access</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative cursor-pointer transition-all ${
                  selectedPackage === pkg.id ? "ring-2 ring-green-500 shadow-lg" : "hover:shadow-md"
                } ${pkg.popular ? "border-green-500" : ""}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                )}

                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                    <div className="mb-2">
                      <span className="text-3xl font-bold">${pkg.price}</span>
                    </div>
                    <p className="text-gray-600">{pkg.credits} Interview Credits</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-center">
                    <div className="text-sm text-gray-500">${(pkg.price / pkg.credits).toFixed(2)} per interview</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">How Credits Work</h4>
                <p className="text-sm text-blue-800">
                  Each interview session uses 1 credit. Credits never expire and can be used anytime. Trial sessions are
                  free but limited to 10 minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePurchase} className="flex-1 bg-green-600 hover:bg-green-700">
              <CreditCard className="w-4 h-4 mr-2" />
              Purchase {creditPackages.find((p) => p.id === selectedPackage)?.credits} Credits
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
