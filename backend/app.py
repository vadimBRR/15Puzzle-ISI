from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import random
from uuid import uuid4 
from fastapi.middleware.cors import CORSMiddleware
from puzzle import Puzzle
from solver import Solver
from typing import Any

from heuristics import manhattan_distance, misplaced_tiles
import time  
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import PuzzleResult

from database import Base
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    method: str 
    tiles: List[List[int]]

class PuzzleInitRequest(BaseModel):
    size: int

@app.post("/puzzle/init")
async def init_puzzle(request: PuzzleInitRequest):
    size = request.size
    if size not in [3, 4]:
        raise HTTPException(status_code=400, detail="Invalid puzzle size. Allowed sizes are 3 and 4.")
    
    puzzle.change_puzzle_size(size)
    
    print(puzzle.size)
    
    
    return {"tiles": puzzle.get_state(),
        "is_solved": puzzle.is_solved()
            }


@app.get("/puzzle", response_model=PuzzleStateResponse)
async def get_state():
    return {
        "tiles": puzzle.get_state(),
        "is_solved": puzzle.is_solved()
    }

@app.post("/shuffle")
async def shuffle_puzzle(request: ShuffleRequest):
    puzzle.shuffle()
    return {"message": "Puzzle shuffled", "tiles": puzzle.get_state()}

@app.post("/solve")
async def solve_puzzle(request: SolveRequest, db: Session = Depends(get_db)):
    puzzle.set_state(request.tiles)
    
    global solver
    solver = Solver(puzzle)
    
    try:
        if request.method == "dfs":
            solution = solver.dfs()
        elif request.method == "a_star":
            solution = solver.a_star(manhattan_distance)
        elif request.method == "greedy":
            solution = solver.greedy_search(misplaced_tiles)
        else:
            raise HTTPException(status_code=400, detail="Invalid solving method.")
    except TimeoutError as e:
        return {"isSolved": False, "elapsedTime": solver.elapsed_time, "error": str(e)}

    if solution is None:
        return {"isSolved": False, "elapsedTime": solver.elapsed_time, "solvingMethod": request.method}

    board_states = [puzzle.get_state()]
    current_state = puzzle.get_state()

    for move in solution:
        current_state = puzzle.apply_move(current_state, move)
        board_states.append(current_state)

    move_count = len(solution)
    puzzle.tiles = current_state

    result = PuzzleResult(
        method=request.method,
        solution=board_states,
        elapsed_time=solver.elapsed_time,
        move_count=move_count,
        is_solved=1
    )
    db.add(result)
    db.commit()
    db.refresh(result)

    return {
        "solution": board_states,
        "isSolved": True,
        "elapsedTime": solver.elapsed_time,
        "moveCount": move_count,
        "solvingMethod": request.method
    }


class SolveAllRequest(BaseModel):
    tiles: List[List[int]]

@app.post("/solveAll")
async def solve_all_puzzles(request: SolveAllRequest, db: Session = Depends(get_db)):
    puzzle.set_state(request.tiles)
    global solver
    solver = Solver(puzzle)

    batch_id = str(uuid4())

    methods = {
        "dfs": solver.dfs,
        "a_star": lambda: solver.a_star(manhattan_distance),
        "greedy": lambda: solver.greedy_search(misplaced_tiles),
    }

    results = []
    for method, solve_func in methods.items():
        try:
            solution = solve_func()
            is_solved = solution is not None
            elapsed_time = solver.elapsed_time

            if solution:
                board_states = [puzzle.get_state()]
                current_state = puzzle.get_state()

                for move in solution:
                    current_state = puzzle.apply_move(current_state, move)
                    board_states.append(current_state)
                move_count = len(solution)
            else:
                board_states = None
                move_count = 0
        except TimeoutError:
            is_solved = False
            solution = None
            elapsed_time = solver.elapsed_time
            board_states = None
            move_count = 0

        result = PuzzleResult(
            batch_id=batch_id,
            method=method,
            solution=board_states,
            elapsed_time=elapsed_time if is_solved else 0,
            move_count=move_count,
            size=puzzle.size,
            is_solved=1 if is_solved else 0
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        results.append({
            "batchId": batch_id,
            "method": method,
            "solution": board_states,
            "elapsedTime": elapsed_time,
            "moveCount": move_count,
            "size": puzzle.size,
            "isSolved": is_solved,
        })
    puzzle.reset()
    return results

@app.get("/results")
async def get_all_results(db: Session = Depends(get_db)) -> Any:

    results = db.query(PuzzleResult).all()
    return [
        {
            "id": result.id,
            "batchId": result.batch_id,
            "method": result.method,
            "solution": result.solution,
            "elapsedTime": result.elapsed_time,
            "moveCount": result.move_count,
            "size": result.size,
            "isSolved": bool(result.is_solved),
            "timestamp": result.timestamp
        }
        for result in results
    ]
    
@app.get("/statistics")
async def get_statistics(db: Session = Depends(get_db), limit: int = 10, size: int = 3):
    methods = ["dfs", "a_star", "greedy"]
    stats = []

    for method in methods:
        results = db.query(PuzzleResult).filter(PuzzleResult.method == method, PuzzleResult.size == size, PuzzleResult.is_solved == 1).order_by(PuzzleResult.timestamp.desc()).limit(limit).all()

        total = len(results)
        if total == 0:
            stats.append({
                "method": method,
                "size": size,
                "solved": "0/0",
                "avgTime": "0.00000000000s",
                "avgMoves": 0,
            })
            continue

        solved = sum(1 for result in results if result.is_solved)
        avg_time = sum(result.elapsed_time for result in results) / total
        avg_moves = sum(result.move_count for result in results) / total

        stats.append({
            "method": method,
            "size": size,
            "solved": f"{solved}/{total}",
            "avgTime": f"{avg_time:.10f}s",
            "avgMoves": round(avg_moves, 2),
        })

    return stats
