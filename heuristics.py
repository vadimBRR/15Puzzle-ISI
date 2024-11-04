def manhattan_distance(state):
    distance = 0
    for i in range(len(state)):
        for j in range(len(state[i])):
            if state[i][j] != 0:
                correct_row = (state[i][j] - 1) // len(state)
                correct_col = (state[i][j] - 1) % len(state)
                distance += abs(i - correct_row) + abs(j - correct_col)
    return distance

def misplaced_tiles(state):
    misplaced = 0
    goal = list(range(1, len(state) * len(state[0]))) + [0]
    for i in range(len(state)):
        for j in range(len(state[i])):
            if state[i][j] != 0 and state[i][j] != goal[i * len(state) + j]:
                misplaced += 1
    return misplaced
