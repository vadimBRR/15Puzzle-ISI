import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {

  const [active, setActive] = React.useState(1)
  const navLinks = [
    {id: 1,
      name: 'Single',
      link: '/'
    },
    {id: 2,
      name: 'Together',
      link: '/all'
    },
    {id: 3,
      name: 'Results',
      link: '/results'
    },
   
  ]
  return (
    <div className=' flex flex-row justify-between px-5 py-4'>
      <div className='flex flex-row gap-5 items-end'>
        <h1 className='text-2xl text-main'>Magic Puzzle</h1>
        {navLinks.map((item)=>(
          <Link key={item.id} to={item.link} className={`text-xl ${active === item.id ? 'text-primary font-bold' : ''}`} onClick={() => setActive(item.id)}><p>{item.name}</p></Link>
          
        ))}
      </div>

    </div>
  )
}

export default Navbar