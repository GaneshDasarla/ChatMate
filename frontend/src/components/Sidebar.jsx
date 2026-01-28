import { useEffect, useState } from "react";
import axios from "axios";
import SearchUsers from "./SearchUsers";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/app.css";

export default function Sidebar({ setSelectedUser }) {
  const [recentChats, setRecentChats] = useState([]);
  const { users, openChat, unreadCounts } = useChat();
  const { onlineUsers } = useAuth();
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // ✅ Fetch recent chats (DEPLOY SAFE)
  const fetchRecentChats = async () => {
    try {
      if (!token) return;

      const res = await axios.get(
        `${BACKEND_URL}/api/messages/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecentChats(res.data);
    } catch (error) {
      setRecentChats([]);
    }
  };

  useEffect(() => {
    fetchRecentChats();
  }, []);

  const handleSelectUser = (user) => {
    if (setSelectedUser) setSelectedUser(user);
    openChat(user);
    fetchRecentChats();
  };

  return (
    <div className="sidebar">
      <div className="sidebarHeader">
        <h3>Chats</h3>
        <button className="smallBtn" onClick={() => navigate("/profile")}>
          Edit Profile
        </button>
      </div>

      {/* ✅ SEARCH USERS */}
      <SearchUsers onSelectUser={handleSelectUser} />

      {/* ✅ RECENT CHATS */}
      <div style={{ padding: "10px" }}>
        <h4>Recent Chats</h4>

        {recentChats.length === 0 ? (
          <p style={{ fontSize: "14px", color: "gray" }}>
            No recent chats. Search username to start.
          </p>
        ) : (
          recentChats.map((u) => (
            <div
              key={u._id}
              className="userRow"
              onClick={() => handleSelectUser(u)}
            >
              <div className="userInfo">
                <img
                  className="avatar"
                  src={u.profilePic || "https://via.placeholder.com/50"}
                  alt="pic"
                />
                <div>
                  <p className="username">{u.fullName}</p>
                  <p className="status">
                    {onlineUsers.includes(u._id) ? "🟢 Online" : "⚪ Offline"}
                  </p>
                </div>
              </div>

              {unreadCounts?.[u._id] > 0 && (
                <span className="badge">{unreadCounts[u._id]}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* ✅ ALL USERS */}
      <div style={{ padding: "10px" }}>
        <h4>All Users</h4>

        {users.map((u) => (
          <div
            key={u._id}
            className="userRow"
            onClick={() => handleSelectUser(u)}
          >
            <div className="userInfo">
              <img
                className="avatar"
                src={u.profilePic || "https://via.placeholder.com/50"}
                alt="pic"
              />
              <div>
                <p className="username">{u.fullName}</p>
                <p className="status">
                  {onlineUsers.includes(u._id) ? "🟢 Online" : "⚪ Offline"}
                </p>
              </div>
            </div>

            {unreadCounts?.[u._id] > 0 && (
              <span className="badge">{unreadCounts[u._id]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
