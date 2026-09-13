import type { Halt, Objective, Receipt, Score } from "../src/index.ts";

// @ts-expect-error red with zero failures cannot be written
export const illegalRed: Score = { kind: "red", failed: [] };

// @ts-expect-error there is no fourth halt status
export const illegalHalt: Halt = { status: "stalled", turn: 1 };

export const illegalReceipt: Receipt = {
	diffSummary: "try",
	filesTouched: ["src/a.ts"],
	commands: [{ command: "npm test", exitCode: 0 }],
	// @ts-expect-error receipts have no testsPassed field
	testsPassed: true,
};

// @ts-expect-error checks must contain at least one check
export const illegalObjective: Objective = { goal: "make tests pass", checks: [] };
