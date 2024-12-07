import React, { useEffect, useState } from "react";
import { getAllResults, PuzzleResult, getStatistics } from "../api";

const Results = () => {
  const [results, setResults] = useState<PuzzleResult[]>([]);
  const [statistics3, setStatistics3] = useState<any[]>([]); 
  const [statistics4, setStatistics4] = useState<any[]>([]); 

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllResults();
        setResults(data);

        const statsData3 = await getStatistics(10); 
        const statsData4 = await getStatistics(10,4); 

        setStatistics3(statsData3);
        setStatistics4(statsData4);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center text-xl text-white mt-8">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-500 text-xl mt-8">
        Error: {error}
      </div>
    );

  const groupedResults = results.reduce<Record<string, PuzzleResult[]>>(
    (groups, result) => {
      const batchId = result.batchId || "Unknown Batch";
      if (!groups[batchId]) groups[batchId] = [];
      groups[batchId].push(result);
      return groups;
    },
    {}
  );

  return (
    <div className="my-6 mx-12 min-h-screen">

      <h1 className="text-3xl font-bold text-center text-white mb-6">Algorithms Statistics (Last 10 Runs)</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Board 3x3</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2">Algorithm</th>
                <th className="px-4 py-2">Solutions Found</th>
                <th className="px-4 py-2">Avg Time</th>
                <th className="px-4 py-2">Avg Moves</th>
              </tr>
            </thead>
            <tbody>
              {statistics3.map((stat) => (
                <tr key={stat.method} className="border-b border-gray-600 text-gray-300">
                  <td className="px-4 py-2">{stat.method.toUpperCase()}</td>
                  <td className="px-4 py-2">{stat.solved}</td>
                  <td className="px-4 py-2">{stat.avgTime}</td>
                  <td className="px-4 py-2">{stat.avgMoves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Board 4x4</h2>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="px-4 py-2">Algorithm</th>
                <th className="px-4 py-2">Solutions Found</th>
                <th className="px-4 py-2">Avg Time</th>
                <th className="px-4 py-2">Avg Moves</th>
              </tr>
            </thead>
            <tbody>
              {statistics4.map((stat) => (
                <tr key={stat.method} className="border-b border-gray-600 text-gray-300">
                  <td className="px-4 py-2">{stat.method.toUpperCase()}</td>
                  <td className="px-4 py-2">{stat.solved}</td>
                  <td className="px-4 py-2">{stat.avgTime}</td>
                  <td className="px-4 py-2">{stat.avgMoves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-center text-white mt-12 mb-6">Results({results.length})</h1>

      {Object.entries(groupedResults).map(([batchId, batchResults]) => (
        <div key={batchId} className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Batch ID: <span className="text-blue-400">{batchId}</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Elapsed Time</th>
                  <th className="px-4 py-2">Move Count</th>
                  <th className="px-4 py-2">Is Solved</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((result) => (
                  <tr key={result.id} className="border-b border-gray-600 text-gray-300">
                    <td className="px-4 py-2">{result.id}</td>
                    <td className="px-4 py-2">{result.method}</td>
                    <td className="px-4 py-2">{result.size}</td>
                    <td className="px-4 py-2">
                      {result.elapsedTime.toFixed(10)}s
                    </td>
                    <td className="px-4 py-2">{result.moveCount}</td>
                    <td className="px-4 py-2">{result.isSolved ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">
                      {new Date(result.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Results;
