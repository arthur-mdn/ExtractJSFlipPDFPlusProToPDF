import { MongoClient, Collection } from "mongodb";
import type { Product } from "./models/Product.js";
import type { License } from "./models/License.js";
import type { Price } from "./models/Price.js";

let client: MongoClient;
export let Products: Collection<Product>;
export let Licenses: Collection<License>;
export let Prices: Collection<Price>;

export async function connectDB(url: string) {
    client = new MongoClient(url);
    await client.connect();
    const db = client.db();

    Products = db.collection<Product>("products");
    Licenses = db.collection<License>("licenses");
    Prices = db.collection<Price>("prices");

    await Products.createIndex({ active: 1 });
    await Licenses.createIndex({ productId: 1 });
    await Licenses.createIndex({ stripeCheckoutSessionId: 1 });
    await Licenses.createIndex({ stripePaymentIntentId: 1 });

    await Prices.createIndex({ productId: 1 });
    await Prices.createIndex({ active: 1 });

    return { client, db, Products, Licenses, Prices };
}
