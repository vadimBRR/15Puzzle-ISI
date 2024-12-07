import random

class Puzzle:
    def __init__(self, size=4):
        print(size)
        self.size = size
        self.tiles = [[(i * size + j + 1) % (size ** 2) for j in range(size)] for i in range(size)]
        self.empty_tile = (size - 1, size - 1)

    def shuffle(self):
        flat_tiles = [tile for row in self.tiles for tile in row]
        while True:
            random.shuffle(flat_tiles)
            if self.is_solvable(flat_tiles):
                break

        self.tiles = [flat_tiles[i:i + self.size] for i in range(0, len(flat_tiles), self.size)]
        self.empty_tile = [(i, row.index(0)) for i, row in enumerate(self.tiles) if 0 in row][0]

    def is_solvable(self, flat_tiles):
        inversions = 0
        for i in range(len(flat_tiles)):
            for j in range(i + 1, len(flat_tiles)):
                if flat_tiles[i] != 0 and flat_tiles[j] != 0 and flat_tiles[i] > flat_tiles[j]:
                    inversions += 1

        if self.size % 2 != 0:
            return inversions % 2 == 0

        empty_row = self.size - (flat_tiles.index(0) // self.size)  
        if empty_row % 2 == 0:  
            return inversions % 2 != 0
        else: 
            return inversions % 2 == 0

    def get_state(self):
        return self.tiles
    
    def set_state(self, state):
        self.tiles = state

    def is_solved(self):
        goal = list(range(1, self.size ** 2)) + [0]
        return self.tiles == [goal[i:i + self.size] for i in range(0, len(goal), self.size)]

    def get_state(self):
        return self.tiles

    def move_tile(self, move):
        row, col = self.empty_tile
        dr, dc = move
        new_row, new_col = row + dr, col + dc
        if 0 <= new_row < self.size and 0 <= new_col < self.size:
            self.tiles[row][col], self.tiles[new_row][new_col] = self.tiles[new_row][new_col], self.tiles[row][col]
            self.empty_tile = (new_row, new_col)
            return True
        return False
      
    def apply_move(self, state, move):
      empty_row, empty_col = [(i, row.index(0)) for i, row in enumerate(state) if 0 in row][0]
      dr, dc = move
      new_row, new_col = empty_row + dr, empty_col + dc
      new_state = [list(row) for row in state]
      new_state[empty_row][empty_col], new_state[new_row][new_col] = new_state[new_row][new_col], new_state[empty_row][empty_col]
      return new_state
    
    def reset(self):
        self.tiles = [[(i * self.size + j + 1) % (self.size ** 2) for j in range(self.size)] for i in range(self.size)]
        self.empty_tile = (self.size - 1, self.size - 1)
    
    def change_puzzle_size(self, size):
        self.size = size
        self.tiles = [[(i * self.size + j + 1) % (self.size ** 2) for j in range(self.size)] for i in range(self.size)]
        self.empty_tile = (self.size - 1, self.size - 1)
        
