export type Activation = { deviceId: string; activatedAt: Date; lastSeenAt?: Date };

export type PriceSnapshot = {
    _id: string;
    unitAmount?: number | null;
    currency?: string | null;
    recurring?: any;
    metadata?: Record<string, any>;
};

export type License = {
    _id: string;
    productId: string;
    priceId?: string | null;
    priceSnapshot?: PriceSnapshot | null;
    email?: string | null;
    stripePaymentIntentId?: string | null;
    stripeCheckoutSessionId?: string | null;
    status: "active" | "revoked" | "refunded";
    maxActivations: number;
    activations: Activation[];
    createdAt: Date;
    notes?: string;
};
