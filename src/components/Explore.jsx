import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Template from './Template';

const Explore = () => {

  const [liClass,setLiClass] = useState("");

  const handleActive = (isActive)=> {
      temp = isActive?  'active' : '';
      setLiClass(temp)
  }

  return (
    <>
      <nav className="explore-nav">
      <ul>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/all'}>All</NavLink></li>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/romantic'}>Romantic</NavLink></li>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/action'}>Action</NavLink></li>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/motivational'}>Motivational</NavLink></li>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/scifi'}>Sci-Fi</NavLink></li>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/detective'}>Detective</NavLink></li>
          <li className={liClass}><NavLink onClick={({isActive})=> handleActive(isActive)} className='button' type="buttton" to={'/explore/comics'}>Comics</NavLink></li>
          {/* <input type="search" name="" id="" placeholder="Search" /> */}
        </ul>
      </nav>
      {/* <Template/> */}
      <Outlet />
    </>
  )
}

export default Explore
