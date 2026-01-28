import { useEffect, useState } from "react";
import axios from "axios";

const SearchUsers = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const q = query.trim();
        if (q.length < 2) {
          setUsers([]);
          return;
        }

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/search`,
          {
            params: { query: q },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(res.data || []);
      } catch (error) {
        console.error("User search failed:", error);
        setUsers([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div style={{ padding: "10px" }}>
      <input
        type="text"
        placeholder="Search username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          outline: "none",
        }}
      />

      {users.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                onSelectUser(u);
                setQuery("");
                setUsers([]);
              }}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #f1f1f1",
              }}
            >
              <b>@{u.username}</b>
              <div style={{ fontSize: "12px", color: "gray" }}>
                {u.fullName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUsers;
