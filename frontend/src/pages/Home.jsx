import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar setSelectedUser={setSelectedUser} />

      <div style={{ flex: 1 }}>
        {!selectedUser ? (
          <div style={{ padding: "30px" }}>
            <h2>Select a user to start chatting ✅</h2>
          </div>
        ) : (
          <ChatContainer selectedUser={selectedUser} />
        )}
      </div>

      {/* Optional */}
      <RightSidebar />
    </div>
  );
};

export default Home;
