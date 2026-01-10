import { db } from "@/db";
import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendOtpEmail } from "@/features/auth/auth-emails";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendOtpEmail(email, otp);
        }
      },
      allowedAttempts: 5,
      expiresIn: 600,
    }),
  ],
});
