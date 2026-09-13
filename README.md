# agent-loop-halt

Tiny agent loop halt. Four functions: `seedLedger`, `runTurn`, `scoreReceipt`, `haltWhenGreen`.

The loop is the one from Mixture of Experts, [Stop prompting, start looping](https://www.youtube.com/watch?v=iVMhQVA9664). Objective, turn, evidence, stop. This package is the outer halt loop. You own the `while`. The package owns the ledger, the scoring, and the decision to stop.

The inner verify cycle (propose, measure, review, decide) is a different package, [Perk4/atomic-verify-loop](https://github.com/Perk4/atomic-verify-loop). That package decides pass, repair, fail, or stop for one change. This package decides when the outer loop halts. They compose and share no types.

## The four functions

```ts
import { seedLedger, runTurn, scoreReceipt, haltWhenGreen } from "agent-loop-halt";
import type { Objective, Ledger, Receipt, Check, Score, Halt, Turn, AgentFn } from "agent-loop-halt";

seedLedger(objective, maxTurns);  // Ledger with zero receipts.
runTurn(ledger, agent);           // Promise<Ledger> with one more receipt.
scoreReceipt(receipt, checks);    // Score. { kind: "green" } or { kind: "red", failed }.
haltWhenGreen(ledger);            // Halt | undefined. undefined means keep going.
```

`seedLedger` throws `RangeError` unless `maxTurns` is an integer of at least 1, the goal is non-empty after trim, and `checks` has at least one item. `runTurn` throws if the ledger has already halted.

Every function is pure. `runTurn` returns a new ledger and never mutates the one you pass. Nothing in the package reads `process.env`, calls a model, or reads the clock. Your `AgentFn` does the model call.

## The loop

```ts
const objective: Objective = {
	goal: "make `npm test` pass in packages/parser",
	checks: [
		{ kind: "testsPassed", command: "npm test" },
		{ kind: "filesTouched" },
	],
};

let ledger = seedLedger(objective, 5);
let halt = haltWhenGreen(ledger);
while (halt === undefined) {
	ledger = await runTurn(ledger, agent);
	halt = haltWhenGreen(ledger);
}
```

After the loop, `halt.status` is one of three values.

| status | meaning | payload |
| --- | --- | --- |
| `complete` | The last receipt scored green. | `turn` |
| `blocked` | The last receipt touched no files and ran no commands. The turn produced no evidence, so the next turn would start from the same state. | `turn`, `score` (red) |
| `exhausted` | `maxTurns` receipts are on the ledger and the last one scored red. The agent acted every turn and still did not reach green. | `turn`, `score` (red) |

Blocked is about the evidence. Exhausted is about the budget. Complete wins over both. Blocked wins over exhausted when an empty turn lands on the last allowed turn.

`haltWhenGreen` reads only the last receipt. That is safe because `runTurn` refuses to append to a halted ledger, so no receipt ever follows a halt point.

A receipt records facts, not verdicts. There is no `testsPassed` field. The `testsPassed` check uses the exit code of the most recent matching command.

## What this is not

No chat UI. No HTTP server. No git worktree manager. No reviewers or quorum. No PR creation. No model SDK. No `runUntilHalt` export. You write the `while`.

This is not Atomic the product. It is not Ralph. It is the outer halt loop from that talk, as four functions.

## Run

```sh
npm install
npm test
npm run typecheck
```
