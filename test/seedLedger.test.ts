import { expect, it } from "vitest";
import { seedLedger } from "../src/index.ts";
import type { Check, Objective } from "../src/index.ts";

const testsPassed = { kind: "testsPassed", command: "npm test" } satisfies Check;
const filesTouched = { kind: "filesTouched" } satisfies Check;
const objective: Objective = { goal: "make tests pass", checks: [testsPassed, filesTouched] };

it("stores objective and maxTurns with receipts empty", () => {
	expect(seedLedger(objective, 5)).toEqual({ objective, maxTurns: 5, receipts: [] });
});

it("rejects a turn bound below 1 or not an integer", () => {
	expect(() => seedLedger(objective, 0)).toThrow(RangeError);
	expect(() => seedLedger(objective, 2.5)).toThrow(RangeError);
});

it("rejects an empty goal", () => {
	expect(() => seedLedger({ goal: "", checks: [testsPassed] }, 5)).toThrow(RangeError);
	expect(() => seedLedger({ goal: "   ", checks: [testsPassed] }, 5)).toThrow(RangeError);
});

it("rejects an empty check list", () => {
	expect(() => seedLedger({ goal: "make tests pass", checks: [] } as unknown as Objective, 5)).toThrow(
		RangeError,
	);
});
