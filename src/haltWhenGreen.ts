import { scoreReceipt } from "./scoreReceipt.ts";
import type { Halt, Ledger, PreviousTurn, Receipt } from "./types.ts";

type Verdict =
	| { readonly kind: "halt"; readonly halt: Halt }
	| { readonly kind: "continue"; readonly previous: PreviousTurn | undefined };

export function classify(ledger: Ledger): Verdict {
	const turn = ledger.receipts.length;
	const last: Receipt | undefined = ledger.receipts[turn - 1];
	if (last === undefined) return { kind: "continue", previous: undefined };
	const score = scoreReceipt(last, ledger.objective.checks);
	if (score.kind === "green") return { kind: "halt", halt: { status: "complete", turn } };
	if (isEmptyReceipt(last)) return { kind: "halt", halt: { status: "blocked", turn, score } };
	if (turn >= ledger.maxTurns) return { kind: "halt", halt: { status: "exhausted", turn, score } };
	return { kind: "continue", previous: { receipt: last, score } };
}

function isEmptyReceipt(receipt: Receipt): boolean {
	return receipt.filesTouched.length === 0 && receipt.commands.length === 0;
}

export function haltWhenGreen(ledger: Ledger): Halt | undefined {
	const verdict = classify(ledger);
	return verdict.kind === "halt" ? verdict.halt : undefined;
}
