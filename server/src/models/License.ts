export type Activation = { deviceId: string; activatedAt: Date; lastSeenAt?: Date };

export type License = {
    _id: string;
    productId: string;
    email?: string | null;
    stripePaymentIntentId?: string | null;
    stripeCheckoutSessionId?: string | null;
    status: "active" | "revoked" | "refunded";
    maxActivations: number;
    activations: Activation[];
    createdAt: Date;
    notes?: string;
};
