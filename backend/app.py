from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import random
from fastapi.middleware.cors import CORSMiddleware
from puzzle import Puzzle
from solver import Solver
from heuristics import manhattan_distance, misplaced_tiles

app = FastAPI()

puzzle = Puzzle()
solver = None  

origins = [
  "http://localhost",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://172.24.160.1:5173/"
  "127.0.0.1:58781"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class PuzzleStateResponse(BaseModel):
    tiles: List[List[int]]
    is_solved: bool

class ShuffleRequest(BaseModel):
    moves: Optional[int] = 100

class SolveRequest(BaseModel):
    method: str  # "dfs", "a_star", or "greedy"

@app.get("/puzzle", response_model=PuzzleStateResponse)
async def get_state():
    """Отримати поточний стан головоломки."""
    return {
        "tiles": puzzle.get_state(),
        "is_solved": puzzle.is_solved()
    }

@app.post("/shuffle")
async def shuffle_puzzle(request: ShuffleRequest):
    """Перемішати головоломку."""
    puzzle.shuffle(request.moves)
    return {"message": "Puzzle shuffled", "tiles": puzzle.get_state()}

@app.post("/solve")
async def solve_puzzle(request: SolveRequest):
    """Розв'язати головоломку з вибраним алгоритмом."""
    global solver
    solver = Solver(puzzle)  
    
    if request.method == "dfs":
        solution = solver.dfs()
    elif request.method == "a_star":
        solution = solver.a_star(manhattan_distance)
    elif request.method == "greedy":
        solution = solver.greedy_search(misplaced_tiles)
    else:
        raise HTTPException(status_code=400, detail="Invalid solving method.")

    if solution is None:
        return {"message": "No solution found"}
      
    board_states = [puzzle.get_state()]
    current_state = puzzle.get_state()
    
    for move in solution:
        # print(move)
        current_state = puzzle.apply_move(current_state, move)
        board_states.append(current_state)
    
    return {"solution": board_states}
