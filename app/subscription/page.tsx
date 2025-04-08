"use client"

import { useState } from "react"
import { Check, Home } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"

export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Basic",
      monthlyPrice: 199,
      yearlyPrice: 1990,
      features: [
        "Basic analytics",
        "Up to 5 users",
        "Email support",
        "Basic reporting",
        "Standard features"
      ]
    },
    {
      name: "Premium",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      features: [
        "Advanced analytics",
        "Up to 20 users",
        "Priority support",
        "Advanced reporting",
        "API access",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Business",
      monthlyPrice: 999,
      yearlyPrice: 9990,
      features: [
        "Enterprise analytics",
        "Unlimited users",
        "24/7 support",
        "Custom reporting",
        "Dedicated account manager",
        "White-label solutions",
        "Custom development"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-indigo-600"
            />
            <span className="text-sm font-medium text-gray-700">Yearly</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Select the perfect plan for your business needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 transition-transform transform hover:scale-105 ${
                plan.popular ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h2>
                {plan.popular && (
                  <p className="mt-2 text-sm text-indigo-600">Most Popular</p>
                )}
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /{isYearly ? "year" : "month"}
                  </span>
                </p>
                {isYearly && (
                  <p className="mt-1 text-sm text-gray-500">
                    Save 17% compared to monthly billing
                  </p>
                )}
                <button
                  className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-white cursor-pointer ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-800 hover:bg-gray-900"
                  }`}
                >
                  Get started
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h3 className="text-sm font-medium text-gray-900">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 