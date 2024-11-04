from puzzle import PuzzleApp
import tkinter as tk

if __name__ == "__main__":
    root = tk.Tk()
    app = PuzzleApp(root, size=3)
    root.mainloop()

