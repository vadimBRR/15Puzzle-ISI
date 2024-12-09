import React, { useEffect, useState, useRef } from 'react'
import { getPuzzle, shufflePuzzle, solvePuzzle } from '../api'
import CustomButton from '../components/CustomButton'
import Board from '../components/Board'

interface BoardState {
	tiles: number[][]
	status: 'idle' | 'solving' | 'solved' | 'failed'
	elapsedTime: number
	moves: number
}

const SingleSolve = () => {
	const [board, setBoard] = useState<BoardState>({
		tiles: [],
		status: 'idle',
		elapsedTime: 0,
		moves: 0,
	})
	const [shuffledTiles, setShuffledTiles] = useState<number[][]>([])
	const [isShuffled, setIsShuffled] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [animationSpeed, setAnimationSpeed] = useState<number>(500)
	const [puzzleSize, setPuzzleSize] = useState<number>(3)
	const [selectedMethod, setSelectedMethod] = useState<
		'dfs' | 'a_star' | 'greedy'
	>('dfs')
	const [solvedResult, setSolvedResult] = useState<any>(null)
	const isAnimatingRef = useRef<boolean>(false)
	const [isFirstRender, setIsFirstRender] = useState<boolean>(true)
  const [isSolved, setIsSolved] = useState<boolean>(false)
	useEffect(() => {
		fetchPuzzle()
	}, [puzzleSize])

	const fetchPuzzle = async () => {
		try {
			const puzzle = await getPuzzle(puzzleSize)
			setBoard({
				tiles: puzzle.tiles,
				status: 'idle',
				elapsedTime: 0,
				moves: 0,
			})
			setShuffledTiles(puzzle.tiles)
			setIsShuffled(false)
		} catch (error) {
			console.error('Error fetching puzzle:', error)
		}
	}

	const handleShuffle = async () => {
    setIsSolved(false)
		isAnimatingRef.current = false
		try {
			const data = await shufflePuzzle()
			setBoard({
				...board,
				tiles: data.tiles,
				status: 'idle',
			})
			setShuffledTiles(data.tiles)
			setIsShuffled(true)
		} catch (error) {
			console.error('Error shuffling puzzle:', error)
		}
	}

	const startAnimation = (result: any) => {
    setIsSolved(false)

		isAnimatingRef.current = true
		const { solution, elapsedTime } = result

		if (!solution || solution.length === 0) {
			setBoard({
				...board,
				status: 'failed',
			})
			isAnimatingRef.current = false
			return
		}

		setBoard({
			...board,
			tiles: solution[0],
			moves: solution.length - 1,
			elapsedTime,
			status: 'solving',
		})

    setIsSolved(true)

		let stepIndex = 0
		const intervalId = setInterval(() => {
			if (stepIndex < solution.length - 1 && isAnimatingRef.current) {
				setBoard(prevBoard => ({
					...prevBoard,
					tiles: solution[stepIndex],
				}))
				stepIndex++
			} else {
				clearInterval(intervalId)
				setBoard(prevBoard => ({
					...prevBoard,
					tiles: solution[solution.length - 1],
					status: 'solved',
				}))
				isAnimatingRef.current = false
			}
		}, animationSpeed)
		setIsShuffled(false)
	}

	const handleSolve = async () => {
		if (!isShuffled) return
		setIsLoading(true)
		setBoard({ ...board, status: 'solving' })

		try {
			const result = await solvePuzzle(shuffledTiles, selectedMethod)
			if (result && result.solution) {
				setIsFirstRender(false)
				setSolvedResult(result)
				startAnimation(result)
			} else {
				setBoard({ ...board, status: 'failed' })
			}
		} catch (error) {
			console.error('Error solving puzzle:', error)
			setBoard({ ...board, status: 'failed' })
		} finally {
			setIsLoading(false)
		}
	}

	const handleResetAnimation = () => {
		setBoard({
			tiles: shuffledTiles,
			status: 'idle',
			elapsedTime: 0,
			moves: 0,
		})
		isAnimatingRef.current = false
		startAnimation(solvedResult)
	}

	const handleSpeedChange = (change: number) => {
		setAnimationSpeed(prevSpeed =>
			Math.max(100, Math.min(prevSpeed + change, 2000))
		)
	}

	const handleSkipAnimation = () => {
		isAnimatingRef.current = false
		setBoard(prevBoard => ({
			...prevBoard,
			tiles: shuffledTiles,
			status: 'solved',
		}))
	}

	const handleSizeChange = (size: number) => {
		if (isAnimatingRef.current) return
		setPuzzleSize(size)

		setBoard({
			tiles: [],
			status: 'idle',
			elapsedTime: 0,
			moves: 0,
		})
		setIsShuffled(false)
    setIsSolved(false)
	}

	return (
		<div className='flex flex-col items-center gap-5 mt-10 pb-10 w-full '>
			<h3 className='text-3xl font-bold mb-2'>Solve Puzzle</h3>
			<Board tiles={board.tiles} />
			<div className='text-center mt-2'>
				{(!isFirstRender && !isLoading && isSolved) && (
					<p>
						Solved in {board.elapsedTime.toFixed(10)} seconds with {board.moves}{' '}
						moves.
					</p>
				)}
				{board.status === 'failed' && (
					<p className='text-red-500'>Failed to solve</p>
				)}
				{isLoading && <p className='text-yellow-500'>Solving...</p>}
			</div>

			<div className='flex flex-col gap-3'>
				{!isAnimatingRef.current ? (
					<>
						<CustomButton
							text='Shuffle'
							handleClick={handleShuffle}
							buttonStyle='bg-blue-500 px-10'
						/>

						<div className='flex flex- justify-between items-center gap-2 '>
							<CustomButton
								handleClick={() => handleSpeedChange(100)}
								text='Slow Down'
								buttonStyle='bg-yellow-500'
							/>
							<p className='text-xl'>{animationSpeed}ms</p>
							<CustomButton
								handleClick={() => handleSpeedChange(-100)}
								text='Speed Up'
								buttonStyle='bg-yellow-500'
							/>
						</div>
						{!isFirstRender && (
							<CustomButton
								text='Reset Animation'
								handleClick={handleResetAnimation}
								buttonStyle='bg-purple-500'
							/>
						)}
						<div className='flex items-center gap-3'>
							<p className='text-xl'>Method:</p>
							{['dfs', 'a_star', 'greedy'].map(method => (
								<div
									key={method}
									className={`p-2 cursor-pointer ${
										selectedMethod === method ? 'bg-blue-500' : 'bg-gray-500'
									}`}
									onClick={() =>
										setSelectedMethod(method as 'dfs' | 'a_star' | 'greedy')
									}
								>
									{method.toUpperCase()}
								</div>
							))}
						</div>

						<div className='flex flex-row items-center gap-3 '>
							<p className='text-xl'>Size:</p>
							{[3, 4].map(size => (
								<CustomButton
									key={size}
									text={`${size}x${size}`}
									handleClick={() => handleSizeChange(size)}
									buttonStyle={`px-4 flex-1 ${
										puzzleSize === size ? 'bg-blue-500' : 'bg-gray-500'
									}`}
								/>
							))}
						</div>
						<CustomButton
							text='Solve'
							handleClick={handleSolve}
							buttonStyle={`bg-green-500 px-10 ${
								!isShuffled ? 'opacity-50 cursor-not-allowed' : ''
							}`}
							disabled={!isShuffled}
						/>
					</>
				) : (
					<CustomButton
						text='Skip Animation'
						handleClick={handleSkipAnimation}
						buttonStyle='bg-red-500'
					/>
				)}
			</div>
		</div>
	)
}

export default SingleSolve
