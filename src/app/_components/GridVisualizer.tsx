"use client";
import React, { useState, useEffect, useRef } from "react";
import { dijkstra, Step as DijkstraStep } from "./algorithms/dijkstra";

const DEFAULT_ROWS = 30;
const DEFAULT_COLS = 60;

function getGridSize(cellSize = 24) {
  if (typeof window === "undefined") return { rows: DEFAULT_ROWS, cols: DEFAULT_COLS };
  const sidebarWidth = 320;
  const width = window.innerWidth - sidebarWidth;
  const height = window.innerHeight;
  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);
  return { rows, cols };
}

export type Cell = {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
};

export type GridVisualizerProps = {
  selectedAlgorithms: string[];
  runAlgorithmSignal: number;
  resetSignal: number;
  mazeSignal: number;
  stopSignals: Record<string, number>;
  speed: number;
};

function createGrid(
  rows: number,
  cols: number,
  startPos: { row: number; col: number },
  endPos: { row: number; col: number },
  prevGrid?: Cell[][],
): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      let isWall = false;
      if (prevGrid && prevGrid[r] && prevGrid[r][c]) isWall = prevGrid[r][c].isWall;
      row.push({
        row: r,
        col: c,
        isStart: r === startPos.row && c === startPos.col,
        isEnd: r === endPos.row && c === endPos.col,
        isWall,
      });
    }
    grid.push(row);
  }
  return grid;
}

export default function GridVisualizer({ selectedAlgorithms, runAlgorithmSignal, resetSignal, mazeSignal, stopSignals, speed }: GridVisualizerProps) {
  const [{ rows, cols }, setGridDims] = useState(getGridSize());
  const initialStart = { row: Math.floor(rows / 2), col: 5 };
  const initialEnd = { row: Math.floor(rows / 2), col: cols - 6 };
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [grid, setGrid] = useState<Cell[][]>(() => createGrid(rows, cols, initialStart, initialEnd));
  const [mouseDown, setMouseDown] = useState(false);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [shiftDown, setShiftDown] = useState(false);
  const [cellSize, setCellSize] = useState(24); // default cell size
  const [animating, setAnimating] = useState(false);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [pathCells, setPathCells] = useState<Set<string>>(new Set());
  const [cellInfo, setCellInfo] = useState<Record<string, Record<string, { step: number, dist?: number, isPath?: boolean }>>>({});
  const [isStopped, setIsStopped] = useState(false);
  const [stoppedAlgos, setStoppedAlgos] = useState<Record<string, boolean>>({});
  const stoppedAlgosRef = useRef(stoppedAlgos);
  useEffect(() => { stoppedAlgosRef.current = stoppedAlgos; }, [stoppedAlgos]);
  const MIN_CELL_SIZE = 8;
  const MAX_CELL_SIZE = 48;

  const speedToDelay = (s: number) => {
    switch (s) {
      case 1: return 120;
      case 2: return 60;
      case 3: return 30;
      case 4: return 15;
      case 5: return 5;
      default: return 30;
    }
  };

  const algorithmColors: Record<string, string> = {
    "A* Search": "bg-[#60a5fa]",
    "Dijkstra's Algorithm": "bg-[#facc15]",
    "Bellman-Ford": "bg-[#f87171]",
    "Floyd-Warshall": "bg-[#4ade80]",
    "Johnson's Algorithm": "bg-[#a78bfa]",
    "Fringe Search": "bg-[#f472b6]",
    "ALT (A* + Landmarks)": "bg-[#fb923c]",
    "Greedy Best-First Search": "bg-[#22d3ee]",
    "Swarm Algorithm": "bg-[#a3e635]",
    "Convergent Swarm": "bg-[#fbbf24]",
    "Bidirectional Swarm": "bg-[#e879f9]",
    "Beam Search": "bg-[#2dd4bf]",
    "Jump Point Search": "bg-[#818cf8]",
    "IDA*": "bg-[#fb7185]",
    "D* / D* Lite": "bg-[#a78bfa]",
    "Breadth-First Search (BFS)": "bg-[#38bdf8]",
    "Lee Algorithm": "bg-[#34d399]",
    "Depth-First Search (DFS)": "bg-[#a3a3a3]",
    "Random Walk": "bg-[#a8a29e]",
    "Wall Follower": "bg-[#a3a3a3]",
  };

  // Add a mapping for lighter path colors
  const algorithmPathColors: Record<string, string> = {
    "A* Search": "#bae6fd", // blue-200
    "Dijkstra's Algorithm": "#fef08a", // yellow-200
    "Bellman-Ford": "#fecaca", // red-200
    "Floyd-Warshall": "#bbf7d0", // green-200
    "Johnson's Algorithm": "#ddd6fe", // purple-200
    "Fringe Search": "#fbcfe8", // pink-200
    "ALT (A* + Landmarks)": "#fed7aa", // orange-200
    "Greedy Best-First Search": "#a5f3fc", // cyan-200
    "Swarm Algorithm": "#d9f99d", // lime-200
    "Convergent Swarm": "#fde68a", // amber-200
    "Bidirectional Swarm": "#f5d0fe", // fuchsia-200
    "Beam Search": "#99f6e4", // teal-200
    "Jump Point Search": "#c7d2fe", // indigo-200
    "IDA*": "#fecdd3", // rose-200
    "D* / D* Lite": "#ddd6fe", // violet-200
    "Breadth-First Search (BFS)": "#bae6fd", // sky-200
    "Lee Algorithm": "#bbf7d0", // emerald-200
    "Depth-First Search (DFS)": "#e5e7eb", // gray-200
    "Random Walk": "#e7e5e4", // stone-200
    "Wall Follower": "#e5e7eb", // neutral-200
  };

  useEffect(() => {
    function handleResize() {
      const { rows: newRows, cols: newCols } = getGridSize(cellSize);
      setGridDims({ rows: newRows, cols: newCols });
      setGrid(createGrid(newRows, newCols, start, end));
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Shift') setShiftDown(true);
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'Shift') setShiftDown(false);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    function handleWindowPointerUp() {
      setMouseDown(false);
      setDragging(null);
    }
    window.addEventListener("pointerup", handleWindowPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, []);

  useEffect(() => {
    setGrid((g) => createGrid(rows, cols, start, end, g));
  }, [rows, cols, start, end]);

  // Update grid size when cellSize changes
  useEffect(() => {
    const { rows: newRows, cols: newCols } = getGridSize(cellSize);
    setGridDims({ rows: newRows, cols: newCols });
    setGrid(createGrid(newRows, newCols, start, end));
  }, [cellSize]);

  useEffect(() => {
    setStoppedAlgos((prev) => {
      const updated: Record<string, boolean> = { ...prev };
      for (const alg of Object.keys(stopSignals)) {
        if (stopSignals[alg] !== (prev[alg + '_signal'] || 0)) {
          updated[alg] = true;
          updated[alg + '_signal'] = stopSignals[alg];
        }
      }
      return updated;
    });
  }, [stopSignals]);

  // Reset stoppedAlgos when starting a new run
  useEffect(() => {
    setStoppedAlgos({});
    stoppedAlgosRef.current = {};
  }, [runAlgorithmSignal]);

  useEffect(() => {
    if (selectedAlgorithms.length === 0) return; // Prevent crash if no algorithms selected
    let cancelled = false;
    async function runAllAlgorithms() {
      setCellInfo({});
      setVisitedCells(new Set());
      setPathCells(new Set());
      setAnimating(true);
      const algoResults: Record<string, Step[]> = {};
      for (const alg of selectedAlgorithms) {
        if (alg === "A* Search") {
          algoResults[alg] = aStar(grid, grid[start.row][start.col], grid[end.row][end.col]);
        } else if (alg === "Dijkstra's Algorithm") {
          algoResults[alg] = dijkstra(grid, grid[start.row][start.col], grid[end.row][end.col]);
        // Add other algorithms here
      }
      const allSteps = Object.values(algoResults).map(steps => steps.length);
      if (allSteps.length === 0) {
        setAnimating(false);
        return;
      }
      const maxSteps = Math.max(...allSteps);
      let cellInfoMap: Record<string, Record<string, { step: number, dist?: number, isPath?: boolean }>> = {};
      for (let stepIdx = 0; stepIdx < maxSteps; stepIdx++) {
        if (cancelled) break;
        for (const alg of selectedAlgorithms) {
          if (stoppedAlgosRef.current[alg]) continue;
          const steps = algoResults[alg] || [];
          if (stepIdx < steps.length) {
            const step = steps[stepIdx];
            const key = `${step.row},${step.col}`;
            setVisitedCells((prev) => {
              const newSet = new Set(prev);
              newSet.add(`${alg}|${key}`);
              return newSet;
            });
            if (step.isPath) {
              setPathCells((prev) => {
                const newSet = new Set(prev);
                newSet.add(`${alg}|${key}`);
                return newSet;
              });
            }
            cellInfoMap[key] = cellInfoMap[key] || {};
            cellInfoMap[key][alg] = { step: stepIdx + 1, dist: undefined, isPath: !!step.isPath };
          }
        }
        setCellInfo({ ...cellInfoMap });
        await new Promise((res) => setTimeout(res, speedToDelay(speed)));
      }
      setAnimating(false);
    }
    if (runAlgorithmSignal > 0 && selectedAlgorithms.length > 0) {
      cancelled = false;
      runAllAlgorithms();
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAlgorithmSignal, grid, start, end]);

  // Reset grid when resetSignal changes
  useEffect(() => {
    if (resetSignal > 0) {
      setGrid(createGrid(rows, cols, start, end));
      setVisitedCells(new Set());
      setPathCells(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  // Maze generation when mazeSignal changes
  useEffect(() => {
    if (mazeSignal > 0) {
      setGrid((g) => {
        const empty = createGrid(rows, cols, start, end);
        return empty.map((row) =>
          row.map((cell) => {
            if (cell.isStart || cell.isEnd) return cell;
            return { ...cell, isWall: Math.random() < 0.33 };
          })
        );
      });
      setVisitedCells(new Set());
      setPathCells(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mazeSignal]);

  function handlePointerDown(row: number, col: number, e: React.PointerEvent) {
    e.preventDefault();
    setMouseDown(true);
    if (row === start.row && col === start.col) {
      setDragging('start');
    } else if (row === end.row && col === end.col) {
      setDragging('end');
    } else {
      toggleWall(row, col, true);
    }
  }

  function handlePointerEnter(row: number, col: number, e: React.PointerEvent) {
    e.preventDefault();
    if (shiftDown) {
      if (!hoveredCell || hoveredCell.row !== row || hoveredCell.col !== col) {
        setHoveredCell({ row, col });
      }
    }
    if (!mouseDown) return;
    if (dragging === 'start') {
      if ((row !== end.row || col !== end.col) && !grid[row][col].isWall) setStart({ row, col });
    } else if (dragging === 'end') {
      if ((row !== start.row || col !== start.col) && !grid[row][col].isWall) setEnd({ row, col });
    } else {
      toggleWall(row, col, false);
    }
  }

  function handlePointerLeave(row: number, col: number) {
    if (hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
      setHoveredCell(null);
    }
  }

  function toggleWall(row: number, col: number, forceToggle: boolean) {
    if ((row === start.row && col === start.col) || (row === end.row && col === end.col)) return;
    setGrid((g) => {
      if (!g[row] || !g[row][col]) return g;
      const cell = g[row][col];
      const shouldToggle = forceToggle ? true : !cell.isWall;
      if (!shouldToggle) return g;
      const newGrid = g.map((r, i) => (i === row ? [...r] : r));
      newGrid[row][col] = { ...newGrid[row][col], isWall: forceToggle ? !cell.isWall : true };
      return newGrid;
    });
  }

  function handleZoomIn() {
    setCellSize((size) => Math.min(size + 4, MAX_CELL_SIZE));
  }
  function handleZoomOut() {
    setCellSize((size) => Math.max(size - 4, MIN_CELL_SIZE));
  }

  return (
    <div
      className="fixed inset-0 z-0 bg-[#23273a]"
      style={{ width: "100vw", height: "100vh" }}
    >
      <div className="fixed top-4 left-[340px] z-20 flex gap-2">
        <button
          className="px-2 py-1 rounded bg-white/10 hover:bg-indigo-500/30 text-lg font-bold"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          -
        </button>
        <button
          className="px-2 py-1 rounded bg-white/10 hover:bg-indigo-500/30 text-lg font-bold"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          +
        </button>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          width: cols * cellSize,
          height: rows * cellSize,
          marginLeft: 320,
        }}
      >
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const isEven = (i + j) % 2 === 0;
            let cellClass =
              "border border-[#2e3247] transition-all duration-75" +
              (isEven ? " bg-[#232946]" : " bg-[#20233a]");
            if (cell.isStart) cellClass += " bg-green-400 animate-pulse cursor-move";
            else if (cell.isEnd) cellClass += " bg-pink-400 animate-pulse cursor-move";
            else if (cell.isWall) cellClass += " bg-white";
            else cellClass += " cursor-crosshair";
            for (const alg of selectedAlgorithms) {
              if (visitedCells.has(`${alg}|${i},${j}`)) cellClass += ` ${algorithmColors[alg]}`;
              if (pathCells.has(`${alg}|${i},${j}`)) cellClass += ` ${algorithmColors[alg]} ring-2 ring-black`;
            }
            cellClass +=
              " hover:shadow-[0_0_0_2px_rgba(99,102,241,0.5)] hover:z-10";

            // Path highlight: overlay a line for each path cell
            const pathAlgs = selectedAlgorithms.filter(alg => pathCells.has(`${alg}|${i},${j}`));
            let pathOverlay = null;
            if (pathAlgs.length === 1) {
              // Single path: draw a horizontal line with the path color
              pathOverlay = (
                <div style={{
                  position: 'absolute', left: 2, right: 2, top: '50%', height: 4, background: algorithmPathColors[pathAlgs[0]], borderRadius: 2, transform: 'translateY(-50%)', zIndex: 2,
                }} />
              );
            } else if (pathAlgs.length > 1) {
              // Multi-path: split the line into segments or use a linear-gradient
              const grad = `linear-gradient(90deg, ${pathAlgs.map((alg, idx) => `${algorithmPathColors[alg]} ${(idx / pathAlgs.length) * 100}%, ${algorithmPathColors[alg]} ${((idx + 1) / pathAlgs.length) * 100}%`).join(', ')})`;
              pathOverlay = (
                <div style={{
                  position: 'absolute', left: 2, right: 2, top: '50%', height: 4, background: grad, borderRadius: 2, transform: 'translateY(-50%)', zIndex: 2,
                }} />
              );
            }

            return (
              <div
                key={`${i}-${j}`}
                className={cellClass + " relative"}
                style={{ width: cellSize, height: cellSize }}
                onPointerDown={(e) => handlePointerDown(i, j, e)}
                onPointerEnter={(e) => handlePointerEnter(i, j, e)}
                onPointerLeave={() => handlePointerLeave(i, j)}
              >
                {pathOverlay}
                {shiftDown && hoveredCell && hoveredCell.row === i && hoveredCell.col === j && (
                  <div
                    style={{
                      position: "absolute",
                      background: "rgba(30,30,40,0.95)",
                      color: "#fff",
                      padding: 4,
                      borderRadius: 4,
                      fontSize: 12,
                      zIndex: 100,
                      pointerEvents: "none",
                      left: 0,
                      top: 0,
                      minWidth: 120,
                    }}
                  >
                    <div><b>Row:</b> {i}</div>
                    <div><b>Col:</b> {j}</div>
                    <div><b>Type:</b> {cell.isStart ? "Start" : cell.isEnd ? "End" : cell.isWall ? "Wall" : "Empty"}</div>
                    {cellInfo[`${i},${j}`] && (
                      <div style={{ marginTop: 4 }}>
                        <b>Algorithms:</b>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {Object.entries(cellInfo[`${i},${j}`]).map(([alg, info]) => (
                            <li key={alg} style={{ color: 'white' }}>
                              <span style={{ fontWeight: 600, color: 'white' }}>{alg}</span>:
                              step {info.step}{info.isPath ? ' (path)' : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
