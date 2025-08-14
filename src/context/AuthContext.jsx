import React, { createContext, useState, useEffect } from 'react';

// Create the Auth context
export const AuthContext = createContext();

// AuthProvider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Login function saves user info to state and localStorage
  const login = (userData) => {
    setUser(userData); // userData should contain a `name` field
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function clears user info
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // On component mount, load user from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
