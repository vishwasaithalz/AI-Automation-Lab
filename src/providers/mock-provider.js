export class MockProvider {
  constructor() {
    this.name = "mock";
  }

  async complete({ prompt, context = "" }) {
    const normalizedPrompt = String(prompt).trim();
    const normalizedContext = String(context).trim();
    const words = normalizedContext ? normalizedContext.split(/\s+/).filter(Boolean).length : 0;
    return {
      provider: this.name,
      output: [
        "MOCK MODE: no external AI service was contacted.",
        "Prompt received: " + normalizedPrompt,
        "Context word count: " + words,
        "Next step: connect an explicitly configured provider adapter if external inference is required."
      ].join("\n")
    };
  }
}
