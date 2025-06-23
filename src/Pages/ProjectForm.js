import React, { useState, useEffect } from "react";
import "../CSS/ProjectForm.css";
import Sidebar from "../Pages/Sidebar";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert } from '../utils/sweetAlert';

const ProjectForm = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [user, setUser] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [error, setError] = useState("");
    const [statuses, setStatus] = useState([]);
    const [selectStatus, selectSetStatus] = useState('');
    const [availableQuotations, setAvailableQuotations] = useState([]);
    const [selectedQuotationId, setSelectedQuotationId] = useState('');
    const location = useLocation();
    const editingProject = location.state?.project || null;

    const [formData, setFormData] = useState({
        projectName: "",
        location: "",
        clientId: "",
        userId: "",
        duration: "",
        startDate: "",
        expectedEndDate: "",
        status: "",
        quotationId: "",
        description: "",
    });

    useEffect(() => {
        if (editingProject) {
            // console.log(editingProject);
            console.log("Loaded Project:", editingProject);
            console.log("Project Manager ID:", editingProject.userId);
            setFormData({
                projectId: editingProject.projectId,
                projectName: editingProject.projectName,
                location: editingProject.location,
                clientId: editingProject.clientId,
                userId: editingProject.userId,
                duration: editingProject.duration?.toString() || "", // Ensure string
                startDate: editingProject.startDate,
                expectedEndDate: editingProject.expectedEndDate,
                status: editingProject.status,
                quotationId: editingProject.quotationId,
                description: editingProject.description,
            });

            // Set the selected quotation ID when editing
            setSelectedQuotationId(editingProject.quotationId?.toString() || '');

        } else {
            // For Add form, set today's date for startDate
            setFormData(prev => ({
                ...prev,
                startDate: getTodayDate(),
            }));
        }
    }, [editingProject]);

    // Helper function outside your component or inside (above useEffect)
    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    useEffect(() => {
        axios.get("http://localhost:5178/api/Clients")
            .then(res => setClients(res.data))
            .catch(error => console.error("Error fetching clients:", error));

        // axios.get("http://localhost:5178/api/Quotations")
        //     .then(res => setQuotations(res.data))
        //     .catch(error => console.error("Error fetching quotations:", error));

    }, []);

    const handleDurationChange = (e) => {
        const value = e.target.value;
        if (value.length <= 3 && /^[0-9]*$/.test(value)) {
            setFormData({ ...formData, duration: value });
        }
    };

    useEffect(() => {
        const fetchProjectManagers = async () => {
            try {
                const url = editingProject
                    ? `http://localhost:5178/api/Users/projectmanagers?includeUserId=${editingProject.userId}`
                    : `http://localhost:5178/api/Users/projectmanagers`;

                const response = await axios.get(url, {
                    withCredentials: true, // include if using authentication cookies
                });

                setUser(response.data); // update your dropdown state
                console.log("Project Managers:", response.data);
            } catch (error) {
                console.error("Error fetching project managers:", error);
            }
        };

        fetchProjectManagers();
    }, [editingProject]);

    // Update the useEffect for fetching available quotations to include the current quotation when editing
    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                let quotations;
                if (editingProject) {
                    // If editing, fetch all quotations to ensure we have the current one
                    const response = await axios.get('http://localhost:5178/api/Quotations/available');
                    quotations = response.data;
                } else {
                    // If adding new, fetch only available quotations
                    const response = await axios.get('http://localhost:5178/api/Quotations/available');
                    quotations = response.data;
                }
                setAvailableQuotations(quotations);
            } catch (error) {
                console.error('Error fetching quotations:', error);
            }
        };

        fetchQuotations();
    }, [editingProject]);

    // Empty Field Error Message
    const [formErrors, setFormErrors] = useState({});
    const validateForm = () => {
        let errors = {
            projectName: "",
            location: "",
            clientId: "",
            userId: "",
            duration: "",
            startDate: "",
            expectedEndDate: "",
            status: "",
            quotationId: "",
            description: "",
        };
        let isValid = true;

        // Project Name: Required, only letters and spaces
        if (!formData.projectName.trim()) {
            errors.projectName = "Project name is required.";
            isValid = false;
        } else if (!/^[A-Za-z\s]{3,50}$/.test(formData.projectName.trim())) {
            errors.projectName = "Project name must be 3-50 characters and only letters/spaces.";
            isValid = false;
        }

        // Location: Required, only letters, commas, periods, and spaces
        if (!formData.location.trim()) {
            errors.location = "Location is required.";
            isValid = false;
        } else if (!/^[A-Za-z\s,.-]{3,50}$/.test(formData.location.trim())) {
            errors.location = "Location must be 3-50 characters and valid format.";
            isValid = false;
        }

        // Client ID: Must be a valid selection (not default empty or "Select")
        if (!formData.clientId || formData.clientId === "Select") {
            errors.clientId = "Please select a valid client.";
            isValid = false;
        }

        // Duration: Required and must be a positive number (in days/months/etc.)
        if (!formData.duration) {
            errors.duration = "Duration is required.";
            isValid = false;
        } else if (!/^\d+$/.test(formData.duration.trim()) || parseInt(formData.duration, 10) <= 0) {
            errors.duration = "Duration must be a positive number.";
            isValid = false;
        }

        // Date Validation Helper
        const isValidDate = (dateStr) => {
            return !isNaN(new Date(dateStr).getTime());
        };

        // Start Date
        if (!formData.startDate) {
            errors.startDate = "Start date is required.";
            isValid = false;
        } else if (!isValidDate(formData.startDate)) {
            errors.startDate = "Invalid start date format.";
            isValid = false;
        }

        // Experted End Date
        if (!formData.expectedEndDate) {
            errors.expectedEndDate = "Experted end date is required.";
            isValid = false;
        } else if (!isValidDate(formData.expectedEndDate)) {
            errors.expectedEndDate = "Invalid end date format.";
            isValid = false;
        } else if (new Date(formData.expectedEndDate) < new Date(formData.startDate)) {
            errors.expectedEndDate = "Experted End date cannot be before start date.";
            isValid = false;
        }

        // Quotation ID: Must be selected
        if (!formData.quotationId || formData.quotationId === "Select") {
            errors.quotationId = "Please select a quotation.";
            isValid = false;
        }

        // Description: Optional, but if entered must be 10+ characters
        if (formData.description && formData.description.trim().length < 10) {
            errors.description = "Description must be at least 10 characters.";
            isValid = false;
        }

        // Add User ID validation
        if (!formData.userId) {
            errors.userId = "Please select a project manager.";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting project data:", formData);

        if (!validateForm()) return;

        try {
            const isUpdate = formData.projectId !== undefined && formData.projectId !== null;
            const url = isUpdate
                ? `http://localhost:5178/api/Projects/${formData.projectId}`
                : "http://localhost:5178/api/Projects";

            const method = isUpdate ? axios.put : axios.post;

            // Convert dates to DateOnly format (YYYY-MM-DD)
            const formatDate = (dateString) => {
                if (!dateString) return null;
                return dateString.split('T')[0];
            };

            // Format the request data to match ProjectRequest model
            const requestData = {
                projectId: formData.projectId || 0,
                projectName: formData.projectName,
                location: formData.location,
                clientId: parseInt(formData.clientId),
                userId: parseInt(formData.userId),
                startDate: formatDate(formData.startDate),
                expectedEndDate: formatDate(formData.expectedEndDate),
                endDate: null,
                status: parseInt(formData.status) || 1,
                quotationId: parseInt(selectedQuotationId),
                description: formData.description || ""
            };

            console.log("Sending request data:", requestData);

            const response = await method(url, requestData, {
                headers: { "Content-Type": "application/json" }
            });

            const actionText = isUpdate ? "updated" : "added";
            const successTitle = isUpdate ? "Project Updated" : "Project Added";

            console.log(`Project ${actionText}:`, response.data);
            setError("");

            showAlert(
                'success',
                successTitle,
                `${formData.projectName} has been ${actionText} successfully!`,
                "",
                3000
            ).then(() => {
                navigate("/ProjectList");
            });

            setFormData({
                projectId: null,
                projectName: "",
                location: "",
                clientId: "",
                userId: "",
                duration: "",
                startDate: "",
                expectedEndDate: "",
                status: "",
                quotationId: "",
                description: "",
            });
            selectSetStatus('');
        } catch (err) {
            console.error("Error submitting project:", err);
            const apiError = err.response?.data?.detail || err.message || "Internal Server Error";
            setError(apiError);

            showAlert(
                'error',
                'Error Submitting Project',
                apiError,
                "",
                3000
            );
        }
    };

    const handleCancel = () => {
        // Show confirmation dialog before clearing the form
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
                    projectName: "",
                    location: "",
                    clientId: "",
                    userId: "",
                    startDate: "",
                    expectedEndDate: "",
                    status: "",
                    quotationId: "",
                    description: ""
                });

                setError(""); // Clear any existing error message

                // Redirect to the ProjectList page
                navigate("/ProjectList"); // Redirect to Project List page
            }
        }).catch(error => {
            console.error("Error in alert handling:", error);
        });
    };

    // Project Status API

    useEffect(() => {
        const fetchStatusesAndQuotations = async () => {
            try {
                // Fetch project statuses
                const statusRes = await axios.get("http://localhost:5178/api/Projects/getprojectstatus");
                const statusesData = statusRes.data || [];
                setStatus(Array.isArray(statusesData) ? statusesData : []);

                // Set initial status in formData
                if (editingProject && editingProject.status) {
                    setFormData(prev => ({
                        ...prev,
                        status: editingProject.status.toString()
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        status: "1" // Default to Pending
                    }));
                }

                // Fetch quotations based on edit/add mode
                let quotationsRes;
                if (editingProject) {
                    // Fetch only available quotations on edit
                    quotationsRes = await axios.get('http://localhost:5178/api/Quotations/available');
                } else {
                    // For adding new project, also fetch available quotations
                    quotationsRes = await axios.get('http://localhost:5178/api/Quotations/available');
                }
                const quotationsData = quotationsRes.data || [];
                setAvailableQuotations(Array.isArray(quotationsData) ? quotationsData : []);

                // If editingProject has a quotationId, and it's not in availableQuotations,
                // optionally add it so user can still see current quotation
                if (editingProject?.quotationId) {
                    const hasCurrentQuotation = quotationsData.some(q => q.quotationId === editingProject.quotationId);
                    if (!hasCurrentQuotation) {
                        // Fetch the current quotation separately and add to availableQuotations
                        const currentQuotationRes = await axios.get(`http://localhost:5178/api/Quotations/${editingProject.quotationId}`);
                        setAvailableQuotations(prev => [...prev, currentQuotationRes.data]);
                    }
                }
            } catch (err) {
                console.error("Error fetching statuses or quotations:", err);
                setStatus([]);
                setAvailableQuotations([]);
            }
        };

        fetchStatusesAndQuotations();
    }, [editingProject]);


    useEffect(() => {
        if (formData.startDate && formData.expectedEndDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.expectedEndDate);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const durationInMs = end - start;
                const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24)); // Convert ms to days

                if (durationInDays >= 0 && formData.duration !== durationInDays.toString()) {
                    setFormData(prev => ({
                        ...prev,
                        duration: durationInDays.toString()
                    }));
                }
            }
        }
    }, [formData.startDate, formData.expectedEndDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const updatedForm = { ...prev };

            // Handle numeric fields
            if (["clientId", "quotationId", "userId"].includes(name)) {
                updatedForm[name] = value ? parseInt(value, 10) || "" : "";
            } else {
                updatedForm[name] = value;
            }

            // Ensure `status` is always a valid string
            if (name === "status") {
                updatedForm.status = value;
            }

            return updatedForm;
        });
    };

    return (
        <div className="project-container">
            <Sidebar />
            <div className="sub-title">
                <h2>{editingProject ? "Update Project" : "Project Add"}</h2>
                <p className="subtitle-text">Manage your Project</p>
            </div>
            {/* Form Section */}
            <form onSubmit={handleSubmit}>
                {console.log("User List:", user)}
                <div className="form-grid-project">
                    <div>
                        <label>Project Name</label>
                        <input type="text" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Enter Project Name" />
                        {formErrors.projectName && <p className="error-text">{formErrors.projectName}</p>}
                    </div>
                    <div>
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location || ""} onChange={handleChange} placeholder="Enter Location" />
                        {formErrors.location && <p className="error-text">{formErrors.location}</p>}
                    </div>
                    <div>
                        <label>Client Name</label>
                        <select name="clientId" value={formData.clientId || ""} onChange={handleChange}
                            disabled={editingProject}
                        >
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.clientId} value={client.clientId}>{client.clientName}</option>
                            ))}
                        </select>
                        {formErrors.clientId && <p className="error-text">{formErrors.clientId}</p>}
                    </div>
                    <div>
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={formData.startDate || ""} onChange={handleChange}
                            disabled={editingProject}
                        />
                        {formErrors.startDate && <p className="error-text">{formErrors.startDate}</p>}
                    </div>
                    <div>
                        <label>Experted End Date</label>
                        <input type="date" name="expectedEndDate" value={formData.expectedEndDate || ""} onChange={handleChange}
                            min={formData.startDate}
                        />
                        {formErrors.expectedEndDate && <p className="error-text">{formErrors.expectedEndDate}</p>}
                    </div>

                    <div>
                        <label>Duration (Days)</label>
                        <input type="number" name="duration" value={formData.duration || ""} onChange={handleDurationChange} maxLength={3} disabled />
                        {formErrors.duration && <p className="error-text">{formErrors.duration}</p>}
                    </div>
                    {editingProject && (
                        <div>
                            <label>Project Status</label>
                            <select
                                name="status"
                                value={formData.status || "1"}
                                onChange={handleChange}
                            >
                                {statuses.map((s, index) => (
                                    <option key={index} value={s.id}
                                        disabled={
                                            (editingProject && s.id === 1 && formData.status !== 1) ||
                                            (s.id === 4 && formData.status !== 4)
                                        }
                                    >
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {formErrors.status && <p className="error-text">{formErrors.status}</p>}
                        </div>
                    )}

                    <div>
                        <label>Quotation</label>
                        <select
                            name="quotationId"
                            value={selectedQuotationId || ''}
                            disabled={editingProject}
                            onChange={e => {
                                const selectedId = e.target.value;
                                setSelectedQuotationId(selectedId);
                                setFormData(prev => ({ ...prev, quotationId: selectedId }));
                            }}
                        >
                            <option value="">Choose Quotation</option>
                            {Array.isArray(availableQuotations) && availableQuotations.map((q, index) => (
                                <option key={index} value={q.quotationId}>
                                    {q.quotationName}
                                </option>
                            ))}
                        </select>
                        {formErrors.quotationId && <p className="error-text">{formErrors.quotationId}</p>}
                    </div>
                    <div>
                        <label>Project Manager</label>
                        <select
                            name="userId"
                            value={formData.userId?.toString() || ""}
                            onChange={handleChange}
                        >
                            <option value="">Select Project Manager</option>
                            {user.map(u => (
                                <option key={u.userId} value={u.userId.toString()}>
                                    {u.fullName}
                                </option>
                            ))}
                        </select>

                        {formErrors.userId && <p className="error-text">{formErrors.userId}</p>}
                    </div>
                    <div className="full-width">
                        <label>Description</label>
                        <textarea name="description" value={formData.description || ""} onChange={handleChange} placeholder="Enter Description"></textarea>
                        {formErrors.description && <p className="error-text">{formErrors.description}</p>}
                    </div>
                </div>
                {/* Buttons */}
                <div className="button-group-project">
                    <button type="submit" className="submit-btn-project">Submit</button>
                    <button type="button" className="cancel-btn-project" onClick={(handleCancel)}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
