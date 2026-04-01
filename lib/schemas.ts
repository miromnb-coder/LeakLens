
import { z } from "zod";

export const LeakSchema = z.object({
  merchant: z.string(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  period: z.enum(["monthly", "yearly", "weekly", "one_time", "unknown"]),
  category: z.enum([
    "subscription",
    "price_increase",
    "fee",
    "trial_end",
    "unknown",
  ]),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
  recommendedAction: z.enum([
    "cancel",
    "review",
    "downgrade",
    "ignore",
    "remind",
  ]),
  cancelSteps: z.array(z.string()).default([]),
});

export const AgentResultSchema = z.object({
  summary: z.string(),
  totalEstimatedLoss: z.number().nullable(),
  currency: z.string().nullable(),
  leaks: z.array(LeakSchema),
});

export type AgentResult = z.infer<typeof AgentResultSchema>;
export type Leak = z.infer<typeof LeakSchema>;
