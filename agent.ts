import OpenAI from "openai";
import { AgentResultSchema, type AgentResult } from "@/lib/schemas";
import { getCancelHelp } from "@/lib/knowledge";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const systemPrompt = `
You are LeakLens Agent.
Your job is to detect money leaks from pasted text, receipts, invoices, confirmations, or screenshots.

Rules:
- Find only likely recurring charges, price increases, trials ending, and hidden fees.
- Be conservative: do not invent services or cancellation links.
- If amount is missing, set it to null.
- Use the supplied schema exactly.
- Do not include anything outside the JSON schema.
`;

function enrichCancelSteps(result: AgentResult): AgentResult {
  return {
    ...result,
    leaks: result.leaks.map((leak) => {
      const help = getCancelHelp(leak.merchant);
      const cancelSteps = leak.cancelSteps.length > 0 ? leak.cancelSteps : help.steps;
      return {
        ...leak,
        cancelSteps,
      };
    }),
  };
}

export async function runAgent(input: {
  text: string;
  imageDataUrl?: string;
}): Promise<AgentResult> {
  const content: Array<
    | { type: "input_text"; text: string }
    | { type: "input_image"; image_url: string; detail?: "low" | "high" | "auto" }
  > = [
    {
      type: "input_text",
      text:
        input.text.trim().length > 0
          ? `User provided text:
${input.text}`
          : "No text was pasted. Analyze the screenshot only.",
    },
  ];

  if (input.imageDataUrl) {
    content.push({
      type: "input_image",
      image_url: input.imageDataUrl,
      detail: "high",
    });
  }

  const response = await groq.responses.create({
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content,
      },
    ],
    max_output_tokens: 1400,
    text: {
      format: {
        type: "json_schema",
        name: "leaklens_scan",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["summary", "totalEstimatedLoss", "currency", "leaks"],
          properties: {
            summary: { type: "string" },
            totalEstimatedLoss: { type: ["number", "null"] },
            currency: { type: ["string", "null"] },
            leaks: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "merchant",
                  "amount",
                  "currency",
                  "period",
                  "category",
                  "confidence",
                  "reason",
                  "recommendedAction",
                  "cancelSteps",
                ],
                properties: {
                  merchant: { type: "string" },
                  amount: { type: ["number", "null"] },
                  currency: { type: ["string", "null"] },
                  period: {
                    type: "string",
                    enum: ["monthly", "yearly", "weekly", "one_time", "unknown"],
                  },
                  category: {
                    type: "string",
                    enum: [
                      "subscription",
                      "price_increase",
                      "fee",
                      "trial_end",
                      "unknown",
                    ],
                  },
                  confidence: { type: "number" },
                  reason: { type: "string" },
                  recommendedAction: {
                    type: "string",
                    enum: ["cancel", "review", "downgrade", "ignore", "remind"],
                  },
                  cancelSteps: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const raw = response.output_text;
  const parsed = AgentResultSchema.parse(JSON.parse(raw));
  return enrichCancelSteps(parsed);
}
