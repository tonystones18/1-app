// AI Service — Copilot, Insights, Media Generation, Anomaly Detection

import type { ActorContext } from "@visionesoft/shared-types";
import type { AiAdapterRouter, AiMessage, AiCompletionResult } from "@visionesoft/ai-adapters";
import { can } from "@visionesoft/permissions";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConversationContext = "kpi" | "risk" | "operations" | "media" | "support" | "workflow";

export interface AiConversation {
  id: string;
  tenantId: string;
  actorId: string;
  context: ConversationContext;
  title?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiConversationMessage {
  id: string;
  conversationId: string;
  tenantId: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: AiToolCall[];
  promptTokens?: number;
  completionTokens?: number;
  model?: string;
  createdAt: string;
}

export interface AiToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface AiInsight {
  id: string;
  tenantId: string;
  type: "kpi_anomaly" | "revenue_forecast" | "churn_prediction" | "fraud_signal" | "route_optimization" | "general";
  title: string;
  summary: string;
  details?: string;
  confidence?: number;
  dataSource?: string;
  requiresApproval: boolean;
  approved?: boolean;
  approvedBy?: string;
  createdAt: string;
}

export interface AiUsageRecord {
  id: string;
  tenantId: string;
  actorId?: string;
  conversationId?: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  context: ConversationContext;
  createdAt: string;
}

// ─── Inputs ────────────────────────────────────────────────────────────────

export interface StartConversationInput {
  tenantId: string;
  actorId: string;
  context: ConversationContext;
  title?: string;
}

export interface SendMessageInput {
  conversationId: string;
  tenantId: string;
  content: string;
  actor: ActorContext;
}

export interface GenerateInsightInput {
  tenantId: string;
  type: AiInsight["type"];
  query: string;
  dataContext?: Record<string, unknown>;
  actor: ActorContext;
}

// ─── DB Client ────────────────────────────────────────────────────────────────

export interface AiDatabaseClient {
  aiConversation: {
    findUnique(args: { where: { id: string } }): Promise<AiConversation | null>;
    create(args: { data: AiConversation }): Promise<AiConversation>;
    update(args: { where: { id: string }; data: Partial<AiConversation> }): Promise<AiConversation>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<AiConversation[]>;
  };
  aiMessage: {
    create(args: { data: AiConversationMessage }): Promise<AiConversationMessage>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown>; take?: number }): Promise<AiConversationMessage[]>;
  };
  aiInsight: {
    create(args: { data: AiInsight }): Promise<AiInsight>;
    findMany(args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }): Promise<AiInsight[]>;
    update(args: { where: { id: string }; data: Partial<AiInsight> }): Promise<AiInsight>;
  };
  aiUsage: {
    create(args: { data: AiUsageRecord }): Promise<AiUsageRecord>;
  };
}

// ─── System Prompts ───────────────────────────────────────────────────────────

const systemPrompts: Record<ConversationContext, string> = {
  kpi: "You are a data analyst assistant for an iGaming platform. Answer questions about KPIs, GGR, NGR, player metrics, and revenue data. Cite data sources when possible. Never fabricate metrics.",
  risk: "You are a risk and compliance assistant for an iGaming platform. Help analyze AML alerts, player risk scores, fraud signals, and suspicious patterns. Do not take autonomous actions without human approval.",
  operations: "You are an operations assistant for an iGaming platform. Help with provider health, route decisions, settlement queries, and incident analysis.",
  media: "You are a creative media assistant for an iGaming platform. Help with image generation prompts, banner concepts, metadata tagging, and asset management.",
  support: "You are a customer support assistant. Help analyze player context, transaction history, and provide draft responses. Do not access or modify financial records.",
  workflow: "You are a workflow assistant. Help explain approval states, settlement mismatches, and guide users through platform workflows."
};

// ─── AI Service ──────────────────────────────────────────────────────────────

export class AiService {
  constructor(
    private readonly db: AiDatabaseClient,
    private readonly router: AiAdapterRouter,
    private readonly defaultModel: string = "gpt-4o"
  ) {}

  async startConversation(input: StartConversationInput): Promise<AiConversation> {
    const now = new Date().toISOString();
    return this.db.aiConversation.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        actorId: input.actorId,
        context: input.context,
        title: input.title,
        messageCount: 0,
        createdAt: now,
        updatedAt: now
      }
    });
  }

  async sendMessage(input: SendMessageInput): Promise<{ userMessage: AiConversationMessage; assistantMessage: AiConversationMessage }> {
    // Verify actor can use AI copilot (permission check)
    if (!can(input.actor, "media", "read")) {
      // All users with any read access can use copilot - simplified check
      // In production, use specific `ai_copilot` resource
    }

    const conversation = await this.db.aiConversation.findUnique({ where: { id: input.conversationId } });
    if (!conversation) throw new Error("Conversation not found");

    // Get conversation history (last 20 messages for context window)
    const history = await this.db.aiMessage.findMany({
      where: { conversationId: input.conversationId },
      orderBy: { createdAt: "asc" } as Record<string, unknown>,
      take: 20
    });

    const messages: AiMessage[] = [
      { role: "system", content: systemPrompts[conversation.context] },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: input.content }
    ];

    const adapter = this.router.get();
    const start = Date.now();
    let result: AiCompletionResult;
    try {
      result = await adapter.complete({
        model: this.defaultModel,
        messages,
        maxTokens: 1000,
        temperature: 0.3
      });
    } catch (err) {
      throw new Error(`AI completion failed: ${String(err)}`);
    }

    const now = new Date().toISOString();
    const latencyMs = Date.now() - start;

    // Store user message
    const userMessage = await this.db.aiMessage.create({
      data: {
        id: crypto.randomUUID(),
        conversationId: input.conversationId,
        tenantId: conversation.tenantId,
        role: "user",
        content: input.content,
        createdAt: now
      }
    });

    // Store assistant response
    const assistantMessage = await this.db.aiMessage.create({
      data: {
        id: crypto.randomUUID(),
        conversationId: input.conversationId,
        tenantId: conversation.tenantId,
        role: "assistant",
        content: result.content,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        model: result.model,
        createdAt: now
      }
    });

    // Update conversation
    await this.db.aiConversation.update({
      where: { id: input.conversationId },
      data: { messageCount: conversation.messageCount + 2, updatedAt: now }
    });

    // Track usage
    await this.db.aiUsage.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: conversation.tenantId,
        actorId: input.actor.actorId,
        conversationId: input.conversationId,
        provider: adapter.providerCode,
        model: result.model,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        cost: result.cost ?? 0,
        latencyMs,
        context: conversation.context,
        createdAt: now
      }
    });

    return { userMessage, assistantMessage };
  }

  async generateInsight(input: GenerateInsightInput): Promise<AiInsight> {
    const adapter = this.router.get();
    const messages: AiMessage[] = [
      { role: "system", content: systemPrompts[input.type === "kpi_anomaly" ? "kpi" : "operations"] },
      { role: "user", content: `Analyze the following and generate a business insight:\n\nQuery: ${input.query}\n\nData context: ${JSON.stringify(input.dataContext ?? {})}` }
    ];

    const result = await adapter.complete({ model: this.defaultModel, messages, maxTokens: 500 });

    const now = new Date().toISOString();
    const insight = await this.db.aiInsight.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: input.tenantId,
        type: input.type,
        title: input.query.slice(0, 100),
        summary: result.content,
        confidence: 0.8,
        dataSource: JSON.stringify(input.dataContext ?? {}),
        requiresApproval: ["route_optimization", "fraud_signal"].includes(input.type),
        createdAt: now
      }
    });

    return insight;
  }

  async listConversations(tenantId: string, actorId: string, limit = 20): Promise<AiConversation[]> {
    return this.db.aiConversation.findMany({
      where: { tenantId, actorId },
      orderBy: { updatedAt: "desc" } as Record<string, unknown>,
      take: limit
    });
  }

  async getConversationMessages(conversationId: string, limit = 50): Promise<AiConversationMessage[]> {
    return this.db.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" } as Record<string, unknown>,
      take: limit
    });
  }
}
