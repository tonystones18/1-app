import type { ApiEnvelope } from "@visionesoft/shared-types";

export interface ApiClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class VisioneSoftClient {
  constructor(private readonly options: ApiClientOptions) {}

  async get<TData>(path: string): Promise<ApiEnvelope<TData>> {
    const init: RequestInit = this.options.apiKey
      ? { headers: { Authorization: `Bearer ${this.options.apiKey}` } }
      : {};

    const response = await fetch(new URL(path, this.options.baseUrl), init);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<ApiEnvelope<TData>>;
  }
}
