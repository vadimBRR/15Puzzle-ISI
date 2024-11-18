const API_BASE_URL = "http://127.0.0.1:8000";

export const getPuzzle = async () => {
  const response = await fetch(`${API_BASE_URL}/puzzle`, {
      method: "GET",
  });
  if (!response.ok) throw new Error("Failed to fetch puzzle");
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

export const solvePuzzle = async (method: string) => {
  const response = await fetch(`${API_BASE_URL}/solve`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ method }),  // Передаємо method у тілі запиту
  });
  if (!response.ok) throw new Error("Failed to solve puzzle");
  return response.json();
};