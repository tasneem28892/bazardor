
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env.local");
}

const globalForMongo = globalThis;

const clientPromise =
  globalForMongo._mongoClientPromise ??
  new MongoClient(uri).connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClientPromise = clientPromise;
}

export default clientPromise;
