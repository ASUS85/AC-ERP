import { BrevoClient } from "@getbrevo/brevo";
import logger from "../utils/logger.js";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export async function sendMail(to, subject, html, options = {}) {
  try {
    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME || "AC ERP",
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent: html,
      ...options,
    });

    return response;
  } catch (error) {
    logger.error("Echec envoi email", {
      to,
      subject,
      error: error?.message || error,
    });

    throw error;
  }
}
