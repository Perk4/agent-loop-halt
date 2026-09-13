import { expect, it } from "vitest";
import { haltWhenGreen, runTurn, seedLedger } from "../src/index.ts";
import type { AgentFn, Check, Ledger, Objective } from "../src/index.ts";
import { alwaysRed, green, greenOnTurn, red } from "./stubAgent.ts";

const testsPassed = { kind: "testsPassed", command: "npm test" } satisfies Check;
const filesTouched = { kind: "filesTouched" } satisfies Check;
const objective: Objective = { goal: "make tests pass", checks: [testsPassed, filesTouched] };

async function drive(ledger: Ledger, agent: AgentFn): Promise<Ledger> {
	while (haltWhenGreen(ledger) === undefined) ledger = await runTurn(ledger, agent);
	return ledger;
}

it("appends one receipt with diff summary and commands", async () => {
	const next = await runTurn(seedLedger(objective, 5), greenOnTurn(1));
	expect(next.receipts).toEqual([green]);
});

it("refuses a sixth turn when maxTurns is 5", async () => {
	const full = await drive(seedLedger(objective, 5), alwaysRed);
	await expect(runTurn(full, alwaysRed)).rejects.toThrow("exhausted at turn 5");
	expect(full.receipts).toHaveLength(5);
});

it("leaves the input ledger untouched, so a retried turn appends once", async () => {
	const seeded = seedLedger(objective, 5);
	const first = await runTurn(seeded, alwaysRed);
	const retried = await runTurn(seeded, alwaysRed);
	expect(seeded.receipts).toEqual([]);
	expect(first.receipts).toEqual([red]);
	expect(retried.receipts).toEqual([red]);
});

it("stub agent never reads an API key or model token", async () => {
	const reads: string[] = [];
	const real = process.env;
	process.env = new Proxy(real, {
		get: (target, key) => {
			reads.push(String(key));
			return Reflect.get(target, key);
		},
	});
	const secretReads = () => reads.filter((k) => /KEY|TOKEN|SECRET/i.test(k));
	try {
		await drive(seedLedger(objective, 3), greenOnTurn(3));
		expect(secretReads()).toEqual([]);
		const leaky: AgentFn = (turn) => {
			void process.env.OPENAI_API_KEY;
			return greenOnTurn(3)(turn);
		};
		await drive(seedLedger(objective, 3), leaky);
		expect(secretReads()).toEqual(["OPENAI_API_KEY", "OPENAI_API_KEY", "OPENAI_API_KEY"]);
	} finally {
		process.env = real;
	}
});
