import time
import heapq

class Solver:
    def __init__(self, puzzle):
        self.puzzle = puzzle
        self.time_limit = 20
        self.elapsed_time = 0 

    def dfs(self, depth_limit=200):
        start_time = time.time()
        stack = [(self.puzzle.get_state(), [])]
        visited = set()

        while stack:
            if time.time() - start_time > self.time_limit:
                self.elapsed_time = time.time() - start_time
                raise TimeoutError("Time limit exceeded for DFS")
            
            state, path = stack.pop()
            if self.is_goal(state):
                self.elapsed_time = time.time() - start_time
                return path
            if len(path) < depth_limit:
                visited.add(self.serialize_state(state))
                for move, new_state in self.get_successors(state):
                    if self.serialize_state(new_state) not in visited:
                        stack.append((new_state, path + [move]))
        
        self.elapsed_time = time.time() - start_time
        return None

    def greedy_search(self, heuristic):
        start_time = time.time()
        queue = [(heuristic(self.puzzle.get_state()), self.puzzle.get_state(), [])]
        visited = set()

        while queue:
            if time.time() - start_time > self.time_limit:
                self.elapsed_time = time.time() - start_time
                raise TimeoutError("Time limit exceeded for Greedy Search")
            
            _, state, path = heapq.heappop(queue)
            if self.is_goal(state):
                self.elapsed_time = time.time() - start_time
                return path
            visited.add(self.serialize_state(state))
            for move, new_state in self.get_successors(state):
                if self.serialize_state(new_state) not in visited:
                    heapq.heappush(queue, (heuristic(new_state), new_state, path + [move]))
        
        self.elapsed_time = time.time() - start_time
        return None

    def a_star(self, heuristic):
        start_time = time.time()
        queue = [(heuristic(self.puzzle.get_state()), 0, self.puzzle.get_state(), [])]
        visited = set()

        while queue:
            if time.time() - start_time > self.time_limit:
                self.elapsed_time = time.time() - start_time
                raise TimeoutError("Time limit exceeded for A* Search")
            
            _, cost, state, path = heapq.heappop(queue)
            if self.is_goal(state):
                self.elapsed_time = time.time() - start_time
                return path
            visited.add(self.serialize_state(state))
            for move, new_state in self.get_successors(state):
                serialized_state = self.serialize_state(new_state)
                if serialized_state not in visited:
                    new_cost = cost + 1
                    heapq.heappush(queue, (new_cost + heuristic(new_state), new_cost, new_state, path + [move]))
        
        self.elapsed_time = time.time() - start_time
        return None

    def is_goal(self, state):
        goal = list(range(1, self.puzzle.size ** 2)) + [0]
        goal_state = [goal[i:i + self.puzzle.size] for i in range(0, len(goal), self.puzzle.size)]
        return self.serialize_state(state) == self.serialize_state(goal_state)

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
