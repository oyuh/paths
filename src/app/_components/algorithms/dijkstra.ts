import { Cell } from "../GridVisualizer";

export type Step = {
  row: number;
  col: number;
  isVisited?: boolean;
  isPath?: boolean;
};

export function dijkstra(grid: Cell[][], start: Cell, end: Cell): Step[] {
  const steps: Step[] = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const dist: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev: (Cell | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const pq: [number, Cell][] = [];
  dist[start.row][start.col] = 0;
  pq.push([0, start]);

  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, cell] = pq.shift()!;
    if (visited[cell.row][cell.col]) continue;
    visited[cell.row][cell.col] = true;
    steps.push({ row: cell.row, col: cell.col, isVisited: true });
    if (cell.row === end.row && cell.col === end.col) break;
    for (const [dr, dc] of directions) {
      const nr = cell.row + dr, nc = cell.col + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
      if (grid[nr][nc].isWall) continue;
      if (dist[nr][nc] > d + 1) {
        dist[nr][nc] = d + 1;
        prev[nr][nc] = cell;
        pq.push([dist[nr][nc], grid[nr][nc]]);
      }
    }
  }
  // Reconstruct path
  let cur: Cell | null = end;
  while (cur && prev[cur.row][cur.col]) {
    steps.push({ row: cur.row, col: cur.col, isPath: true });
    cur = prev[cur.row][cur.col];
  }
  steps.push({ row: start.row, col: start.col, isPath: true });
  return steps;
}
