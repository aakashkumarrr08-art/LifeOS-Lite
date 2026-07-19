import { createContext, useEffect, useState } from 'react';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../services/api.js';
import {
  getProfile as getProfileRequest,
  loginUser as loginUserRequest,
  registerUser as registerUserRequest,
} from '../services/authService.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const initialiseAuth = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setAuthReady(true);
        return;
      }

      try {
        const response = await getProfileRequest();
        setUser(response.user);
      } catch (error) {
        clearStoredToken();
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };

    initialiseAuth();
  }, []);

  const register = async (payload) => {
    const response = await registerUserRequest(payload);
    setStoredToken(response.token);
    setUser(response.user);
    return response;
  };

  const login = async (payload) => {
    const response = await loginUserRequest(payload);
    setStoredToken(response.token);
    setUser(response.user);
    return response;
  };

  const refreshProfile = async () => {
    const response = await getProfileRequest();
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authReady,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshProfile,
        register,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };

