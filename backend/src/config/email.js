import { Resend } from "resend";

import logger from "../utils/logger.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(to, subject, html, options = {}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "AC ERP <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      ...options,
    });

    if (error) {
      logger.error("Echec envoi email", {
        code: error.name,
        message: error.message,
      });

      throw error;
    }

    return data;
  } catch (error) {
    logger.error("Echec envoi email", {
      code: error.code || error.name,
      message: error.message,
    });

    throw error;
  }
}