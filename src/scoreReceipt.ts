import type { Check, Failure, NonEmpty, Receipt, Score } from "./types.ts";

export function scoreReceipt(receipt: Receipt, checks: readonly Check[]): Score {
	const failed: Failure[] = checks.flatMap((check) => {
		const reason = interpret(check, receipt);
		return reason === undefined ? [] : [{ check, reason }];
	});
	return isNonEmpty(failed) ? { kind: "red", failed } : { kind: "green" };
}

function interpret(check: Check, receipt: Receipt): string | undefined {
	switch (check.kind) {
		case "testsPassed": {
			const runs = receipt.commands.filter((c) => c.command === check.command);
			const last = runs[runs.length - 1];
			if (last === undefined) return `${check.command} did not run`;
			return last.exitCode === 0 ? undefined : `${check.command} exited ${last.exitCode}`;
		}
		case "filesTouched": {
			return receipt.filesTouched.length === 0 ? "no files touched" : undefined;
		}
		default: {
			const _exhaustive: never = check;
			return _exhaustive;
		}
	}
}

function isNonEmpty<T>(xs: readonly T[]): xs is NonEmpty<T> {
	return xs.length > 0;
}
