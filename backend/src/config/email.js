import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT || 587) === 465,
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
});

export async function sendMail(to, subject, html, options = {}) {
  try {
    return await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      ...options,
    });
  } catch (error) {
    logger.error("Echec envoi email", {
      host: process.env.SMTP_HOST || null,
      port: Number(process.env.SMTP_PORT || 587),
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });
    throw error;
  }
}
