import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API from "../services/api.js"

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  useEffect(() => {
    if (token) {
      axios.get(`${API}/auth/verificar`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .catch(() => {
        logout();
        window.location.href = "/login";
      });
    }
  }, [token]);

  const login = (data) => {
    setUsuario(data.usuario);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken(null);
    setUsuario(null);
  };

  const handleAuthError = (error) => {
    if (
      error?.response?.status === 401 ||
      (error?.response?.data?.error && error.response.data.error.includes("jwt expired"))
    ) {
      logout();
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, handleAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
