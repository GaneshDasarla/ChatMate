import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import "../styles/app.css";

export default function ChatContainer() {
  const { selectedUser, messages, sendMessage } = useChat();
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [image, setImage] = useState("");

  // ✅ time helper
  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setImage(base64);
  };

  const handleSend = async () => {
    if (!selectedUser) return;
    if (!text && !image) return;

    await sendMessage({
      receiverId: selectedUser._id,
      text,
      image,
    });

    setText("");
    setImage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser) {
    return <div className="chatBox emptyChat">Select a user to start chat ✅</div>;
  }

  return (
    <div className="chatBox">
      <div className="chatHeader">
        <h3>{selectedUser.fullName}</h3>
      </div>

      <div className="messagesArea">
        {messages.map((m) => {
          const isMe = m.senderId === user?._id;

          return (
            <div
              key={m._id}
              className={`messageRow ${isMe ? "right" : "left"}`}
            >
              <div className={`messageBubble ${isMe ? "me" : "other"}`}>
                {m.text && <p className="msgText">{m.text}</p>}

                {m.image && (
                  <img className="chatImage" src={m.image} alt="img" />
                )}

                {/* ✅ time below msg */}
                <div
                  style={{
                    fontSize: "11px",
                    opacity: 0.6,
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chatInput">
        <input
          value={text}
          placeholder="Type message..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input type="file" accept="image/*" onChange={handleImage} />

        <button className="btn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
