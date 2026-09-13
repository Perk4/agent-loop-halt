export type NonEmpty<T> = readonly [T, ...T[]];

export type Check =
	| { readonly kind: "testsPassed"; readonly command: string }
	| { readonly kind: "filesTouched" };

export type Checks = readonly [Check, ...Check[]];

export type Objective = {
	readonly goal: string;
	readonly checks: Checks;
};

export type CommandRun = {
	readonly command: string;
	readonly exitCode: number;
};

export type Receipt = {
	readonly diffSummary: string;
	readonly filesTouched: readonly string[];
	readonly commands: readonly CommandRun[];
};

export type Ledger = {
	readonly objective: Objective;
	readonly maxTurns: number;
	readonly receipts: readonly Receipt[];
};

export type Failure = {
	readonly check: Check;
	readonly reason: string;
};

export type GreenScore = { readonly kind: "green" };
export type RedScore = { readonly kind: "red"; readonly failed: NonEmpty<Failure> };

export type Score = GreenScore | RedScore;

export type Halt =
	| { readonly status: "complete"; readonly turn: number }
	| { readonly status: "blocked"; readonly turn: number; readonly score: RedScore }
	| { readonly status: "exhausted"; readonly turn: number; readonly score: RedScore };

export type HaltStatus = Halt["status"];

export type PreviousTurn = {
	readonly receipt: Receipt;
	readonly score: RedScore;
};

export type Turn = {
	readonly index: number;
	readonly remaining: number;
	readonly objective: Objective;
	readonly previous: PreviousTurn | undefined;
};

export type AgentFn = (turn: Turn) => Receipt | Promise<Receipt>;
