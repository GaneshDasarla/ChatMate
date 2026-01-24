import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import "../styles/app.css";

export default function RightSidebar() {
  const { logout } = useAuth();
  const { selectedUser } = useChat();

  return (
    <div className="rightSidebar">
      <h3>User Info</h3>

      {selectedUser ? (
        <div>
          <img
            className="bigAvatar"
            src={selectedUser.profilePic || "https://via.placeholder.com/100"}
            alt="pic"
          />
          <h4>{selectedUser.fullName}</h4>
          <p>{selectedUser.bio}</p>
        </div>
      ) : (
        <p>No user selected</p>
      )}

      <button className="btn logoutBtn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
