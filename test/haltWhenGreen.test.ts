import { describe, expect, it } from "vitest";
import { haltWhenGreen, runTurn, seedLedger } from "../src/index.ts";
import type { AgentFn, Check, Ledger, Objective } from "../src/index.ts";
import { alwaysRed, giveUpOnTurn, greenOnTurn } from "./stubAgent.ts";

const testsPassed = { kind: "testsPassed", command: "npm test" } satisfies Check;
const filesTouched = { kind: "filesTouched" } satisfies Check;
const objective: Objective = { goal: "make tests pass", checks: [testsPassed, filesTouched] };

async function drive(ledger: Ledger, agent: AgentFn): Promise<Ledger> {
	while (haltWhenGreen(ledger) === undefined) ledger = await runTurn(ledger, agent);
	return ledger;
}

describe("haltWhenGreen", () => {
	it("is complete after a green score", async () => {
		const ledger = await drive(seedLedger(objective, 5), greenOnTurn(3));
		expect(haltWhenGreen(ledger)).toEqual({ status: "complete", turn: 3 });
	});

	it("is exhausted after maxTurns of red scores", async () => {
		const ledger = await drive(seedLedger(objective, 5), alwaysRed);
		expect(haltWhenGreen(ledger)).toEqual({
			status: "exhausted",
			turn: 5,
			score: { kind: "red", failed: [{ check: testsPassed, reason: "npm test exited 1" }] },
		});
	});

	it("is blocked when a turn touches no files and runs no commands", async () => {
		const ledger = await drive(seedLedger(objective, 5), giveUpOnTurn(2));
		expect(haltWhenGreen(ledger)).toEqual({
			status: "blocked",
			turn: 2,
			score: {
				kind: "red",
				failed: [
					{ check: testsPassed, reason: "npm test did not run" },
					{ check: filesTouched, reason: "no files touched" },
				],
			},
		});
	});

	it("is undefined while turns remain and the last score is red, then complete on green", async () => {
		const afterRed = await runTurn(seedLedger(objective, 5), alwaysRed);
		expect(haltWhenGreen(afterRed)).toBeUndefined();
		const afterGreen = await runTurn(afterRed, greenOnTurn(1));
		expect(haltWhenGreen(afterGreen)).toEqual({ status: "complete", turn: 2 });
	});
});
