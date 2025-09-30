import { Request, Response } from "express";
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  ReadSubscriptionInput,
  DeleteSubscriptionInput,
} from "../schema/subscription.schema";
import {
  createSubscription,
  deleteSubscription,
  findAndUpdateSubscription,
  findSubscription,
  findSubscriptions,
} from "../service/subscription.service";
import logger from "../utils/logger";

export async function createSubscriptionHandler(
  req: Request<{}, {}, CreateSubscriptionInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;
    const body = req.body;

    const subscription = await createSubscription({ ...body, user: userId });

    return res.send(subscription);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
}

export async function updateSubscriptionHandler(
  req: Request<UpdateSubscriptionInput["params"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;
    const subscriptionId = req.params.subscriptionId;
    const update = req.body;

    const subscription = await findSubscription({ _id: subscriptionId, user: userId });

    if (!subscription) {
      return res.sendStatus(404);
    }

    const updatedSubscription = await findAndUpdateSubscription(
      { _id: subscriptionId, user: userId },
      update,
      {
        new: true,
      }
    );

    return res.send(updatedSubscription);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
}

export async function getSubscriptionHandler(
  req: Request<ReadSubscriptionInput["params"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;
    const subscriptionId = req.params.subscriptionId;

    const subscription = await findSubscription({ _id: subscriptionId, user: userId });

    if (!subscription) {
      return res.sendStatus(404);
    }

    return res.send(subscription);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
}

export async function deleteSubscriptionHandler(
  req: Request<DeleteSubscriptionInput["params"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;
    const subscriptionId = req.params.subscriptionId;

    const subscription = await findSubscription({ _id: subscriptionId, user: userId });

    if (!subscription) {
      return res.sendStatus(404);
    }

    await deleteSubscription({ _id: subscriptionId, user: userId });

    return res.sendStatus(200);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
}

export async function getUserSubscriptionsHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user._id;

    const subscriptions = await findSubscriptions({ user: userId });

    return res.send(subscriptions);
  } catch (error: any) {
    logger.error(error);
    return res.status(409).send(error.message);
  }
}