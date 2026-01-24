import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // set token in axios
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // ✅ connect socket only once when token exists
  useEffect(() => {
    if (!token) return;

    const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(socketInstance);

    socketInstance.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  // ✅ Load user from backend
  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;

      try {
        const res = await api.get("/api/users/check");
        setUser(res.data);
      } catch (err) {
        logout();
      }
    };

    loadUser();
    // eslint-disable-next-line
  }, [token]);

  // ✅ After user is loaded + socket is ready → add user to socket
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit("addUser", user._id);
    }
  }, [socket, user]);

  const signup = async (data) => {
    const res = await api.post("/api/users/signup", data);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const login = async (data) => {
    const res = await api.post("/api/users/login", data);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setOnlineUsers([]);
    if (socket) socket.disconnect();
    setSocket(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put("/api/users/update", data);
    setUser(res.data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signup,
        login,
        logout,
        updateProfile,
        socket,
        onlineUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
