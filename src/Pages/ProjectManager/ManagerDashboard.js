import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../CSS/AdminDashboard.css";
import ManagerSidebar from "./ManagerSidebar"; // Adjust path as needed

const DashboardCards = () => {
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState([]);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const Username = localStorage.getItem("name");
    if (Username) {
      setUserName(Username);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("Fetching projects for Project Manager with userId:", userId);

      axios.get(`http://localhost:5178/api/Projects/by-userid/${userId}`)
        .then((response) => {
          const assignedProjects = response.data;
          console.log("Fetched assigned projects:", assignedProjects);
          setProjects(assignedProjects);
        })
        .catch((error) => {
          console.error("Error fetching assigned projects:", error);
        });
    } else {
      console.warn("No userId found in localStorage.");
    }
  }, [userId]);

  return (
    <div className="dashboard-wrapper">
      <ManagerSidebar />
      <div className="greeting-section">
        <h2>
          Good Morning, {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "User"}!
        </h2>
        <p>Your database and components are refreshed</p>
      </div>

      <div className="project-list-section">
        <h3 className="project-list-title">Assigned Projects</h3>
        <ul className="project-list">
          {projects.length === 0 ? (
            <p>No assigned projects found.</p>
          ) : (
            projects.map((project) => (
              <li key={project.projectId} className="project-list-item">
                <strong>{project.projectName}</strong> - {project.description}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardCards;
