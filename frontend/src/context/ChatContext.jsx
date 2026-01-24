import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, socket } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({}); // userId -> count

  // load all users
  useEffect(() => {
    const loadUsers = async () => {
      if (!user) return;

      const res = await api.get("/api/users/all");
      setUsers(res.data);
    };

    loadUsers();
  }, [user]);

  // load messages of selected user
  const loadMessages = async (otherUserId) => {
    const res = await api.get(`/api/messages/${otherUserId}`);
    setMessages(res.data);
  };

  // mark messages seen
  const markSeen = async (otherUserId) => {
    await api.put(`/api/messages/seen/${otherUserId}`);

    setUnreadCounts((prev) => ({
      ...prev,
      [otherUserId]: 0,
    }));
  };

  // select chat user
  const openChat = async (otherUser) => {
    setSelectedUser(otherUser);
    await loadMessages(otherUser._id);
    await markSeen(otherUser._id);
  };

  // receive realtime message
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
  // ✅ If already exists, don't add again
  setMessages((prev) => {
    const exists = prev.some((m) => m._id === msg._id);
    if (exists) return prev;
    return [...prev, msg];
  });

  // unread logic
  if (!selectedUser || msg.senderId !== selectedUser._id) {
    setUnreadCounts((prev) => ({
      ...prev,
      [msg.senderId]: (prev[msg.senderId] || 0) + 1,
    }));
  }
});


    return () => socket.off("receiveMessage");
  }, [socket, selectedUser]);

  // send message
  const sendMessage = async ({ receiverId, text, image }) => {
    const res = await api.post("/api/messages/send", {
      receiverId,
      text,
      image,
    });

    setMessages((prev) => [...prev, res.data]);

    if (socket) {
      socket.emit("sendMessage", {
        receiverId,
        message: res.data,
      });
    }
  };


  return (
    <ChatContext.Provider
      value={{
        users,
        selectedUser,
        openChat,
        messages,
        sendMessage,
        unreadCounts,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
