// pages/ActivateAccount.jsx
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .act-root {
    min-height: 100vh;
    background: #0a0e1a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .act-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(200,168,90,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,168,90,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .act-card {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 420px;
    background: #11162a;
    border: 1px solid rgba(200,168,90,0.2);
    border-radius: 16px;
    padding: 48px 44px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }
  .act-icon {
    width: 52px; height: 52px;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin-bottom: 24px;
  }
  .act-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px; font-weight: 700; color: #f0ece0; margin-bottom: 6px;
  }
  .act-sub {
    font-size: 14px; color: rgba(240,236,224,0.4); margin-bottom: 36px; font-weight: 300;
  }
  .act-label {
    display: block; font-size: 11px; font-weight: 500; letter-spacing: 1.5px;
    text-transform: uppercase; color: rgba(240,236,224,0.45); margin-bottom: 7px;
  }
  .act-input {
    width: 100%; padding: 12px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(200,168,90,0.2);
    border-radius: 8px; color: #f0ece0;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.2s, background 0.2s; margin-bottom: 18px;
  }
  .act-input:focus { border-color: #c8a85a; background: rgba(200,168,90,0.05); }
  .act-input::placeholder { color: rgba(240,236,224,0.2); }
  .act-btn {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    color: #0a0e1a; font-family: 'DM Sans', sans-serif;
    font-size: 15px; font-weight: 600; border: none;
    border-radius: 8px; cursor: pointer; transition: all 0.25s;
  }
  .act-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,168,90,0.4); }
  .act-msg {
    margin-top: 16px; font-size: 14px; text-align: center;
    color: rgba(240,236,224,0.6); padding: 10px;
    border-radius: 8px; background: rgba(200,168,90,0.05);
    border: 1px solid rgba(200,168,90,0.15);
  }
`;

function ActivateAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleActivate = async () => {
    if (password !== confirmPassword) return setMessage("❌ Passwords do not match");
    
    // Strict password validation: 8+ chars, 1 capital, 1 special
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return setMessage("❌ Password must be at least 8 characters long, include one uppercase letter, and one special character.");
    }

    try {
      await axios.post("/auth/activate", { token, password });
      setMessage(" Account activated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Activation failed or link expired");
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="act-root">
        <div className="act-bg" />
        <div className="act-card">
           <h2 className="act-title">Activate Account</h2>
          <p className="act-sub">Set your password to get started</p>

          <label className="act-label">New Password</label>
          <input
            className="act-input"
            type="password"
            placeholder="Min 8 chars, 1 Capital, 1 Special"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="act-label">Confirm Password</label>
          <input
            className="act-input"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="act-btn" onClick={handleActivate}>
            Activate Account
          </button>

          {message && <p className="act-msg">{message}</p>}
        </div>
      </div>
    </>
  );
}

export default ActivateAccount;
