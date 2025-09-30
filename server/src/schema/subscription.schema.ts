import { object, string, number, date, TypeOf } from "zod";

const payload = {
  body: object({
    name: string({
      required_error: "Subscription name is required",
    }).min(1, "Name cannot be empty"),
    amount: number({
      required_error: "Amount is required",
    }).positive("Amount must be positive"),
    category: string({
      required_error: "Category is required",
    }).refine(
      (val) => ["entertainment", "music", "productivity", "development", "storage", "fitness", "education", "news", "business", "other"].includes(val),
      "Invalid category"
    ),
    billing_cycle: string({
      required_error: "Billing cycle is required",
    }).refine(
      (val) => ["monthly", "yearly", "weekly", "quarterly"].includes(val),
      "Invalid billing cycle"
    ),
    next_due_date: string({
      required_error: "Next due date is required",
    }).refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    vendor_website: string().url("Must be a valid URL").optional().or(string().length(0)),
    notes: string().optional(),
  }),
};

const params = {
  params: object({
    subscriptionId: string({
      required_error: "subscriptionId is required",
    }),
  }),
};

export const createSubscriptionSchema = object({
  ...payload,
});

export const updateSubscriptionSchema = object({
  ...payload,
  ...params,
});

export const deleteSubscriptionSchema = object({
  ...params,
});

export const getSubscriptionSchema = object({
  ...params,
});

export type CreateSubscriptionInput = TypeOf<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = TypeOf<typeof updateSubscriptionSchema>;
export type ReadSubscriptionInput = TypeOf<typeof getSubscriptionSchema>;
export type DeleteSubscriptionInput = TypeOf<typeof deleteSubscriptionSchema>;