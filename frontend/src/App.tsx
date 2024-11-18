import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Route, Router, Routes } from 'react-router-dom'
import Board from './pages/Board'
import Results from './pages/Results'
import Navbar from './components/Navbar'
import NotFound from './pages/NotFound'

function App() {




  return (
    <div className='flex h-screen relative w-full'>
      <div className='absolute top-0'>
      <Navbar/>

      </div>
      <div className='w-full h-screen mt-12'>
        <Routes>
          <Route path='/' element={<Board/>} />
          <Route path='/results' element={<Results/>} />
          <Route path='*' element={<NotFound/>} />
        </Routes>

      </div>
    </div>
    
  )
}

export default App
