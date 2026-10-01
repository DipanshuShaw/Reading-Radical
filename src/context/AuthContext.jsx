import { createContext, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

const KEY = 'rr_auth';

// "Remember me" -> localStorage (survives restart). Otherwise sessionStorage (cleared on tab close).
function readStored() {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null };
  } catch {
    return { user: null, token: null };
  }
}

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(readStored);

  // data = { user, token } as returned by /api/users/login or /register
  const login = useCallback((data, remember = true) => {
    const next = { user: data.user, token: data.token };
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(next));
    setAuth(next);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    setAuth({ user: null, token: null });
  }, []);

  const value = useMemo(() => ({ ...auth, login, logout }), [auth, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

export default AuthProvider;
