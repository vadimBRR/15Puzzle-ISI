import tkinter as tk
import random
import time  
from solver import Solver
from heuristics import manhattan_distance, misplaced_tiles

class PuzzleApp:
    def __init__(self, root, size=3):
        self.root = root
        self.size = size
        self.tiles = [[(i * self.size + j + 1) % (self.size ** 2) for j in range(self.size)] for i in range(self.size)]
        self.empty_tile = (self.size - 1, self.size - 1)
        self.solver = Solver(self)  
        self.animation_speed = 500

        self.root.title("Lloydova Puzzle")
        self.frame = tk.Frame(self.root)
        self.frame.pack()

        self.buttons = [[None for _ in range(self.size)] for _ in range(self.size)]
        self.create_tiles()

        self.create_control_buttons()
        self.create_speed_buttons()

        self.shuffle_puzzle()

    def create_tiles(self):
        for i in range(self.size):
            for j in range(self.size):
                if self.tiles[i][j] != 0:
                    self.buttons[i][j] = tk.Button(self.frame, text=str(self.tiles[i][j]), font=('Helvetica', 24), width=4, height=2)
                    self.buttons[i][j].grid(row=i, column=j)
                else:
                    self.buttons[i][j] = tk.Button(self.frame, text="", font=('Helvetica', 24), width=4, height=2, state="disabled")
                    self.buttons[i][j].grid(row=i, column=j)

    def create_control_buttons(self):
        self.control_frame = tk.Frame(self.root)
        self.control_frame.pack()
        tk.Button(self.control_frame, text="Shuffle", command=self.shuffle_puzzle).grid(row=0, column=0)
        tk.Button(self.control_frame, text="DFS", command=lambda: self.run_solver("dfs")).grid(row=0, column=1)
        tk.Button(self.control_frame, text="A*", command=lambda: self.run_solver("a_star")).grid(row=0, column=2)
        tk.Button(self.control_frame, text="Greedy", command=lambda: self.run_solver("greedy")).grid(row=0, column=3)


    def create_speed_buttons(self):
            self.speed_frame = tk.Frame(self.root)
            tk.Button(self.speed_frame, text="x0.5", command=lambda: self.set_animation_speed(1000)).grid(row=0, column=0)
            tk.Button(self.speed_frame, text="x1", command=lambda: self.set_animation_speed(500)).grid(row=0, column=1)
            tk.Button(self.speed_frame, text="x5", command=lambda: self.set_animation_speed(100)).grid(row=0, column=2)
            tk.Button(self.speed_frame, text="x10", command=lambda: self.set_animation_speed(50)).grid(row=0, column=3)
            self.speed_frame.pack_forget()  

    def set_animation_speed(self, speed):
        self.animation_speed = speed
        print(f"Animation speed set to {self.animation_speed} ms")
        
    def toggle_buttons(self, show_speed_buttons):
        if show_speed_buttons:
            self.control_frame.pack_forget()
            self.speed_frame.pack()  
        else:
            self.speed_frame.pack_forget()
            self.control_frame.pack()  

    def shuffle_puzzle(self):
        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        for _ in range(100):  
            row, col = self.empty_tile
            move = random.choice(moves)
            new_row, new_col = row + move[0], col + move[1]
            if 0 <= new_row < self.size and 0 <= new_col < self.size:
                self.tiles[row][col], self.tiles[new_row][new_col] = self.tiles[new_row][new_col], self.tiles[row][col]
                self.empty_tile = (new_row, new_col)
        self.update_tiles()

    def run_solver(self, method):
        start_time = time.time()
        if method == "dfs":
            path = self.solver.dfs()
        elif method == "a_star":
            path = self.solver.a_star(manhattan_distance)
        elif method == "greedy":
            path = self.solver.greedy_search(misplaced_tiles)
        end_time = time.time()
        
        if path:
          print(f"{method.upper()} found a solution in {end_time - start_time:.4f} seconds.")
          self.toggle_buttons(show_speed_buttons=True)  
          self.animate_path(path)
          self.toggle_buttons(show_speed_buttons=False)  
        else:
            print(f"{method.upper()} did not find a solution.")

    def animate_path(self, path):
        for move in path:
            self.move_tile(move)
            self.root.update()
            self.root.after(self.animation_speed)  

    def move_tile(self, move):
        row, col = self.empty_tile
        dr, dc = move
        new_row, new_col = row + dr, col + dc
        self.tiles[row][col], self.tiles[new_row][new_col] = self.tiles[new_row][new_col], self.tiles[row][col]
        self.empty_tile = (new_row, new_col)
        self.update_tiles()

    def update_tiles(self):
        for i in range(self.size):
            for j in range(self.size):
                if self.tiles[i][j] == 0:
                    self.buttons[i][j].config(text="", state="disabled")
                else:
                    self.buttons[i][j].config(text=str(self.tiles[i][j]), state="normal")
