import { classify } from "./haltWhenGreen.ts";
import type { AgentFn, Ledger, Turn } from "./types.ts";

export async function runTurn(ledger: Ledger, agent: AgentFn): Promise<Ledger> {
	const verdict = classify(ledger);
	if (verdict.kind === "halt") {
		throw new Error(
			`runTurn: ledger already halted (${verdict.halt.status} at turn ${verdict.halt.turn})`,
		);
	}
	const turn: Turn = {
		index: ledger.receipts.length + 1,
		remaining: ledger.maxTurns - ledger.receipts.length,
		objective: ledger.objective,
		previous: verdict.previous,
	};
	const receipt = await agent(turn);
	return { ...ledger, receipts: [...ledger.receipts, receipt] };
}
