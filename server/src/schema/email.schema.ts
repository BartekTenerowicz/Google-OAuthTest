import { object, string, TypeOf } from "zod";

export const sendEmailSchema = object({
  body: object({
    to: string({
      required_error: "Recipient email is required",
    }).email("Must be a valid email address"),
    subject: string({
      required_error: "Subject is required",
    }).min(1, "Subject cannot be empty"),
    body: string({
      required_error: "Email body is required",
    }).min(1, "Email body cannot be empty"),
  }),
});

export type SendEmailInput = TypeOf<typeof sendEmailSchema>;