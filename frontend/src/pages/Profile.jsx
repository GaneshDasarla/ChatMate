import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "../styles/app.css";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePic, setProfilePic] = useState("");

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

    try {
      const base64 = await convertToBase64(file);
      setProfilePic(base64);
    } catch (err) {
      toast.error("Image convert failed ❌");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        fullName,
        bio,
      };

      // ✅ send profilePic only if user selected an image
      if (profilePic) {
        payload.profilePic = profilePic;
      }

      await updateProfile(payload);
      toast.success("Profile updated ✅");
    } catch (err) {
      console.log("UPDATE ERROR 👉", err);
      toast.error(err?.response?.data?.message || "Update failed ❌");
    }
  };

  return (
    <div className="centerPage">
      <div className="card">
        <h2>Edit Profile</h2>

        <form onSubmit={handleSave} className="form">
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <input type="file" accept="image/*" onChange={handleImage} />

          <button className="btn" type="submit">
            Save
          </button>
        </form>

        {/* ✅ show preview (if selected) */}
        {profilePic && (
          <img className="preview" src={profilePic} alt="preview" />
        )}
      </div>
    </div>
  );
}
