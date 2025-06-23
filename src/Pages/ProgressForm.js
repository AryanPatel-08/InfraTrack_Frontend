import React, { useState, useEffect } from "react";
import "../CSS/ProgressForm.css";
import Sidebar from "../Pages/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { showAlert } from '../utils/sweetAlert';

const ProgressForm = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false); // Toggle state
    const [error, setError] = useState("");
    const [projects, setProjects] = useState([]); // List of projects
    const [quotationName, setQuotationName] = useState("");


    const [formData, setFormData] = useState({
        projectId: "",
        Description: "",
        completionDate: null
    });

    // Fetch project list from API on component mount
    useEffect(() => {
        const fetchAvailableProjects = async () => {
            try {
                const projectsRes = await axios.get(`http://localhost:5178/api/Projects`);
                const progressesRes = await axios.get(`http://localhost:5178/api/Progresses`);

                console.log("Projects:", projectsRes.data);
                console.log("Progresses:", progressesRes.data);

                const usedProjectIds = progressesRes.data.map(p => p.projectId);

                // ✅ Filter out already-used projects
                const availableProjects = projectsRes.data.filter(p => !usedProjectIds.includes(p.projectId));

                setProjects(availableProjects);
            } catch (error) {
                console.error("❌ Error while fetching projects or progresses:", error);
                setError("Failed to load projects. Please try again later.");
            }
        };

        fetchAvailableProjects();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "projectId") {
            const selectedProject = projects.find(p => p.projectId === parseInt(value));

            setFormData(prev => ({
                ...prev,
                projectId: value
            }));

            setFormData((prev) => ({
                ...prev,
                [name]: name === "completionDate" && value === "" ? null : value,
            }));

            // Set the quotation name from selected project (if exists)
            setQuotationName(selectedProject?.quotation?.quotationName || "");
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const { projectId, Description } = formData;

        if (!projectId || !Description) {
            setError("Please fill in all required fields.");
            return;
        }

        // if (new Date(completionDate) < new Date(startDate)) {
        //     setError("Completion date cannot be earlier than start date.");
        //     return;
        // }

        try {
            const response = await axios.post("http://localhost:5178/api/Progresses", formData, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("Progress added:", response.data);
            setError("");

            // Show success alert after adding progress and navigate after it closes
            showAlert(
                "success",
                "Progress Added",
                "Progress added successfully!",
                "", // No redirect URL here for showAlert
                3000 // Auto-close after 3 seconds
            ).then(() => {
                // Redirect to the Progress List page after the alert closes
                navigate("/ProgressList");
            });

            // Clear the form data
            setFormData({
                projectId: "",
                Description: "",
                completionDate: ""
            });
        } catch (err) {
            console.error("Error adding progress:", err);
            const apiError = err.response?.data?.detail || err.message || "Internal Server Error";
            setError(apiError);
        }
    };


    const handleCancel = () => {
        // Show confirmation dialog and handle result
        showAlert(
            "warning", // Set the type to 'warning'
            "Are you sure?", // Title of the confirmation
            "Do you really want to clear the form?", // Message of the confirmation
            "", // No redirect URL here
            0, // No timer
            true // This is a confirmation dialog
        ).then((result) => {
            if (result.isConfirmed) {
                // Reset form data after confirmation
                setFormData({
                    projectId: "",
                    Description: "",
                    completionDate: ""
                });

                // Optionally redirect to the Progress List page
                navigate("/ProgressList");
            }
        }).catch(error => {
            console.error("Error in alert handling:", error);
        });
    };

    return (
        <div className="progress-form-container">
            <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <Sidebar />
            </div>

            {/* <h2>Add Progress</h2>
            <div className="progress-sub-title">
                <p>Add/Update Progress</p>
            </div> */}

            <div className="sub-title">
                <h2>Add Progress</h2>
                <p className="subtitle-text">Manage your Project</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="progress-form-grid">
                    {/* Project Select */}
                    <div>
                        <label htmlFor="projectId">Project Name</label>
                        <select
                            name="projectId"
                            id="projectId"
                            value={formData.projectId}
                            onChange={handleChange}
                            required
                        // disabled={projects.length === 0}
                        >
                            <option value="">-- Choose Project --</option>
                            {projects.length > 0 ? (
                                projects.map((project) => (
                                    <option key={project.projectId} value={project.projectId}>
                                        {project.projectName}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>
                                    All projects already in progress
                                </option>
                            )}
                        </select>
                    </div>

                    {/* Quotation */}
                    <div>
                        <label>Quotation Name</label>
                        <input
                            type="text"
                            value={quotationName}
                            readOnly
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label>Description</label>
                        <input
                            type="text"
                            name="Description"
                            value={formData.Description || ""}
                            onChange={handleChange}
                            placeholder="Enter Description"
                        />
                    </div>
                </div> {/* End of progress-form-grid */}

                {error && <div className="progress-error-message">{error}</div>}

                {/* Button Group */}
                <div className="progress-button-group">
                    <button type="submit" className="progress-submit-btn">Submit</button>
                    <button type="button" className="progress-cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ProgressForm;
