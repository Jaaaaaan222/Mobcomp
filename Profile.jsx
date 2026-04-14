import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile, updatePassword } from "firebase/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) navigate("/login");
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const handleNameUpdate = async () => {
    if (newName.trim().length < 2) {
      setPasswordError("Name must be at least 2 characters");
      setSuccessMsg("");
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setUser({ ...user, displayName: newName });
      setEditingName(false);
      setSuccessMsg("Name updated successfully!");
      setPasswordError("");
    } catch (err) {
      setPasswordError(err.message);
      setSuccessMsg("");
    }
  };

  const handlePasswordUpdate = async () => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      setSuccessMsg("");
      return;
    }

    try {
      await updatePassword(auth.currentUser, password);
      setPassword("");
      setShowPasswordField(false);
      setSuccessMsg("Password updated successfully!");
      setPasswordError("");
    } catch (err) {
      setPasswordError(err.message);
      setSuccessMsg("");
    }
  };

  const formatName = (name) => {
    if (!name) return "No Name";
    return name.length > 8 ? name.slice(0, 8) + "..." : name;
  };

  if (!user) return null;

  // ✅ INLINE STYLES
  const styles = {
    page: {
      minHeight: "100vh",
      padding: "100px 20px 40px",
      background: "#f6f7f9",
      display: "flex",
      justifyContent: "center",
      fontFamily: "Segoe UI",
       marginTop: "50px",
    },

    card: {
      width: "100%",
      maxWidth: "500px",
      background: "#fff",
      padding: "20px",
      borderRadius: "14px",
      boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
    },

    title: {
      fontSize: "22px",
      marginBottom: "5px",
    },

    subtitle: {
      fontSize: "14px",
      color: "#666",
      marginBottom: "20px",
    },

    row: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid #eee",
    },

    label: {
      color: "#666",
      fontSize: "14px",
    },

    value: {
      fontSize: "14px",
      fontWeight: "500",
    },

    button: {
      background: "#eaeaea",
      border: "none",
      padding: "6px 10px",
      borderRadius: "8px",
      cursor: "pointer",
    },

    inputRow: {
      display: "flex",
      gap: "10px",
      marginTop: "10px",
    },

    input: {
      flex: 1,
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      outline: "none",
    },

    saveBtn: {
      background: "#c6e44b",
      border: "none",
      padding: "10px 14px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "600",
    },

    actionBtn: {
      width: "100%",
      padding: "12px",
      background: "#ff5722",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      marginTop: "10px",
      cursor: "pointer",
    },

    logoutBtn: {
      width: "100%",
      padding: "14px",
      background: "#f44336",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      marginTop: "15px",
      cursor: "pointer",
    },

    error: {
      color: "red",
      fontSize: "13px",
      textAlign: "center",
      marginTop: "10px",
    },

    success: {
      color: "green",
      fontSize: "13px",
      textAlign: "center",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <h2 style={styles.title}>My Profile</h2>
        <p style={styles.subtitle}>Manage your account</p>

        {/* USERNAME */}
        <div style={styles.row}>
          <span style={styles.label}>Username</span>
          <span style={styles.value}>{formatName(user.displayName)}</span>
          <button style={styles.button} onClick={() => {
            setEditingName(true);
            setNewName(user.displayName || "");
          }}>
            Edit
          </button>
        </div>

        {editingName && (
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter username"
            />
            <button style={styles.saveBtn} onClick={handleNameUpdate}>
              Save
            </button>
          </div>
        )}

        {/* EMAIL */}
        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>{user.email}</span>
        </div>

        {/* PASSWORD */}
        <button style={styles.actionBtn}
          onClick={() => setShowPasswordField(!showPasswordField)}
        >
          Change Password
        </button>

        {showPasswordField && (
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
            <button style={styles.saveBtn} onClick={handlePasswordUpdate}>
              Save
            </button>
          </div>
        )}

        {/* MESSAGES */}
        {passwordError && <p style={styles.error}>{passwordError}</p>}
        {successMsg && <p style={styles.success}>{successMsg}</p>}

        {/* LOGOUT */}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>

      </div>
    </div>
  );
}