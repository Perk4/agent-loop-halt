import type { Ledger, Objective } from "./types.ts";

export function seedLedger(objective: Objective, maxTurns: number): Ledger {
	if (!Number.isInteger(maxTurns) || maxTurns < 1) {
		throw new RangeError(`seedLedger: maxTurns must be an integer >= 1, got ${maxTurns}`);
	}
	if (objective.goal.trim() === "") {
		throw new RangeError("seedLedger: goal must be a non-empty string");
	}
	if (objective.checks.length === 0) {
		throw new RangeError("seedLedger: checks must contain at least one check");
	}
	return { objective, maxTurns, receipts: [] };
}
