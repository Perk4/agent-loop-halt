import { expect, it } from "vitest";
import { scoreReceipt } from "../src/index.ts";
import type { Check, Receipt } from "../src/index.ts";

const testsPassed = { kind: "testsPassed", command: "npm test" } satisfies Check;
const filesTouched = { kind: "filesTouched" } satisfies Check;

it("fails when testsPassed is false", () => {
	const receipt: Receipt = {
		diffSummary: "try",
		filesTouched: ["src/a.ts"],
		commands: [{ command: "npm test", exitCode: 1 }],
	};
	expect(scoreReceipt(receipt, [testsPassed])).toEqual({
		kind: "red",
		failed: [{ check: testsPassed, reason: "npm test exited 1" }],
	});
});

it("uses the most recent run of the test command", () => {
	const receipt: Receipt = {
		diffSummary: "fail, fix, rerun",
		filesTouched: ["src/a.ts"],
		commands: [
			{ command: "npm test", exitCode: 1 },
			{ command: "npm test", exitCode: 0 },
		],
	};
	expect(scoreReceipt(receipt, [testsPassed])).toEqual({ kind: "green" });
});

it("fails when filesTouched is empty only if that check is present", () => {
	const receipt: Receipt = {
		diffSummary: "ran tests, changed nothing",
		filesTouched: [],
		commands: [{ command: "npm test", exitCode: 0 }],
	};
	expect(scoreReceipt(receipt, [testsPassed, filesTouched])).toEqual({
		kind: "red",
		failed: [{ check: filesTouched, reason: "no files touched" }],
	});
	expect(scoreReceipt(receipt, [testsPassed])).toEqual({ kind: "green" });
});
