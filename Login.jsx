import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/LOGO1.png";
import showPassword from "../assets/showpassword.png";
import hidePassword from "../assets/hidepassword.png";
import returnIcon from "../assets/return.png";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [animate, setAnimate] = useState(false);

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => setAnimate(true), []);

  const isValid = email && password.length >= 6;

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const from = location.state?.from || "/";
      nav(from, { replace: true });
    } catch {
      setError("Hmm… that email or password doesn’t look right.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert("Type your email first 🙂");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("We’ve sent you a reset link 📩");
    } catch {
      alert("Oops, try again.");
    }
  };

  return (
    <div className="auth-container">

      <button className="back-btn" onClick={() => nav("/")}>
        <img src={returnIcon} alt="back" />
      </button>

      <img src={logo} alt="CookBook Logo" className="logo-img" />
 
      <div className="tabs">
        <Link to="/signup" className="tab">Sign up</Link>
        <div className="tab active">Log in</div>
      </div>
          <h2 className="auth-title">Welcome Back</h2>
      <p className="subtext">
  Welcome back. Sign in to continue exploring recipes and cooking your favorite dishes.
</p>

      {error && <p className="error">{error}</p>}

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
          placeholder={passFocus ? "At least 6 characters" : " "}
          value={password}
          onFocus={() => setPassFocus(true)}
          onBlur={() => setPassFocus(false)}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>
          {passFocus ? "Password" : "Enter your password"}
        </label>

        <img
          src={showPass ? hidePassword : showPassword}
          alt="toggle"
          className="toggle-pass"
          onClick={() => setShowPass(!showPass)}
        />
      </div>

      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember Me
        </label>

        <span className="forgot" onClick={handleForgotPassword}>
          Forgot Password?
        </span>
      </div>

      <button className="login-btn" onClick={handleLogin} disabled={!isValid}>
        Log in
      </button>

    </div>
  );
}