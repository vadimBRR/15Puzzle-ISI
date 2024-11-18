import random

class Puzzle:
    def __init__(self, size=3):
        self.size = size
        self.tiles = [[(i * size + j + 1) % (size ** 2) for j in range(size)] for i in range(size)]
        self.empty_tile = (size - 1, size - 1)

    def shuffle(self, moves=100):
        moves_directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        for _ in range(moves):
            row, col = self.empty_tile
            move = random.choice(moves_directions)
            new_row, new_col = row + move[0], col + move[1]
            if 0 <= new_row < self.size and 0 <= new_col < self.size:
                self.tiles[row][col], self.tiles[new_row][new_col] = self.tiles[new_row][new_col], self.tiles[row][col]
                self.empty_tile = (new_row, new_col)

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
