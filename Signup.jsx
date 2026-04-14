import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/LOGO1.png";
import showPassword from "../assets/showpassword.png";
import hidePassword from "../assets/hidepassword.png";
import returnIcon from "../assets/return.png";
import "./Login.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);

  const nav = useNavigate();

  useEffect(() => setAnimate(true), []);

  const handleSignup = async () => {
    setError("");

    if (password !== confirm) {
      setError("Passwords don’t match 🙂");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: name });
      nav("/");
    } catch (err) {
  console.error("Signup error:", err);
  setError(err.message);
}
  };

  const isValid = name && email && password && confirm;

  return (
    <div className="auth-container">

      <button className="back-btn" onClick={() => nav("/")}>
        <img src={returnIcon} alt="back" />
      </button>

      <img src={logo} alt="CookBook Logo" className="logo-img" />
   

      <div className="tabs">
        <div className="tab active">Sign up</div>
        <Link to="/login" className="tab">Log in</Link>
      </div>
   <h2 className="auth-title">Get Started</h2>
      <p className="subtext">
  Create an account and start cooking meals you'll love, one recipe at a time.
</p>
      {error && <p className="error">{error}</p>}

      {/* Username */}
      <div className={`input-group floating ${animate ? "fade-input" : ""}`}>
        <input
          type="text"
          placeholder={nameFocus ? "e.g. Juan" : " "}
          value={name}
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
          onChange={(e) => setName(e.target.value)}
        />
        <label>
          {nameFocus ? "Username" : "What should we call you?"}
        </label>
      </div>

      {/* Email */}
      <div className={`input-group floating ${animate ? "fade-input" : ""}`}>
        <input
          type="email"
          placeholder={emailFocus ? "example@email.com" : " "}
          value={email}
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
        />
        <label>
          {emailFocus ? "Email address" : "What's your email?"}
        </label>
      </div>

      {/* Password */}
      <div className={`input-group floating ${animate ? "fade-input" : ""}`}>
        <input
          type={showPass ? "text" : "password"}
          placeholder={passFocus ? "Use 6+ chars" : " "}
          value={password}
          onFocus={() => setPassFocus(true)}
          onBlur={() => setPassFocus(false)}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>
          {passFocus ? "Password" : "Create a password"}
        </label>

        <img
          src={showPass ? hidePassword : showPassword}
          alt="toggle"
          className="toggle-pass"
          onClick={() => setShowPass(!showPass)}
        />
      </div>

      {/* Confirm */}
      <div className={`input-group floating ${animate ? "fade-input" : ""}`}>
        <input
          type={showConfirm ? "text" : "password"}
          placeholder={confirmFocus ? "Repeat password" : " "}
          value={confirm}
          onFocus={() => setConfirmFocus(true)}
          onBlur={() => setConfirmFocus(false)}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <label>
          {confirmFocus ? "Confirm password" : "Confirm your password"}
        </label>

        <img
          src={showConfirm ? hidePassword : showPassword}
          alt="toggle"
          className="toggle-pass"
          onClick={() => setShowConfirm(!showConfirm)}
        />
      </div>

      <button className="login-btn" onClick={handleSignup} disabled={!isValid}>
        Sign up
      </button>

    </div>
  );
}