import type { AgentFn, Receipt } from "../src/index.ts";

export const red: Receipt = {
	diffSummary: "edit parser, tests still fail",
	filesTouched: ["src/parser.ts"],
	commands: [{ command: "npm test", exitCode: 1 }],
};
export const green: Receipt = {
	diffSummary: "fix off-by-one in parser",
	filesTouched: ["src/parser.ts"],
	commands: [{ command: "npm test", exitCode: 0 }],
};
export const nothing: Receipt = { diffSummary: "no idea what to change", filesTouched: [], commands: [] };

export const greenOnTurn = (n: number): AgentFn => (turn) => (turn.index >= n ? green : red);
export const alwaysRed: AgentFn = () => red;
export const giveUpOnTurn = (n: number): AgentFn => (turn) => (turn.index >= n ? nothing : red);
