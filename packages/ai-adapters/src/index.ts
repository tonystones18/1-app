// AI Adapter SDK — VisioneSoft Platform
// Model routing, prompt policy, and AI provider contracts

// ─── Core Types ────────────────────────────────────────────────────────────

export type AiModelProvider = "openai" | "anthropic" | "cloudflare_workers_ai" | "mistral";

export type AiModelCapability =
  | "text_generation"
  | "image_generation"
  | "image_analysis"
  | "embeddings"
  | "text_to_speech"
  | "speech_to_text";

export type AiSafetyLevel = "strict" | "standard" | "permissive";

// ─── Chat / Completion ─────────────────────────────────────────────────────

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiCompletionInput {
  model: string;
  messages: AiMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  safetyLevel?: AiSafetyLevel;
  metadata?: Record<string, unknown>;
}

export interface AiCompletionResult {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason: "stop" | "length" | "content_filter" | "error";
  latencyMs: number;
  cost?: number;
}

// ─── Image Generation ─────────────────────────────────────────────────────

export interface AiImageGenerationInput {
  model: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
  style?: string;
  metadata?: Record<string, unknown>;
}

export interface AiImageGenerationResult {
  imageUrl?: string;
  imageBase64?: string;
  model: string;
  seed?: number;
  latencyMs: number;
  cost?: number;
}

// ─── Embeddings ─────────────────────────────────────────────────────────────

export interface AiEmbeddingInput {
  model: string;
  text: string | string[];
}

export interface AiEmbeddingResult {
  embeddings: number[][];
  model: string;
  totalTokens: number;
  cost?: number;
}

// ─── Usage Tracking ────────────────────────────────────────────────────────

export interface AiUsageEvent {
  id: string;
  tenantId: string;
  actorId?: string;
  provider: AiModelProvider;
  model: string;
  capability: AiModelCapability;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Adapter Interface ────────────────────────────────────────────────────

export interface AiAdapter {
  readonly providerCode: AiModelProvider;
  readonly supportedCapabilities: AiModelCapability[];
  complete(input: AiCompletionInput): Promise<AiCompletionResult>;
  generateImage(input: AiImageGenerationInput): Promise<AiImageGenerationResult>;
  embed(input: AiEmbeddingInput): Promise<AiEmbeddingResult>;
}

// ─── Mock AI Adapter ─────────────────────────────────────────────────────

export class MockAiAdapter implements AiAdapter {
  readonly providerCode: AiModelProvider = "openai";
  readonly supportedCapabilities: AiModelCapability[] = [
    "text_generation",
    "image_generation",
    "embeddings"
  ];

  async complete(input: AiCompletionInput): Promise<AiCompletionResult> {
    const lastMessage = input.messages[input.messages.length - 1];
    return {
      content: `[Mock AI response to: ${lastMessage?.content.slice(0, 50) ?? ""}...]`,
      model: input.model,
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      finishReason: "stop",
      latencyMs: 200,
      cost: 0.0001
    };
  }

  async generateImage(input: AiImageGenerationInput): Promise<AiImageGenerationResult> {
    return {
      imageUrl: `https://mock-ai.example.com/image?prompt=${encodeURIComponent(input.prompt)}`,
      model: input.model,
      latencyMs: 500,
      cost: 0.01
    };
  }

  async embed(input: AiEmbeddingInput): Promise<AiEmbeddingResult> {
    const texts = Array.isArray(input.text) ? input.text : [input.text];
    return {
      embeddings: texts.map(() => Array(1536).fill(0).map(() => Math.random())),
      model: input.model,
      totalTokens: texts.length * 10,
      cost: 0.00001
    };
  }
}

// ─── AI Router ─────────────────────────────────────────────────────────────

export class AiAdapterRouter {
  private adapters: Map<AiModelProvider, AiAdapter> = new Map();
  private defaultProvider: AiModelProvider = "openai";

  register(adapter: AiAdapter): void {
    this.adapters.set(adapter.providerCode, adapter);
  }

  setDefault(provider: AiModelProvider): void {
    this.defaultProvider = provider;
  }

  get(provider?: AiModelProvider): AiAdapter {
    const code = provider ?? this.defaultProvider;
    const adapter = this.adapters.get(code);
    if (!adapter) {
      throw new Error(`No AI adapter registered for provider: ${code}`);
    }
    return adapter;
  }

  forCapability(capability: AiModelCapability): AiAdapter {
    for (const adapter of this.adapters.values()) {
      if (adapter.supportedCapabilities.includes(capability)) {
        return adapter;
      }
    }
    throw new Error(`No AI adapter supports capability: ${capability}`);
  }
}
