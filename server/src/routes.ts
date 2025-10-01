import { Express, Request, Response } from "express";
import {
  createProductHandler,
  getProductHandler,
  updateProductHandler,
} from "./controller/product.controller";
import {
  createUserSessionHandler,
  getUserSessionsHandler,
  deleteSessionHandler,
  googleOauthHandler,
} from "./controller/session.controller";
import {
  createUserHandler,
  getCurrentUser,
} from "./controller/user.controller";
import {
  createSubscriptionHandler,
  updateSubscriptionHandler,
  getSubscriptionHandler,
  deleteSubscriptionHandler,
  getUserSubscriptionsHandler,
} from "./controller/subscription.controller";
import { sendGmailHandler } from "./controller/email.controller";
import requireUser from "./middleware/requireUser";
import validateResource from "./middleware/validateResource";
import {
  createProductSchema,
  deleteProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./schema/product.schema";
import { createSessionSchema } from "./schema/session.schema";
import { createUserSchema } from "./schema/user.schema";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  getSubscriptionSchema,
  deleteSubscriptionSchema,
} from "./schema/subscription.schema";
import { sendEmailSchema } from "./schema/email.schema";

function routes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => res.sendStatus(200));

  app.post("/api/users", validateResource(createUserSchema), createUserHandler);

  app.get("/api/me", requireUser, getCurrentUser);

  app.post(
    "/api/sessions",
    validateResource(createSessionSchema),
    createUserSessionHandler
  );

  app.get("/api/sessions", requireUser, getUserSessionsHandler);

  app.delete("/api/sessions", requireUser, deleteSessionHandler);

  app.get("/api/sessions/oauth/google", googleOauthHandler);

  // Subscription routes
  app.get("/api/subscriptions", requireUser, getUserSubscriptionsHandler);

  app.post(
    "/api/subscriptions",
    [requireUser, validateResource(createSubscriptionSchema)],
    createSubscriptionHandler
  );

  app.get(
    "/api/subscriptions/:subscriptionId",
    [requireUser, validateResource(getSubscriptionSchema)],
    getSubscriptionHandler
  );

  app.put(
    "/api/subscriptions/:subscriptionId",
    [requireUser, validateResource(updateSubscriptionSchema)],
    updateSubscriptionHandler
  );

  app.delete(
    "/api/subscriptions/:subscriptionId",
    [requireUser, validateResource(deleteSubscriptionSchema)],
    deleteSubscriptionHandler
  );

  // Email routes
  app.post(
    "/api/email/send",
    [requireUser, validateResource(sendEmailSchema)],
    sendGmailHandler
  );

  app.post(
    "/api/products",
    [requireUser, validateResource(createProductSchema)],
    createProductHandler
  );

  app.put(
    "/api/products/:productId",
    [requireUser, validateResource(updateProductSchema)],
    updateProductHandler
  );

  app.get(
    "/api/products/:productId",
    validateResource(getProductSchema),
    getProductHandler
  );

  app.delete(
    "/api/products/:productId",
    [requireUser, validateResource(deleteProductSchema)],
    getProductHandler
  );
}

export default routes;
