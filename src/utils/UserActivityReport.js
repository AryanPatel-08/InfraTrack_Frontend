import React, { useState } from "react";
import axios from "axios";
import "../CSS/UserActivityReport.css"; // Optional for styling

const UserActivityReport = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [userReports, setUserReports] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      setError("");
      if (!searchTerm.trim()) {
        setError("Please enter a username to search.");
        return;
      }

      const response = await axios.get(`http://localhost:5178/api/Logs/report/${searchTerm}`);
      if (response.data.length === 0) {
        setUserReports([]);
        setError("No data found for this user.");
      } else {
        setUserReports(response.data);
      }
    } catch (err) {
      setUserReports([]);
      setError("User not found or error fetching data.");
    }
  };

  return (
    <div className="user-report-container">
      <h2 className="report-heading"> 
        <i className="fas fa-chart-line"></i> User Activity Summary
      </h2>
      <div className="report-search-bar">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button className="useractivity-search-btn" onClick={handleSearch}>🔍 Search</button>
      </div>


      {error && <p className="error">{error}</p>}

      {userReports.length > 0 && (
        <div className="table-responsive">
          <table className="report-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Tasks Done</th>
                <th className="status-column">Status</th>
              </tr>
            </thead>
            <tbody>
              {userReports.map((report, index) => (
                <tr key={index}>
                  <td>{report.userName}</td>
                  <td>{report.role}</td>
                  <td>{new Date(report.loginTime).toLocaleString()}</td>
                  <td>{report.logoutTime ? new Date(report.logoutTime).toLocaleString() : "Active"}</td>
                  <td>{report.tasksDone}</td>
                  <td className="status-column">
                    <span
                      className={`useractivity-status-badge ${report.status ? "active" : "inactive"
                        }`}
                    >
                      {report.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserActivityReport;
