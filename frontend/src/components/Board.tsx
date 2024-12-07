import React from 'react';

interface BoardProps {
  tiles: number[][];
}

const Board = ({ tiles }: BoardProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {tiles.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((tile, tileIndex) => (
            <div
              key={tileIndex}
              className={`border border-white w-24 h-24 flex items-center justify-center text-4xl font-bold text-white
                ${tile === 0 ? 'bg-transparent' : ''} 
                ${tile === 1 ? 'bg-blue-600' : ''} 
                ${tile === 2 ? 'bg-green-600' : ''} 
                ${tile === 3 ? 'bg-yellow-600' : ''} 
                ${tile === 4 ? 'bg-orange-600' : ''} 
                ${tile === 5 ? 'bg-purple-600' : ''} 
                ${tile === 6 ? 'bg-pink-600' : ''} 
                ${tile === 7 ? 'bg-teal-600' : ''} 
                ${tile === 8 ? 'bg-indigo-600' : ''} 
                ${tile === 9 ? 'bg-gray-600' : ''} 
                ${tile === 10 ? 'bg-red-600' : ''} 
                ${tile === 11 ? 'bg-yellow-500' : ''} 
                ${tile === 12 ? 'bg-blue-500' : ''} 
                ${tile === 13 ? 'bg-green-500' : ''} 
                ${tile === 14 ? 'bg-purple-500' : ''}`}
            >
              {tile === 0 ? '' : tile}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
