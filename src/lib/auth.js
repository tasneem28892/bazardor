
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import clientPromise from "./mongodb";

const client = await clientPromise;
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  // Email and Password Login
  emailAndPassword: {
    enabled: true,
  },

  // Google Login
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  trustedOrigins: ["http://localhost:3000"],

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  logger: {
    level: "debug",
  },
});
