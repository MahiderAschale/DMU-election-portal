import { removeToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <div style={{
      height: "60px",
      background: "#eee",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 20px"
    }}>
      <h3>E-Voting System</h3>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;