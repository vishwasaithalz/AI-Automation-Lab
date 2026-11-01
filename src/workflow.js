const MAX_PROMPT_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 12000;

export function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Workflow input must be a JSON object.");
  }
  if (typeof input.prompt !== "string" || !input.prompt.trim()) {
    throw new TypeError("prompt must be a non-empty string.");
  }
  if (input.prompt.length > MAX_PROMPT_LENGTH) {
    throw new RangeError("prompt exceeds the 2000 character limit.");
  }
  if (input.context !== undefined && typeof input.context !== "string") {
    throw new TypeError("context must be a string when supplied.");
  }
  if ((input.context ?? "").length > MAX_CONTEXT_LENGTH) {
    throw new RangeError("context exceeds the 12000 character limit.");
  }
  return {
    prompt: input.prompt.trim(),
    context: (input.context ?? "").trim()
  };
}

export async function runWorkflow(input, provider) {
  if (!provider || typeof provider.complete !== "function") {
    throw new TypeError("A provider adapter with a complete() method is required.");
  }
  const validated = validateInput(input);
  const startedAt = new Date().toISOString();
  const result = await provider.complete(validated);
  if (!result || typeof result.output !== "string" || !result.output.trim()) {
    throw new Error("Provider returned an invalid or empty output.");
  }
  return {
    workflow: "basic-completion",
    provider: String(result.provider || "custom"),
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    output: result.output
  };
}
