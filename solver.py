import heapq

class Solver:
    def __init__(self, puzzle):
        self.puzzle = puzzle

    def dfs(self, depth_limit=50): 
      stack = [(self.puzzle.tiles, [])]  
      visited = set()
      while stack:
          state, path = stack.pop()
          if self.is_goal(state):
              return path
          if len(path) < depth_limit:
              visited.add(self.serialize_state(state))
              for move, new_state in self.get_successors(state):
                  if self.serialize_state(new_state) not in visited:
                      stack.append((new_state, path + [move]))
      return None  


    def a_star(self, heuristic):
        queue = [(heuristic(self.puzzle.tiles), 0, self.puzzle.tiles, [])]
        visited = set()
        while queue:
            _, cost, state, path = heapq.heappop(queue)
            if self.is_goal(state):
                return path
            visited.add(self.serialize_state(state))
            for move, new_state in self.get_successors(state):
                if self.serialize_state(new_state) not in visited:
                    new_cost = cost + 1
                    heapq.heappush(queue, (new_cost + heuristic(new_state), new_cost, new_state, path + [move]))
        return None

    def greedy_search(self, heuristic):
        queue = [(heuristic(self.puzzle.tiles), self.puzzle.tiles, [])]
        visited = set()
        while queue:
            _, state, path = heapq.heappop(queue)
            if self.is_goal(state):
                return path
            visited.add(self.serialize_state(state))
            for move, new_state in self.get_successors(state):
                if self.serialize_state(new_state) not in visited:
                    heapq.heappush(queue, (heuristic(new_state), new_state, path + [move]))
        return None

    def is_goal(self, state):
        goal = list(range(1, self.puzzle.size ** 2)) + [0]
        return state == [goal[i:i + self.puzzle.size] for i in range(0, len(goal), self.puzzle.size)]

    def get_successors(self, state):
        empty_row, empty_col = [(i, row.index(0)) for i, row in enumerate(state) if 0 in row][0]
        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]  
        successors = []
        for dr, dc in moves:
            new_row, new_col = empty_row + dr, empty_col + dc
            if 0 <= new_row < self.puzzle.size and 0 <= new_col < self.puzzle.size:
                new_state = [list(row) for row in state]
                new_state[empty_row][empty_col], new_state[new_row][new_col] = new_state[new_row][new_col], new_state[empty_row][empty_col]
                successors.append(((dr, dc), new_state))
        return successors

    def serialize_state(self, state):
        return tuple(tuple(row) for row in state)
