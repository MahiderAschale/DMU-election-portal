import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

const columns = [
  { key: "employee_id", label: "Employee ID" },
  { key: "full_name", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone_number", label: "Phone" },
  { key: "department", label: "Department" },
  { key: "faculty", label: "Faculty" },
  { key: "job_title", label: "Job Title" }
];

const normalize = (value) => (value || "").trim().toLowerCase();
const getMatchKey = (record) =>
  `${normalize(record.full_name)}|${normalize(record.employee_id)}|${normalize(record.job_title)}`;

const csvValue = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

function DataTable({ rows, emptyText }) {
  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={styles.th}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={styles.emptyCell}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row.id || `${row.email}-${index}`}>
                {columns.map((column) => (
                  <td key={column.key} style={styles.td}>{row[column.key] || "-"}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function VoterValidationPage() {
  const [hr, setHr] = useState([]);
  const [dean, setDean] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validatingElectionId, setValidatingElectionId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.get("/voter-validation/data");
      const data = res.data?.data || {};
      setHr(data.hr || []);
      setDean(data.dean || []);
      setElections(data.elections || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch validation data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hrKeys = useMemo(() => new Set(hr.map(getMatchKey)), [hr]);

  const electionGroups = useMemo(() => {
    const electionById = new Map(elections.map((election) => [Number(election.id), election]));
    const deanElectionIds = [...new Set(dean.map((row) => Number(row.election_id)).filter(Boolean))];
    const ids = [...new Set([...elections.map((election) => Number(election.id)), ...deanElectionIds])];

    return ids.map((id) => {
      const rows = dean.filter((row) => Number(row.election_id) === id);
      const matched = rows.filter((row) => hrKeys.has(getMatchKey(row)));
      const unmatched = rows.filter((row) => !hrKeys.has(getMatchKey(row)));
      const election = electionById.get(id);

      return {
        id,
        title: election?.title || `Election ${id}`,
        status: election?.status || "unknown",
        rows,
        matched,
        unmatched,
        exists: Boolean(election)
      };
    }).filter((group) => group.rows.length > 0 || group.exists);
  }, [dean, elections, hrKeys]);

  const totals = useMemo(() => {
    const matchedCount = electionGroups.reduce((sum, group) => sum + group.matched.length, 0);
    const unmatchedCount = electionGroups.reduce((sum, group) => sum + group.unmatched.length, 0);
    return { matchedCount, unmatchedCount };
  }, [electionGroups]);

  const downloadCsv = useCallback((filename, rows) => {
    const header = columns.map((column) => csvValue(column.label)).join(",");
    const body = rows.map((row) =>
      columns.map((column) => csvValue(row[column.key])).join(",")
    );
    const csv = [header, ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleValidate = async (electionId) => {
    setValidatingElectionId(electionId);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(`/voter-validation/run/${electionId}`);
      setMessage(res.data?.message || "Validation completed");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Validation failed");
    } finally {
      setValidatingElectionId(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Voter Validation</h2>
          <p style={styles.subtitle}>Validate dean-submitted voters against HR records per election.</p>
        </div>

        <button type="button" onClick={fetchData} disabled={loading || Boolean(validatingElectionId)} style={styles.secondaryButton}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>HR Employees</span>
          <strong style={styles.summaryValue}>{hr.length}</strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Dean Submitted</span>
          <strong style={styles.summaryValue}>{dean.length}</strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Matched Voters</span>
          <strong style={styles.summaryValue}>{totals.matchedCount}</strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={styles.summaryLabel}>Not Matched</span>
          <strong style={styles.summaryValue}>{totals.unmatchedCount}</strong>
        </div>
      </div>

      {electionGroups.length === 0 ? (
        <section style={styles.section}>
          <p style={styles.emptyState}>No election voter uploads are available for validation yet.</p>
        </section>
      ) : (
        electionGroups.map((group) => {
          const isValidating = validatingElectionId === group.id;
          const canValidate = group.exists && group.matched.length > 0 && !loading && !validatingElectionId;

          return (
            <section key={group.id} style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>{group.title}</h3>
                  <p style={styles.sectionMeta}>
                    Election ID {group.id} · {group.status} · {group.matched.length} matched · {group.unmatched.length} not matched
                  </p>
                  {!group.exists && <p style={styles.warning}>This upload references an election that no longer exists.</p>}
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    onClick={() => downloadCsv(`election-${group.id}-matched-voters.csv`, group.matched)}
                    disabled={group.matched.length === 0}
                    style={styles.secondaryButton}
                  >
                    Download Matched
                  </button>
                  <button
                    type="button"
                    onClick={() => handleValidate(group.id)}
                    disabled={!canValidate}
                    style={styles.primaryButton}
                  >
                    {isValidating ? "Validating..." : "Validate This Election"}
                  </button>
                </div>
              </div>

              <div style={styles.subsection}>
                <h4 style={styles.subsectionTitle}>Matched Voters</h4>
                <DataTable rows={group.matched} emptyText="No matched voters for this election." />
              </div>

              <div style={styles.subsection}>
                <h4 style={styles.subsectionTitle}>Dean Records With No HR Match</h4>
                <DataTable rows={group.unmatched} emptyText="All dean records for this election match HR data." />
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 24,
    background: "#f7f9fc",
    minHeight: "100vh",
    color: "#1f2937"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: 18
  },
  title: {
    margin: 0,
    fontSize: 28
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b"
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center"
  },
  primaryButton: {
    border: "none",
    background: "#1d4ed8",
    color: "#ffffff",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600
  },
  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    padding: "9px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 12,
    marginBottom: 20
  },
  summaryItem: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 14
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8
  },
  summaryValue: {
    fontSize: 26
  },
  section: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    marginBottom: 18,
    overflow: "hidden"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap"
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18
  },
  sectionMeta: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 13
  },
  warning: {
    margin: "8px 0 0",
    color: "#b45309",
    fontSize: 13
  },
  subsection: {
    padding: 14,
    borderBottom: "1px solid #e2e8f0"
  },
  subsectionTitle: {
    margin: "0 0 10px",
    fontSize: 15
  },
  tableWrap: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900
  },
  th: {
    textAlign: "left",
    background: "#f1f5f9",
    color: "#334155",
    padding: "11px 12px",
    fontSize: 13,
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap"
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: 14,
    verticalAlign: "top"
  },
  emptyCell: {
    padding: 18,
    textAlign: "center",
    color: "#64748b"
  },
  emptyState: {
    margin: 0,
    padding: 18,
    color: "#64748b"
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    border: "1px solid #fecaca",
    padding: 10,
    borderRadius: 6
  },
  success: {
    color: "#166534",
    background: "#dcfce7",
    border: "1px solid #bbf7d0",
    padding: 10,
    borderRadius: 6
  }
};

export default VoterValidationPage;
