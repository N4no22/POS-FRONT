import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // 🔥 CARGAR USUARIO DESDE LOCALSTORAGE
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // 🔐 LOGIN
  const login = async (email, password) => {
  try {
    const res = await fetch("http://localhost:3000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) return false;

    const data = await res.json();

    setUser(data.usuario);

    // 🔥 GUARDAR TODO
    localStorage.setItem("user", JSON.stringify(data.usuario));
    localStorage.setItem("token", data.token);

    return true;

  } catch (error) {
    console.error(error);
    return false;
  }
};

  // 🚪 LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
  };

  // ⏱️ CONTROL DE INACTIVIDAD (1 hora)
  useEffect(() => {

    const checkActivity = () => {
      const last = localStorage.getItem("lastActivity");

      if (!last) return;

      const now = Date.now();
      const diff = now - Number(last);

      const ONE_HOUR = 60 * 60 * 1000;

      if (diff > ONE_HOUR) {
        logout();
      }
    };

    const interval = setInterval(checkActivity, 60000); // cada 1 min

    return () => clearInterval(interval);

  }, []);

  // 🖱️ ACTUALIZAR ACTIVIDAD
  useEffect(() => {

    const updateActivity = () => {
      localStorage.setItem("lastActivity", Date.now());
    };

    window.addEventListener("click", updateActivity);
    window.addEventListener("keydown", updateActivity);

    return () => {
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };

  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);