import { expect, test } from "bun:test"
import { TraceOverlapIssueSolver } from "lib/solvers/TraceOverlapShiftSolver/TraceOverlapIssueSolver/TraceOverlapIssueSolver"
import type { SolvedTracePath } from "lib/solvers/SchematicTraceLinesSolver/SchematicTraceLinesSolver"

const createTrace = (
  mspPairId: string,
  globalConnNetId: string,
  tracePath: SolvedTracePath["tracePath"],
): SolvedTracePath => ({
  mspPairId,
  dcConnNetId: globalConnNetId,
  globalConnNetId,
  pins: [] as any,
  tracePath,
  mspConnectionPairIds: [mspPairId],
  pinIds: [],
})

test("chooses the overlap shift direction with the fewest different-net crossings", () => {
  const traceA = createTrace("a", "A", [
    { x: 0, y: 0 },
    { x: 3, y: 0 },
  ])
  const traceB = createTrace("b", "B", [
    { x: 1, y: 0 },
    { x: 4, y: 0 },
  ])
  const blocker = createTrace("blocker", "BLOCKER", [
    { x: 0.5, y: -0.2 },
    { x: 0.5, y: -0.05 },
  ])

  const solver = new TraceOverlapIssueSolver({
    overlappingTraceSegments: [
      {
        connNetId: "A",
        pathsWithOverlap: [{ solvedTracePathIndex: 0, traceSegmentIndex: 0 }],
      },
      {
        connNetId: "B",
        pathsWithOverlap: [{ solvedTracePathIndex: 0, traceSegmentIndex: 0 }],
      },
    ],
    traceNetIslands: {
      A: [traceA],
      B: [traceB],
      BLOCKER: [blocker],
    },
  })

  solver.solve()

  expect(solver.correctedTraceMap.a.tracePath).toEqual([
    { x: 0, y: 0 },
    { x: 0.1, y: 0 },
    { x: 0.1, y: 0.1 },
    { x: 3, y: 0.1 },
  ])
  expect(solver.correctedTraceMap.b.tracePath).toEqual([
    { x: 1, y: 0 },
    { x: 1.1, y: 0 },
    { x: 1.1, y: -0.1 },
    { x: 4, y: -0.1 },
  ])
})
