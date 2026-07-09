import { NextRequest } from "next/server";
import type { AgentMessage } from "@/lib/types";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Agent chat endpoint.
//
// Streams a plain-text response chunk-by-chunk so the UI renders tokens live.
//
// When the Azure OpenAI environment variables are configured (see .env.local),
// this proxies the conversation to your Azure OpenAI deployment and streams the
// model's tokens back. If they are NOT set, it falls back to a canned,
// keyword-routed answer so the dashboard still runs out of the box.
//
// Required env vars (put them in sre-dashboard/.env.local):
//   AZURE_OPENAI_ENDPOINT      e.g. https://my-resource.openai.azure.com
//   AZURE_OPENAI_API_KEY       your Azure OpenAI key
//   AZURE_OPENAI_DEPLOYMENT    the deployment (model) name you created
//   AZURE_OPENAI_API_VERSION   optional, defaults to 2024-10-21
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT =
  "You are an SRE (Site Reliability Engineering) diagnosis agent embedded in an " +
  "application health dashboard for Consolidated Edison. You reason over metrics, " +
  "logs, traces, incidents, SLOs and change-failure data. Answer in concise, " +
  "plain English using short markdown bullet points where helpful. When you make a " +
  "claim, name the signal it rests on, and finish with a recommended next action. " +
  "If you do not have the data to answer, say so plainly rather than inventing numbers.";

function azureConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";
  if (!endpoint || !apiKey || !deployment) return null;
  return { endpoint, apiKey, deployment, apiVersion };
}

// ---------------------------------------------------------------------------
// Live Azure OpenAI backend
// ---------------------------------------------------------------------------
async function azureStream(
  messages: AgentMessage[],
  cfg: NonNullable<ReturnType<typeof azureConfig>>,
): Promise<ReadableStream<Uint8Array>> {
  const url =
    `${cfg.endpoint}/openai/deployments/${cfg.deployment}` +
    `/chat/completions?api-version=${cfg.apiVersion}`;

  const upstream = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": cfg.apiKey,
    },
    body: JSON.stringify({
      stream: true,
      max_tokens: 1024,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    throw new Error(`Azure OpenAI request failed (${upstream.status}): ${detail}`);
  }

  // Translate the Azure SSE stream into a plain-text token stream for the UI.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by newlines; each data line is JSON.
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "" || payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const token: string | undefined = json.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // Ignore keep-alive / non-JSON lines.
            }
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n⚠️ Stream interrupted: ${(err as Error).message}`),
        );
      } finally {
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Fallback: canned, keyword-routed answer (used when Azure env vars are absent)
// ---------------------------------------------------------------------------
function mockAnswer(question: string): string {
  const q = question.toLowerCase();

  if (q.includes("latency") && q.includes("search")) {
    return [
      "**Search Service latency spike (May 17)** — most likely cause: a deploy at 09:12 IST.",
      "",
      "What the signals show:",
      "• P95 latency jumped 340ms → 480ms right after deployment `search-svc@1.8.2`.",
      "• Error rate (Timeout) rose in lockstep — 26% of total errors are timeouts.",
      "• DB connection errors were elevated on App Node 3 in the same window.",
      "",
      "Hypothesis: the new query path opened connections without pooling, exhausting the pool under load. Recommended next step: roll back `1.8.2` or cap the connection pool, then re-check the SLO burn-rate.",
    ].join("\n");
  }
  if (q.includes("incident") || q.includes("p1") || q.includes("p2")) {
    return [
      "**Current incidents: 22 total (7 P1, 15 P2).**",
      "",
      "Three alerts appear to share one root cause and were grouped into a single narrative:",
      "1. High error rate in Notification Service",
      "2. Database connection errors elevated",
      "3. High CPU on App Node 3",
      "",
      "Likely root cause: connection-pool exhaustion cascading from the Search deploy. Business impact is concentrated on checkout-adjacent flows.",
    ].join("\n");
  }
  if (q.includes("slo") || q.includes("breach") || q.includes("burn")) {
    return [
      "**Closest to breaching SLO: Search Service (92.7% vs 99% target).**",
      "",
      "At the current error-budget burn-rate it will breach in ~2.3 days. Recommendation Service (91.5%) is already below target and needs attention first.",
      "",
      "Suggested action: freeze non-critical deploys to both services and prioritize the latency regression.",
    ].join("\n");
  }
  if (q.includes("change failure") || q.includes("cfr")) {
    return [
      "**Change Failure Rate is 5.6%, up 1.2% week-over-week.**",
      "",
      "The increase tracks two failed deploys on May 16 and May 18. Both were to Search/Recommendation services and correlate with the latency regression above. Tightening pre-deploy canary checks on those services should bring CFR back under 4%.",
    ].join("\n");
  }
  return [
    `You asked: "${question}"`,
    "",
    "This is the agent stub (Azure OpenAI is not configured). Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT in `.env.local` to enable live answers.",
  ].join("\n");
}

function mockStream(answer: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const words = answer.split(/(\s+)/);
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const w of words) {
        controller.enqueue(encoder.encode(w));
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: AgentMessage[] };
  const cfg = azureConfig();

  let stream: ReadableStream<Uint8Array>;
  if (cfg) {
    try {
      stream = await azureStream(messages ?? [], cfg);
    } catch (err) {
      // Surface the failure as a readable message instead of a dead connection.
      stream = mockStream(`⚠️ Azure OpenAI call failed: ${(err as Error).message}`);
    }
  } else {
    const last = messages?.filter((m) => m.role === "user").at(-1)?.content ?? "";
    stream = mockStream(mockAnswer(last));
  }

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
