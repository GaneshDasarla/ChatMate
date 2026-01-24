import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/app.css";

export default function Login() {
  const { login, signup } = useAuth();

  const [isSignup, setIsSignup] = useState(false);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(""); // ✅ NEW
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setFullName("");
    setUsername(""); // ✅ NEW
    setBio("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignup) {
        // ✅ send username also
        await signup({ fullName, username, bio, email, password });
        toast.success("Signup successful ✅");
      } else {
        await login({ email, password });
        toast.success("Login successful ✅");
      }

      resetForm();
    } catch (err) {
      console.log("AUTH ERROR 👉", err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      toast.error(msg);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  return (
    <div className="centerPage">
      <div className="card">
        <h2>{isSignup ? "Create Account" : "Login"}</h2>

        <form onSubmit={handleSubmit} className="form">
          {isSignup && (
            <>
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              {/* ✅ NEW Username field */}
              <input
                placeholder="Username (unique)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <input
                placeholder="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </>
          )}

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn" type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="linkText">
          {isSignup ? "Already have account?" : "New user?"}{" "}
          <span className="link" onClick={toggleMode}>
            {isSignup ? "Login" : "Signup"}
          </span>
        </p>
      </div>
    </div>
  );
}
