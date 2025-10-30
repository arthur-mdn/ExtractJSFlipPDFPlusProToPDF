export type Product = {
    _id: string;
    name: string;
    stripeProductId?: string;
    maxActivationsDefault: number;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
};
