import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from '@dbsnap/shared';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    private readonly logger = new Logger(StripeService.name);

    constructor() {
        const config = getConfig();
        this.stripe = new Stripe(config.STRIPE_SECRET_KEY || 'sk_test_mock', {
            apiVersion: '2025-01-27-preview' as any, // Use latest stable
        });
    }

    async createCheckoutSession(params: {
        customerEmail: string;
        priceId: string;
        successUrl: string;
        cancelUrl: string;
        metadata?: Record<string, string>;
    }) {
        return this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer_email: params.customerEmail,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
        });
    }

    async createPortalSession(customerId: string, returnUrl: string) {
        return this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }

    // Webhook handling logic would go here
    constructEvent(payload: string | Buffer, sig: string, secret: string) {
        return this.stripe.webhooks.constructEvent(payload, sig, secret);
    }
}
