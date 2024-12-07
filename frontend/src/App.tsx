import { Route, Router, Routes } from 'react-router-dom'
import Main from './pages/Main'
import Results from './pages/Results'
import Navbar from './components/Navbar'
import NotFound from './pages/NotFound'

function App() {
	return (
		<div className='flex h-screen relative w-full'>
			<div className='absolute top-0'>
				<Navbar />
			</div>
			<div className='w-full h-screen mt-12'>
				<Routes>
					<Route path='/' element={<Main />} />
					<Route path='/results' element={<Results />} />
					<Route path='*' element={<NotFound />} />
				</Routes>
			</div>
		</div>
	)
}

export default App
