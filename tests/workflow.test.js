import test from "node:test";
import assert from "node:assert/strict";
import { MockProvider } from "../src/providers/mock-provider.js";
import { runWorkflow, validateInput } from "../src/workflow.js";

test("validates and normalizes workflow input", () => {
  assert.deepEqual(validateInput({ prompt: "  Hello  ", context: " Notes " }), {
    prompt: "Hello",
    context: "Notes"
  });
});

test("rejects missing prompt", () => {
  assert.throws(() => validateInput({ context: "x" }), /prompt/);
});

test("rejects oversized prompt", () => {
  assert.throws(() => validateInput({ prompt: "x".repeat(2001) }), /2000/);
});

test("rejects non-string context", () => {
  assert.throws(() => validateInput({ prompt: "Hello", context: [] }), /context/);
});

test("mock provider returns deterministic local-mode notice", async () => {
  const result = await new MockProvider().complete({ prompt: "Summarize", context: "one two three" });
  assert.equal(result.provider, "mock");
  assert.match(result.output, /no external AI service was contacted/);
  assert.match(result.output, /Context word count: 3/);
});

test("workflow returns a structured report", async () => {
  const report = await runWorkflow({ prompt: "Hello" }, new MockProvider());
  assert.equal(report.workflow, "basic-completion");
  assert.equal(report.provider, "mock");
  assert.match(report.output, /MOCK MODE/);
});

test("workflow rejects missing adapter", async () => {
  await assert.rejects(() => runWorkflow({ prompt: "Hello" }, null), /provider adapter/);
});

test("workflow rejects empty provider output", async () => {
  await assert.rejects(
    () => runWorkflow({ prompt: "Hello" }, { complete: async () => ({ output: " " }) }),
    /invalid or empty/
  );
});
