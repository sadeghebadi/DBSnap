"use client"

import { Check, Loader2 } from "lucide-react"
import { BillingStatus } from "@/lib/hooks/use-billing"

interface PlanCardsProps {
    currentPlan?: 'FREE' | 'PRO' | 'TEAM';
    onUpgrade: (plan: 'FREE' | 'PRO' | 'TEAM') => void;
    isUpgrading: boolean;
}

const plans = [
    {
        name: 'FREE',
        price: '$0',
        description: 'For individuals and small side projects.',
        features: ['1 Project', '1 Database', '7-day retention'],
    },
    {
        name: 'PRO',
        price: '$29',
        description: 'For professionals and growing startups.',
        features: ['5 Projects', '10 Databases', '30-day retention', 'Email alerts'],
    },
    {
        name: 'TEAM',
        price: '$99',
        description: 'For teams requiring advanced capabilities.',
        features: ['20 Projects', '50 Databases', '90-day retention', 'Anomaly detection'],
    },
] as const;

export function PlanCards({ currentPlan, onUpgrade, isUpgrading }: PlanCardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
                <div
                    key={plan.name}
                    className={`flex flex-col rounded-xl border p-6 transition-all ${currentPlan === plan.name
                            ? 'border-primary ring-1 ring-primary'
                            : 'hover:border-primary/50'
                        }`}
                >
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{plan.price}</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="mb-8 flex-1 space-y-2 text-sm">
                        {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => onUpgrade(plan.name)}
                        disabled={currentPlan === plan.name || isUpgrading}
                        className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${currentPlan === plan.name
                                ? 'bg-muted text-muted-foreground cursor-default'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            } flex items-center justify-center`}
                    >
                        {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {currentPlan === plan.name ? 'Current Plan' : `Upgrade to ${plan.name}`}
                    </button>
                </div>
            ))}
        </div>
    )
}
