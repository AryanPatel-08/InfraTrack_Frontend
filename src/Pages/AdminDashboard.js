import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaFileAlt } from "react-icons/fa";
import "../CSS/AdminDashboard.css";
import UserActivityReport from "../utils/UserActivityReport";

const DashboardCards = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalQuotations: 0,
    totalClients: 0,
  });

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const Username = localStorage.getItem("name");
    if (Username) {
      setUserName(Username);
    }
  }, []);


  console.log("Current userName state:", userName);  // Debugging line

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5178/api/Dashboard");
        console.log("API Response:", response.data); // Debugging
        setStats(response.data); // Store API data in state
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { count: stats.totalProjects, label: "Total Projects", color: "#00CFFF", icon: <FaFileAlt /> },
    { count: stats.totalQuotations, label: "Total Quotations", color: "#152347", icon: <FaFileAlt /> },
    { count: stats.totalClients, label: "Total Clients", color: "#22C55E", icon: <FaUser /> },
    { count: stats.totalUsers, label: "Total Users", color: "#FFA43A", icon: <FaUser /> },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="greeting-section">
        {/* <h2>Good Morning, {userName || "User"}!</h2> */}
        <h2>Good Morning, {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "User"}!</h2>
        <p>Your database and components are refreshed</p>
      </div>

      <div className="dashboard-container">
        {cards.map((card, index) => (
          <div key={index} className="dashboard-card" style={{ backgroundColor: card.color }}>
            <div className="card-content">
              <div className="text-section">
                <h2>{card.count}</h2>
                <p>{card.label}</p>
              </div>
              <div className="icon-section">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <UserActivityReport />
    </div>
  );
};

export default DashboardCards;
