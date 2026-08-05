import { useState } from "react";
import api from "../api/axios";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500&display=swap');

  .login-root {
    min-height: 100vh;
    background: #0a0e1a;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .login-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(200,168,90,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(200,168,90,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .login-card {
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

  .login-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 24px;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: #f0ece0;
    margin-bottom: 6px;
  }

  .login-sub {
    font-size: 14px;
    color: rgba(240,236,224,0.4);
    margin-bottom: 36px;
    font-weight: 300;
  }

  .login-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: rgba(240,236,224,0.5);
    margin-bottom: 8px;
  }

  .login-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(200,168,90,0.2);
    border-radius: 8px;
    color: #f0ece0;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    margin-bottom: 22px;
  }

  .login-input:focus {
    border-color: #c8a85a;
    background: rgba(200,168,90,0.05);
  }

  .login-input::placeholder { color: rgba(240,236,224,0.2); }

  .login-error {
    background: rgba(220,50,50,0.1);
    border: 1px solid rgba(220,50,50,0.3);
    border-radius: 8px;
    padding: 12px 16px;
    color: #ff7070;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .login-btn {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #c8a85a, #e0c57a);
    color: #0a0e1a;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.25s;
    letter-spacing: 0.3px;
  }

  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200,168,90,0.4);
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .login-divider {
    height: 1px;
    background: rgba(200,168,90,0.15);
    margin: 28px 0;
  }

  .login-footer {
    text-align: center;
    font-size: 12px;
    color: rgba(240,236,224,0.2);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, role, full_name, id } = res.data.data;
      const normalizedRole = (role || "").toLowerCase().trim();

      setToken(token);

      localStorage.setItem("user", JSON.stringify({ id, full_name, role, email }));

      if (normalizedRole === "system administrator" || normalizedRole === "admin") {
        navigate("/admin");
      } else if (normalizedRole === "election_manager") {
        navigate("/elections");
      } else if (normalizedRole === "college_dean") {
        navigate("/dean-upload");
      } else if (normalizedRole === "candidate") {
        navigate("/candidate");
      } else if (normalizedRole === "voter") {
        navigate("/voter");
      } else if (normalizedRole === "hr") {
        navigate("/hr-upload");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="login-bg-grid" />
        <div className="login-card">
          <div className="login-icon">🔑</div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-sub">Sign in to the E-Voting System</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <label className="login-label">Email Address</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div className="login-divider" />
          <div className="login-footer">Secure · Encrypted · Verified</div>
        </div>
      </div>
    </>
  );
}

export default Login;
