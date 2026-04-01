import { NextRequest } from "next/server";
import { runAgent } from "@/lib/agent";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const text = typeof body?.text === "string" ? body.text : "";
    const imageDataUrl =
      typeof body?.imageDataUrl === "string" ? body.imageDataUrl : undefined;

    if (!text.trim() && !imageDataUrl) {
      return Response.json(
        { error: "Add pasted text or an image first." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: "GROQ_API_KEY is missing from environment variables." },
        { status: 500 }
      );
    }

    const result = await runAgent({ text, imageDataUrl });

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while scanning.",
      },
      { status: 500 }
    );
  }
}
