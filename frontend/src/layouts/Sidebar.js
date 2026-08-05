import { Link, useLocation } from "react-router-dom";

const styles = `
  .sb-root {
    width: 240px;
    height: 100vh;
    background: #0a0e1a;
    border-right: 1px solid rgba(200,168,90,0.15);
    padding: 24px 16px;
    font-family: 'DM Sans', sans-serif;
    color: #f0ece0;
    position: sticky;
    top: 0;
    overflow-y: auto;
  }

  .sb-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 24px;
    color: #c8a85a;
  }

  .sb-section {
    margin-bottom: 24px;
  }

  .sb-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(240,236,224,0.4);
    margin-bottom: 10px;
  }

  .sb-link {
    display: block;
    padding: 10px 12px;
    border-radius: 8px;
    text-decoration: none;
    color: rgba(240,236,224,0.7);
    font-size: 14px;
    margin-bottom: 6px;
    transition: 0.2s;
  }

  .sb-link:hover {
    background: rgba(200,168,90,0.1);
    color: #c8a85a;
  }

  .sb-active {
    background: rgba(200,168,90,0.15);
    color: #c8a85a;
    border: 1px solid rgba(200,168,90,0.25);
  }
`;

function Sidebar({ role }) {
  const location = useLocation();
  const userRole = role?.toLowerCase().trim();

  const isActive   = (path)   => location.pathname === path;
  const isPrefix   = (prefix) => location.pathname.startsWith(prefix);

  return (
    <>
      <style>{styles}</style>

      <div className="sb-root">
        <div className="sb-title">Dashboard</div>

        {/* ================= ADMIN ================= */}
        {userRole === "system administrator" && (
          <div className="sb-section">
            <div className="sb-label">Admin</div>
            <Link to="/admin"  className={`sb-link ${isActive("/admin")  ? "sb-active" : ""}`}>Overview</Link>
            <Link to="/users"  className={`sb-link ${isActive("/users")  ? "sb-active" : ""}`}>Users</Link>
          </div>
        )}

        {/* ================= ELECTION MANAGER ================= */}
        {userRole === "election_manager" && (
          <>
            <div className="sb-section">
              <div className="sb-label">Management</div>
              <Link to="/elections"  className={`sb-link ${isActive("/elections")  ? "sb-active" : ""}`}>Elections</Link>
              <Link to="/positions"  className={`sb-link ${isActive("/positions")  ? "sb-active" : ""}`}> Positions</Link>
              <Link to="/vacancies"  className={`sb-link ${isActive("/vacancies")  ? "sb-active" : ""}`}> Vacancies</Link>
            </div>

            <div className="sb-section">
              <div className="sb-label">Process</div>
              <Link to="/screening"    className={`sb-link ${isActive("/screening")    ? "sb-active" : ""}`}> Screening</Link>
              <Link to="/shortlist"    className={`sb-link ${isActive("/shortlist")    ? "sb-active" : ""}`}> Shortlist</Link>
              <Link to="/voting-cards" className={`sb-link ${isActive("/voting-cards") ? "sb-active" : ""}`}> Voting Cards</Link>
              <Link to="/results"      className={`sb-link ${isPrefix("/results")      ? "sb-active" : ""}`}> Results</Link>
            </div>

            <div className="sb-section">
              <div className="sb-label">Other</div>
              <Link to="/complaints"      className={`sb-link ${isActive("/complaints")      ? "sb-active" : ""}`}> Complaints</Link>
              <Link to="/voter-request"   className={`sb-link ${isActive("/voter-request")   ? "sb-active" : ""}`}> Voter Request</Link>
              <Link to="/voter-validation" className={`sb-link ${isActive("/voter-validation") ? "sb-active" : ""}`}> Voter Validation</Link>
            </div>
          </>
        )}

        {/* ================= DEAN ================= */}
        {userRole === "college_dean" && (
          <div className="sb-section">
            <div className="sb-label">Dean</div>
            <Link to="/dean-upload" className={`sb-link ${isActive("/dean-upload") ? "sb-active" : ""}`}> Upload Voters</Link>
          </div>
        )}

        {/* ================= HR ================= */}
        {userRole === "hr" && (
          <div className="sb-section">
            <div className="sb-label">HR</div>
            <Link to="/hr-upload" className={`sb-link ${isActive("/hr-upload") ? "sb-active" : ""}`}> Upload Employees</Link>
          </div>
        )}

        {/* ================= VOTER ================= */}
        {userRole === "voter" && (
          <div className="sb-section">
            <div className="sb-label">Voter</div>
            <Link to="/voter"    className={`sb-link ${isActive("/voter")    ? "sb-active" : ""}`}>Dashboard</Link>
            <Link to="/manifesto" className={`sb-link ${isActive("/manifesto") ? "sb-active" : ""}`}>Manifesto</Link>
            <Link to="/vote"     className={`sb-link ${isActive("/vote")     ? "sb-active" : ""}`}> Vote</Link>
          </div>
        )}

        {/* ================= CANDIDATE ================= */}
        {userRole === "candidate" && (
          <div className="sb-section">
            <div className="sb-label">Candidate</div>
            <Link to="/candidate" className={`sb-link ${isActive("/candidate") ? "sb-active" : ""}`}> My Profile</Link>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;