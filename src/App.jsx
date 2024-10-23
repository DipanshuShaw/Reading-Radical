import '../src/CSS/App.css'
import AboutUs from './components/AboutUs'
import Footer from './components/Footer'
import Header from './components/Header'
import Home from './components/Home'
import Navbar from './components/Navbar'
import Contact from './components/Contact'
import Reviewer from './components/Reviewer'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/Login'
import Register from './components/Register'
import Explore from './components/Explore'
import Motivational from './components/ExploreChild/Motivational'
import Action from './components/ExploreChild/Action'
import Scifi from './components/ExploreChild/Scifi'
import Comics from './components/ExploreChild/Comics'
import Romantic from './components/ExploreChild/Romantic'
import Detective from './components/ExploreChild/Detective'
import All from './components/ExploreChild/All'

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: 
      <>
        <Header/>
        <Navbar/>
        <Home/>
        <Footer/>
      </>
    },
    {
      
      path: "/aboutus",
      element: 
      <>
        <Header/>
        <Navbar/>
        <AboutUs/>
        <Footer/>
      </>
    },
    {
      path: "/contact",
      element: 
      <>
        <Header/>
        <Navbar/>
        <Contact/>
        <Footer/>
      </>
    },
    {
      path: "/reviewer",
      element: 
      <>
        <Header/>
        <Navbar/>
        <Reviewer/>
        <Footer/>
      </>
    },
    {
      path: "/explore",
      element: 
      <>
        <Header/>
        <Navbar/>
        <Explore/>
        <Footer/>
      </>,
      children: [
        {
          path: "motivational",
          element: 
          <>
            <Motivational/>
          </>
        },
        {
          path: "all",
          element: 
          <>
            <All/>
          </>
        },
        {
          path: "romantic",
          element: 
          <>
            <Romantic/>
          </>
        },
        {
          path: "scifi",
          element: 
          <>
            <Scifi/>
          </>
        },
        {
          path: "action",
          element: 
          <>
            <Action/>
          </>
        },
        {
          path: "comics",
          element: 
          <>
            <Comics/>
          </>
        },
        {
          path: "detective",
          element: 
          <>
            <Detective/>
          </>
        },
      ]
    },
    {
      path: "/login",
      element: 
      <>
        <Login/>
      </>
    },
    {
      path: "/register",
      element: 
      <>
        <Register/>
      </>
    },
  ]);

  return (
    <>
    <RouterProvider router={router} />
    </>
  )
}

export default App