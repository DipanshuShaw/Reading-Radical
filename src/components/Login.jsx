import React from 'react'
import '../CSS/loginCSS.css'
import {
  Link
} from "react-router-dom";



const Login = () => {
    const styleHead={paddingBottom: '5px', borderBottom: '4px solid white'}
  return (
    <div className='loginBody'>
      <form className="bodylogin" method="post" action="/login">
            <div className="boxlogin">
                <div class = "h3" align="center"  style={styleHead}><h3>LOGIN</h3></div>
                <br/>
                <div className="h3"><input type="Username" placeholder="Username" className="input" name="username"/></div>
                <br/>
                <div className="h3"><input type="Password" placeholder="Password" className="input" name="password"/></div>
                <br/>
                <div className="checkbox"><input type="checkbox" name="" id=""/>Remember Me</div>
                <div>
                    <div className="button"><Link type="submit" className="input" id="button" to='/'>LOGIN</Link></div>
                </div>
                <br/>
                <div className="h3"><Link to="../register" id="register">New User? Register</Link></div>
            </div>
        </form>
    </div>
  )
}

export default Login
