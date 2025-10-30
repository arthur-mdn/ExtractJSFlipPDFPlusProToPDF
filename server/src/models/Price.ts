import type Stripe from "stripe";

export type Price = {
    _id: string;
    productId: string;
    unitAmount?: number;
    currency?: string;
    recurring?: Stripe.Price.Recurring | null;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
};