import React, { useEffect, useState, useRef } from 'react'
import { getPuzzle, shufflePuzzle, solveAllPuzzles } from '../api'
import CustomButton from '../components/CustomButton'
import Board from '../components/Board'

interface BoardState {
	tiles: number[][]
	status: 'idle' | 'solving' | 'solved' | 'failed'
	elapsedTime: number
	moves: number
  
}

const Main = () => {
	const [boards, setBoards] = useState<{
		dfs: BoardState
		a_star: BoardState
		greedy: BoardState
	}>({
		dfs: { tiles: [], status: 'idle', elapsedTime: 0, moves: 0 },
		a_star: { tiles: [], status: 'idle', elapsedTime: 0, moves: 0 },
		greedy: { tiles: [], status: 'idle', elapsedTime: 0, moves: 0 },
	})

	const [shuffledTiles, setShuffledTiles] = useState<number[][]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isShuffled, setIsShuffled] = useState<boolean>(false)

	const isAnimatingRef = useRef<boolean>(false)
	const [animationSpeed, setAnimationSpeed] = useState<number>(500)
	const [isFirstRender, setIsFirstRender] = useState<boolean>(true)
  const [puzzleSize, setPuzzleSize] = useState<number>(3); 


  const [solvedResults, setSolvedResults] = useState<any[]>([])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const puzzle = await getPuzzle()
				const initialState: BoardState = {
					tiles: puzzle.tiles,
					status: 'idle',
					elapsedTime: 0,
					moves: 0,
				}
				setBoards({
					dfs: { ...initialState },
					a_star: { ...initialState },
					greedy: { ...initialState },
				})
				setShuffledTiles(puzzle.tiles)
				setIsShuffled(false)
			} catch (error) {
				console.error('Error fetching puzzle:', error)
			}
		}
		fetchData()
	}, [])

  useEffect(() => {
    fetchPuzzle();
  }, [puzzleSize]); 

  const fetchPuzzle = async () => {
    console.log("changed size");
    console.log(puzzleSize);
    try {
      const puzzle = await getPuzzle(puzzleSize); 
      const initialState = {
        tiles: puzzle.tiles,
        status: 'idle' as 'idle',
        elapsedTime: 0,
        moves: 0,
      };
      setBoards({
        dfs: { ...initialState },
        a_star: { ...initialState },
        greedy: { ...initialState },
      });
      setShuffledTiles(puzzle.tiles);
      setIsShuffled(false);
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    }
  };



	const handleShuffle = async () => {
		isAnimatingRef.current = false
		try {
			const data = await shufflePuzzle()
			setBoards(prevBoards => ({
				dfs: { ...prevBoards.dfs, tiles: data.tiles, status: 'idle' },
				a_star: { ...prevBoards.a_star, tiles: data.tiles, status: 'idle' },
				greedy: { ...prevBoards.greedy, tiles: data.tiles, status: 'idle' },
			}))
			setShuffledTiles(data.tiles)
			setIsShuffled(true)
		} catch (error) {
			console.error('Error shuffling puzzle:', error)
		}
	}

	const checkIsAllSolved = () => {
		const allSolved = Object.values(boards).every(
			board => board.status === 'solved' || board.status === 'failed'
		)
		if (allSolved) {
			isAnimatingRef.current = false
		}
	}

	const startAnimation = (results: any[]) => {
		const methods: Array<'dfs' | 'a_star' | 'greedy'> = [
			'dfs',
			'a_star',
			'greedy',
		]
		isAnimatingRef.current = true

		methods.forEach(method => {
			const result = results.find((r: any) => r.method === method)
			if (!result || !result.solution || result.solution.length === 0) {
				setBoards(prevBoards => ({
					...prevBoards,
					[method]: { ...prevBoards[method], status: 'failed' },
				}))
				checkIsAllSolved()
				return
			}

			setBoards(prevBoards => ({
				...prevBoards,
				[method]: {
					...prevBoards[method],
					tiles: result.solution[0],
					moves: result.solution.length - 1,
					elapsedTime: result.elapsedTime,
				},
			}))

			let stepIndex = 0
			const intervalId = setInterval(() => {
				if (stepIndex < result.solution.length - 1 && isAnimatingRef.current) {
					setBoards(prevBoards => ({
						...prevBoards,
						[method]: {
							...prevBoards[method],
							tiles: result.solution[stepIndex],
						},
					}))
					stepIndex++
				} else {
					clearInterval(intervalId)
					setBoards(prevBoards => ({
						...prevBoards,
						[method]: {
							...prevBoards[method],
							status: 'solved',
							tiles: result.solution[result.solution.length - 1],
						},
					}))
					checkIsAllSolved()
				}
			}, animationSpeed)
		})
	}
	const handleSolveAll = async () => {
		setIsFirstRender(false)
		setIsLoading(true)

		setBoards(prevBoards => {
			const updatedBoards = { ...prevBoards }
			;['dfs', 'a_star', 'greedy'].forEach((method ) => {
        updatedBoards[method as keyof typeof updatedBoards].status = 'solving'
      })
			return updatedBoards
		})

		try {
			const results = await solveAllPuzzles(shuffledTiles)
      setSolvedResults(results)
			setIsLoading(false)
			startAnimation(results)
		} catch (error) {
			setIsLoading(false)
			console.error('Error solving all puzzles:', error)
			;['dfs', 'a_star', 'greedy'].forEach((method) => {
        setBoards(prevBoards => ({
          ...prevBoards,
          [method as keyof typeof prevBoards]: { ...prevBoards[method as keyof typeof prevBoards], status: 'failed' },
        }))
      })
			checkIsAllSolved()
		}
	}

  const handleResetAnimation = () => {
    setBoards(prevBoards => {
        const updatedBoards = { ...prevBoards };
        Object.keys(updatedBoards).forEach(key => {
          const method = key as keyof typeof updatedBoards;
          updatedBoards[method].status = 'idle'; 
          updatedBoards[method].elapsedTime = 0; 
          updatedBoards[method].moves = 0; 
        });
        return updatedBoards;
    });

    if (solvedResults.length > 0) {
        startAnimation(solvedResults);
    }
};


	const handleSpeedIncrease = () => {
		setAnimationSpeed(prevSpeed => Math.max(prevSpeed - 100, 100))
	}

	const handleSpeedDecrease = () => {
		setAnimationSpeed(prevSpeed => Math.min(prevSpeed + 100, 2000))
	}

	const handleSkipAnimation = () => {
		isAnimatingRef.current = false
		setIsShuffled(false)
		setBoards(prevBoards => {
			const updatedBoards = { ...prevBoards }
			Object.keys(updatedBoards).forEach(key => {
				const method = key as 'dfs' | 'a_star' | 'greedy'
				updatedBoards[method].status = 'solved'
			})
			return updatedBoards
		})
	}

	const renderBoard = (method: 'dfs' | 'a_star' | 'greedy', title: string) => {
		const board = boards[method]
		return (
			<div className='flex flex-col items-center gap-2'>
				<h3 className='text-3xl font-bold mb-2'>{title}</h3>
				<Board tiles={board.tiles} />
				<div className='text-center mt-2'>
					{!isLoading && !isFirstRender && (
						<p>
							Solved in {board.elapsedTime.toFixed(10)} seconds with{' '}
							{board.moves} moves.
						</p>
					)}
					{board.status === 'failed' && (
						<p className='text-red-500'>Failed to solve</p>
					)}
					{board.status === 'solving' && (
						<p className='text-yellow-500'>Solving...</p>
					)}

				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center gap-5 mt-10 w-full'>
			<div className='flex justify-around w-full'>
				{renderBoard('dfs', 'DFS')}
				{renderBoard('a_star', 'A*')}
				{renderBoard('greedy', 'Greedy')}
			</div>
			<div className='flex gap-3 '>
				{!isAnimatingRef.current && (
					<div className='flex flex-col gap-3 '>
            <div className='flex flex-row items-center gap-2 '>
              <p>Size:</p>
              <div className={`p-2 cursor-pointer ${puzzleSize === 3 ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => setPuzzleSize(3)}>
                3x3
                </div>
              <div className={`p-2 cursor-pointer ${puzzleSize === 4 ? 'bg-blue-500' : 'bg-gray-500'}`} onClick={() => setPuzzleSize(4)}>
                4x4
                </div>
            </div>
						<CustomButton
							handleClick={handleShuffle}
							text='Shuffle'
							buttonStyle='bg-blue-500 px-10'
						/>
						<div className='flex flex-row items-center gap-2 '>
							<CustomButton
								handleClick={handleSpeedDecrease}
								text='Slow Down'
								buttonStyle='bg-yellow-500'
                />
							<p>Speed: {animationSpeed}ms</p>
							<CustomButton
								handleClick={handleSpeedIncrease}
								text='Speed Up'
								buttonStyle='bg-yellow-500'
							/>
						</div>
						<CustomButton
							handleClick={handleSolveAll}
							text='Solve All'
							buttonStyle={isShuffled ? 'bg-green-700' : ''}
							disabled={!isShuffled}
						/>
						{!isFirstRender && !isLoading && (
							<CustomButton
								handleClick={handleResetAnimation}
								text='Reset Animation'
								buttonStyle='bg-purple-500'
							/>
						)}
					</div>
				)}
				{isAnimatingRef.current && (
					<CustomButton
						handleClick={handleSkipAnimation}
						text='Skip Animation'
						buttonStyle='bg-red-500'
					/>
				)}
			</div>
		</div>
	)
}

export default Main
