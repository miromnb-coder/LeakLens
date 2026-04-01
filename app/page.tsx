
"use client";

import { useMemo, useState } from "react";
import type { AgentResult } from "@/lib/schemas";

type ScanResponse =
  | AgentResult
  | {
      error: string;
    };

const demoText = `Spotify AB
11.99 EUR / month
Next payment: 2026-04-15

Adobe Creative Cloud
24.99 EUR / month
Renewal: 2026-04-20

Service fee
2.50 EUR`;

function formatMoney(amount: number | null, currency: string | null) {
  if (amount == null) return "—";
  const symbol = currency === "EUR" ? "€" : currency ?? "";
  return `${symbol}${amount.toFixed(2)}`;
}

export default function HomePage() {
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const hasInput = useMemo(() => text.trim().length > 0 || Boolean(imageDataUrl), [text, imageDataUrl]);

  async function onFileChange(file: File | null) {
    if (!file) {
      setImageDataUrl(undefined);
      setFileName("");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : undefined;
      setImageDataUrl(value);
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          imageDataUrl,
        }),
      });

      const data = (await res.json()) as ScanResponse;
      setResult(data);
    } catch {
      setResult({ error: "Network error while scanning." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="hero">
        <div className="card heroMain">
          <div className="kicker">LeakLens · AI money leak detector</div>
          <h1 className="h1">Find hidden charges before they eat your money.</h1>
          <p className="lead">
            Paste an email, invoice, or receipt. Or upload a screenshot. The agent
            finds recurring payments, price increases, and fees, then gives you the
            next action.
          </p>

          <div className="actions">
            <button
              className="btn btnPrimary"
              onClick={handleScan}
              disabled={loading || !hasInput}
            >
              {loading ? "Scanning..." : "Scan now"}
            </button>
            <button
              className="btn btnSecondary"
              onClick={() => {
                setText(demoText);
              }}
            >
              Load demo
            </button>
          </div>

          <div className="footer">
            Only receipts, bills, and payment confirmations are meant to be scanned.
            This starter does not auto-cancel anything. It only suggests the next step.
          </div>
        </div>

        <aside className="card heroSide">
          <div className="metric">
            <div className="metricLabel">Estimated yearly savings</div>
            <div className="metricValue">€516</div>
          </div>
          <div className="metric">
            <div className="metricLabel">Leaks found today</div>
            <div className="metricValue">3</div>
          </div>
          <div className="metric">
            <div className="metricLabel">Mode</div>
            <div className="metricValue">Screenshot + text</div>
          </div>
        </aside>
      </section>

      <section className="section card">
        <div className="sectionTitle">
          <h2>Scan input</h2>
          <span className="small">Paste text or upload an image</span>
        </div>

        <div className="grid2">
          <div className="field">
            <div className="label">
              <span>Text input</span>
              <span>{text.length} chars</span>
            </div>
            <textarea
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste an email, invoice, receipt, or confirmation text here..."
            />
            <div className="helper">
              Tip: start with lines containing price, renewal, invoice, subscription,
              confirmation, or receipt.
            </div>
          </div>

          <div className="field">
            <div className="label">
              <span>Screenshot upload</span>
              <span>{fileName || "No file"}</span>
            </div>

            <div className="dropzone">
              <input
                className="file"
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
              <div className="helper" style={{ marginTop: 12 }}>
                Upload a receipt or bill screenshot. The file is sent to the agent as a
                base64 image.
              </div>
            </div>

            <div className="status">
              <div className="small">Status</div>
              <div style={{ marginTop: 6 }}>
                {loading
                  ? "Scanning with the agent..."
                  : hasInput
                  ? "Ready to scan."
                  : "Add some text or an image to begin."}
              </div>
            </div>

            <div className="codeBox" style={{ marginTop: 16 }}>
              <strong>Agent flow</strong>
              {"\n"}1. Extract text/image
              {"\n"}2. Detect recurring charges
              {"\n"}3. Classify leak type
              {"\n"}4. Generate next action
            </div>
          </div>
        </div>
      </section>

      <section className="section card">
        <div className="sectionTitle">
          <h2>Results</h2>
          <span className="small">
            {result && "error" in result ? "Error" : "Structured output"}
          </span>
        </div>

        {result && "error" in result && (
          <div className="status" style={{ borderColor: "rgba(255,125,125,0.35)" }}>
            {result.error}
          </div>
        )}

        {result && !("error" in result) && (
          <div className="results">
            <div className="status">
              <strong>Summary:</strong> {result.summary}
              <div style={{ marginTop: 8 }}>
                <strong>Estimated total:</strong> {formatMoney(result.totalEstimatedLoss, result.currency)}
              </div>
            </div>

            {result.leaks.length === 0 ? (
              <div className="status">No clear recurring leak was found.</div>
            ) : (
              result.leaks.map((leak, index) => (
                <article key={`${leak.merchant}-${index}`} className="resultCard">
                  <div className="resultTop">
                    <div>
                      <h3 className="resultName">{leak.merchant}</h3>
                      <div className="pillRow" style={{ marginTop: 10 }}>
                        <span className="pill pillAccent">{leak.category}</span>
                        <span className="pill">{leak.period}</span>
                        <span className="pill">
                          Confidence {(leak.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="small">Potential loss</div>
                      <div style={{ fontSize: 22, fontWeight: 800 }}>
                        {formatMoney(leak.amount, leak.currency)}
                      </div>
                    </div>
                  </div>

                  <div className="resultMeta">
                    <div><strong>Why flagged:</strong> {leak.reason}</div>
                    <div>
                      <strong>Recommended action:</strong> {leak.recommendedAction}
                    </div>
                  </div>

                  <div>
                    <div className="small" style={{ marginBottom: 8 }}>Cancel steps</div>
                    <div className="codeBox">
                      {leak.cancelSteps.length > 0
                        ? leak.cancelSteps.map((step, stepIndex) => `${stepIndex + 1}. ${step}`).join("\n")
                        : "No cancel steps available."}
                    </div>
                  </div>

                  <div className="resultActions">
                    <button className="btn btnSecondary" onClick={() => navigator.clipboard.writeText(leak.cancelSteps.join("\n"))}>
                      Copy steps
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {!result && (
          <div className="status">
            Run a scan to see the structured JSON result rendered as cards.
          </div>
        )}
      </section>
    </main>
  );
}
