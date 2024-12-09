const API_BASE_URL = "http://127.0.0.1:8000";

export const getPuzzle = async (size: number = 4) => {
  console.log("here sise: ", size);
  const response = await fetch(`${API_BASE_URL}/puzzle/init`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ size }),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize puzzle");
  }

  return response.json();
};



export const shufflePuzzle = async () => {
  const response = await fetch(`${API_BASE_URL}/shuffle`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ moves: 100 }),
  });
  if (!response.ok) throw new Error("Failed to shuffle puzzle");
  return response.json();
};


export const solveAllPuzzles = async (tiles: number[][]) => {
  const response = await fetch(`${API_BASE_URL}/solveAll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tiles }),
  });
  if (!response.ok) throw new Error("Failed to solve all puzzles");
  return response.json();
};

export const solvePuzzle = async (tiles: number[][], method: string) => {
  const response = await fetch(`${API_BASE_URL}/solve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tiles, method }),
  });

  if (!response.ok) throw new Error(`Failed to solve puzzle using method: ${method}`);
  return response.json();
};


export interface PuzzleResult {
  id: number;
  batchId: string | null;
  method: string;
  solution: number[][] | null;
  elapsedTime: number;
  moveCount: number;
  isSolved: boolean;
  size: number;
  timestamp: string;
}

export const getAllResults = async (): Promise<PuzzleResult[]> => {
  const response = await fetch(`${API_BASE_URL}/results`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Failed to fetch results");
  return response.json();
};


export const getStatistics = async (
  limit: number = 10,
  size: number = 3
): Promise<any> => {
  const sizeQuery = size ? `&size=${size}` : "";
  const response = await fetch(`${API_BASE_URL}/statistics?limit=${limit}${sizeQuery}`);
  if (!response.ok) {
    throw new Error("Failed to fetch statistics");
  }
  return response.json();
};

