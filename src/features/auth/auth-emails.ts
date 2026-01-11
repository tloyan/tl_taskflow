import "server-only";

import { sendEmail } from "@/lib/email";

export async function sendOtpEmail(email: string, otp: string) {
  await sendEmail({
    to: email,
    subject: "Votre code de connexion TaskFlow",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h1 style="color: #333;">Connexion à TaskFlow</h1>
        <p>Voici votre code de vérification :</p>
        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          background: #f4f4f4;
          padding: 16px;
          text-align: center;
          border-radius: 8px;
        ">
          ${otp}
        </div>
        <p style="color: #666; font-size: 14px;">
          Ce code expire dans 10 minutes.
        </p>
      </div>
    `,
  });
}
