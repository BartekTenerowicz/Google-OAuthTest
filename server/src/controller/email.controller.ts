import { Request, Response } from "express";
import axios from "axios";
import log from "../utils/logger";

export async function sendGmailHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user._id;
    const { to, subject, body } = req.body;

    // Get user's Google tokens
    const user = res.locals.user;

    if (!user.googleAccessToken) {
      return res.status(403).send("Gmail not connected. Please reconnect your Google account.");
    }

    // Create the email in RFC 2822 format
    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      body
    ].join("\r\n");

    // Encode the email in base64url format
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send email via Gmail API
    const response = await axios.post(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        raw: encodedEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${user.googleAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    log.info(`Email sent successfully to ${to}`);

    return res.send({
      success: true,
      messageId: response.data.id,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    log.error(error, "Failed to send email via Gmail");

    // Check if it's an authentication error
    if (error.response?.status === 401) {
      return res.status(401).send({
        success: false,
        message: "Gmail access token expired. Please reconnect your Google account.",
      });
    }

    return res.status(500).send({
      success: false,
      message: error.response?.data?.error?.message || "Failed to send email",
    });
  }
}