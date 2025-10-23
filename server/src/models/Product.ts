// src/models/Product.ts
import { Collection, MongoClient } from "mongodb";

export type Product = {
    _id: string;
    name: string;
    stripePriceId: string;
    maxActivationsDefault: number;
    active: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
};
