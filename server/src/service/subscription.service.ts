import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import SubscriptionModel, {
  SubscriptionDocument,
  SubscriptionInput,
} from "../models/subscription.model";

export async function createSubscription(
  input: SubscriptionInput & { user: string }
) {
  try {
    const result = await SubscriptionModel.create(input);
    return result.toJSON();
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findSubscription(
  query: FilterQuery<SubscriptionDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await SubscriptionModel.findOne(query, {}, options);
    return result;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function findAndUpdateSubscription(
  query: FilterQuery<SubscriptionDocument>,
  update: UpdateQuery<SubscriptionDocument>,
  options: QueryOptions = {}
) {
  return SubscriptionModel.findOneAndUpdate(query, update, options);
}

export async function deleteSubscription(
  query: FilterQuery<SubscriptionDocument>
) {
  return SubscriptionModel.deleteOne(query);
}

export async function findSubscriptions(
  query: FilterQuery<SubscriptionDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await SubscriptionModel.find(query, {}, options);
    return result;
  } catch (error: any) {
    throw new Error(error);
  }
}