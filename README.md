# Pathfinding Visualizer

[![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-20232a?logo=react&logoColor=61dafb)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![Zod](https://img.shields.io/badge/Zod-3e7cbb?logo=zod&logoColor=white)](https://zod.dev/) [![npm](https://img.shields.io/badge/npm-v10.9.0-CB3837?logo=npm)](https://www.npmjs.com/) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## GENERAL INFORMATION

A modern, interactive pathfinding visualizer built with Next.js, React, and TypeScript. This project allows users to explore and compare various pathfinding algorithms on a grid, visualizing their behavior and performance in real time. It is designed for learning, teaching, and experimenting with classic and advanced algorithms.

### Features
- Visualize multiple pathfinding algorithms (Dijkstra, A*, BFS, DFS, and more)
- Weighted and unweighted graph support
- Interactive grid editing (add/remove walls, set start/end points)
- Step-by-step animation of algorithm progress
- Responsive UI with Tailwind CSS
- Extensible for adding new algorithms!

## HOW

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ORIGINAL/CREDS

- Inspired by pathfinding visualizer projects by [Clement Mihailescu](https://github.com/clementmihailescu/Pathfinding-Visualizer) and others.
- Built using the T3 stack (Next.js, TypeScript, Tailwind CSS, Zod).

## WHY

I was super board, and also I just wanted a better visualization of some path finding algs that I've been researching.

## ALGORITHMS

|Algorithm                 |Weighted? |Optimal?|Time Complexity           |Origin Year|Inventor(s)                              |Notes                             |Status  |
|--------------------------|----------|--------|--------------------------|-----------|-----------------------------------------|----------------------------------|--------|
|Dijkstra's Algorithm      |Weighted  |Yes     |O((V + E) log V)          |1956       |Edsger Dijkstra                          |Classic, uses a priority queue    | Completed    |
|A* Search                 |Weighted  |Yes     |O(E)                      |1968       |Peter Hart, Nils Nilsson, Bertram Raphael|Faster with admissible heuristics |        |
|Bellman-Ford              |Weighted  |Yes     |O(VE)                     |1958       |Richard Bellman, Lester Ford             |Handles negative weights          |        |
|Floyd-Warshall            |Weighted  |Yes     |O(V^3)                    |1962       |Robert Floyd                             |All-pairs shortest path           |        |
|Johnson's Algorithm       |Weighted  |Yes     |O(V^2 log V + VE)         |1977       |Donald B. Johnson                        |All-pairs for sparse graphs       |        |
|Fringe Search             |Weighted  |Yes     |O(E)                      |1995       |David D. Ferguson, Anthony Stentz        |A*-like, lower memory use         |        |
|ALT (A* + Landmarks)      |Weighted  |Yes     |O(E)                      |2001       |Goldberg, Harrelson                      |Faster A* using landmark heuristic|        |
|Greedy Best-First Search  |Weighted  |No      |O(E)                      |N/A        |N/A                                      |Fast, uses heuristic only         |        |
|Swarm Algorithm           |Weighted  |No      |O(E)                      |N/A        |N/A                                      |Dijkstra + A* hybrid              |        |
|Convergent Swarm          |Weighted  |No      |O(E)                      |N/A        |N/A                                      |Heuristic-heavy Swarm             |        |
|Bidirectional Swarm       |Weighted  |No      |O(E)                      |N/A        |N/A                                      |Swarm from both ends              |        |
|Beam Search               |Weighted  |No      |O(b^d), limited to width w|1961       |Lowerre                                  |Memory-limited BFS variant        |        |
|Jump Point Search         |Weighted  |No      |O(n)                      |2011       |Daniel Harabor, Alban Grastien           |Fast on uniform grids             |        |
|IDA*                      |Weighted  |No      |O(b^d)                    |1985       |Richard Korf                             |DFS + heuristic                   |        |
|D* / D* Lite              |Weighted  |No      |O(n log n)                |1994       |Anthony Stentz                           |Replanning for dynamic maps       |        |
|Breadth-First Search (BFS)|Unweighted|Yes     |O(V + E)                  |1959       |E. F. Moore                              |Shortest path on unweighted graphs|        |
|Lee Algorithm             |Unweighted|Yes     |O(V + E)                  |1961       |C. Y. Lee                                |Grid-based wavefront              |        |
|Depth-First Search (DFS)  |Unweighted|No      |O(V + E)                  |1958       |C. Y. Lee                                |Bad for pathfinding               |        |
|Random Walk               |Unweighted|No      |O(∞ in worst case)        |N/A        |N/A                                      |Totally random, inefficient       |        |
|Wall Follower             |Unweighted|No      |O(n)                      |N/A        |N/A                                      |Follows right/left walls          |        |
