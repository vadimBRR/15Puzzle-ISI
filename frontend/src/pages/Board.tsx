import React, { useEffect, useState } from 'react'
import { getPuzzle, shufflePuzzle, solvePuzzle } from '../api'
import CustomButton from '../components/CustomButton'

const Board = () => {
	const [tiles, setTiles] = useState<number[][]>([])
	const [soulution, setSolution] = useState<number[][][]>([])
	const [animationSpeed, setAnimationSpeed] = useState(500)
	const [isShowSoulution, setIsShowSolution] = useState(false)
	const [indexShownSoulution, setIndexShowSoulution] = useState(0)

	useEffect(() => {
		console.log('here')
		const fetchData = async () => {
			console.log('here2')

			try {
				const puzzle = await getPuzzle()
				setTiles(puzzle.tiles)
				console.log(puzzle.tiles)
			} catch (error) {
				console.error(error)
			}
		}
		fetchData()
	}, [])
  
  
	useEffect(() => {
    let intervalId = 0
    if(isShowSoulution && indexShownSoulution < soulution.length - 1){

      intervalId = setInterval(() => {
        setIndexShowSoulution((prevIndex) => prevIndex + 1)

        // setTiles(soulution[indexShownSoulution])
      }, animationSpeed)
    }
    return () => clearInterval(intervalId)
    

  }, [isShowSoulution, indexShownSoulution, animationSpeed, soulution])

	const handleShuffle = async () => {
		try {
			const data = await shufflePuzzle()
			setTiles(data.tiles)
			setSolution([])
		} catch (error) {
			console.error(error)
		}
	}

	const handleSolve = async (method: string) => {
		try {
			const data = await solvePuzzle(method)
			setSolution(data.solution)
			setIsShowSolution(true)
		} catch (error) {
			console.error('Error solving puzzle:', error)
		}
	}
	return (
		<div>
			<div className='flex flex-col gap-2'>
				<CustomButton handleClick={handleShuffle} text='Shuffle' />
				<CustomButton handleClick={() => handleSolve('dfs')} text='DFS' />
				<CustomButton handleClick={() => handleSolve('a_star')} text='A*' />
				<CustomButton handleClick={() => handleSolve('greedy')} text='Greedy' />
			</div>

			<div className='flex flex-col items-center justify-center '>
        
          {(isShowSoulution ? soulution[indexShownSoulution] : tiles).map((row, rowIndex) => (
            <div key={rowIndex} className='flex'>
              {row.map((tile, tileIndex) => (
                <div
                  key={tileIndex}
                  className='border border-black  w-24 h-24 flex items-center justify-center text-4xl'
                >
                  {tile}
                </div>
              ))}
            </div>
          ))}
        
				
			</div>
		</div>
	)
}

export default Board
