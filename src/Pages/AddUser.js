import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Pages/Sidebar";
import "../CSS/AddUser.css";
import axios from "axios";
import { showAlert } from "../utils/sweetAlert";

function AddUser() {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        roleId: "",
        fullName: "",
        mobile: "",
        email: "",
        image: "", // can be URL string or File,
        password: ""
    });
    const [imagePreview, setImagePreview] = useState(null); // base64 or URL

    const [formErrors, setFormErrors] = useState({
        fullName: "",
        mobile: "",
        email: "",
        roleId: "",
    });

    const location = useLocation();
    const editingUser = location.state?.user;
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5178/api/Roles")
            .then(res => {
                if (Array.isArray(res.data)) {
                    setRoles(res.data);
                } else {
                    console.error("Unexpected data format for roles");
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching roles:", error);
                setIsLoading(false);
            });
    }, []);
    // console.log(formData);
    useEffect(() => {
        if (editingUser) {
            setFormData({
                userId: editingUser.userId || "",
                fullName: editingUser.fullName || "",
                mobile: editingUser.mobile || "",
                email: editingUser.email || "",
                roleId: editingUser.roleId || "",
                image: editingUser.image || "",
                password: editingUser.password || ""
            });
            setImagePreview(editingUser.image || null);
        }
    }, [editingUser]);


    const checkIfMobileExists = async (mobile, userId = null) => {
        try {
            const response = await axios.get("http://localhost:5178/api/Users/CheckMobileExists", {
                params: { mobile, userId }
            });
            return response.data.exists;
        } catch (error) {
            console.error("Error checking mobile:", error);
            return false; // Allow if error occurs
        }
    };

    const checkIfEmailExists = async (email, userId) => {
        try {
            const response = await axios.get(`http://localhost:5178/api/Users/check-email`, {
                params: { email, excludeUserId: userId }
            });
            return response.data.exists;
        } catch (error) {
            console.error("Email check failed", error);
            return false;
        }
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormErrors({ ...formErrors, [e.target.name]: "" });
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        if (value.length <= 10 && /^[0-9]*$/.test(value)) {
            setFormData({ ...formData, mobile: value });
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, image: "" });
        setImagePreview(null);
    };

    const validateForm = async () => {
        let errors = {};
        let isValid = true;

        if (!formData.fullName.trim()) {
            errors.fullName = "Full name is required.";
            isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(formData.fullName.trim())) {
            errors.fullName = "User name can contain only letters and spaces.";
            isValid = false;
        }

        // Mobile
        if (!formData.mobile.trim()) {
            errors.mobile = "Mobile number is required.";
            isValid = false;
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            errors.mobile = "Mobile number must be 10 digits.";
            isValid = false;
        } else {
            const mobileExists = await checkIfMobileExists(formData.mobile.trim(), formData.userId);
            if (mobileExists) {
                errors.mobile = "Mobile number already exists.";
                isValid = false;
            }
        }

        // Email
        if (!formData.email.trim()) {
            errors.email = "Email is required.";
            isValid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = "Invalid email format.";
            isValid = false;
        } else {
            const emailExists = await checkIfEmailExists(formData.email.trim(), formData.userId);
            if (emailExists) {
                errors.email = "Email already exists.";
                isValid = false;
            }
        }
        
        // Role
        if (!formData.roleId) {
            errors.roleId = "Role is required.";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const isUpdate = formData.userId !== undefined && formData.userId !== null && formData.userId !== "";

        try {
            const url = isUpdate
                ? `http://localhost:5178/api/Users/${formData.userId}`
                : "http://localhost:5178/api/Users";

            const method = isUpdate ? axios.put : axios.post;

            const formPayload = new FormData();

            // Append all form fields
            formPayload.append('UserId', formData.userId || 0);
            formPayload.append('RoleId', formData.roleId);
            formPayload.append('Email', formData.email.trim());
            formPayload.append('Mobile', formData.mobile);
            formPayload.append('FullName', formData.fullName.trim());

            if (formData.image instanceof File) {
                formPayload.append('image', formData.image); // new file selected
            } else if (typeof formData.image === 'string' && formData.image) {
                formPayload.append('imageUrl', formData.image); // reuse existing URL
            }


            for (let pair of formPayload.entries()) {
                console.log(pair[0], pair[1]);
            }
            // return;

            const response = await method(url, formPayload, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            });

            const actionText = isUpdate ? "updated" : "added";
            const successTitle = isUpdate ? "User Updated" : "User Added";

            showAlert(
                "success",
                successTitle,
                `${formData.fullName} has been ${actionText} successfully!`,
                "",
                3000
            ).then(() => {
                navigate("/ListUser");
            });

            setFormData({
                userId: null,
                roleId: "",
                fullName: "",
                mobile: "",
                email: "",
                image: ""
            });
            setImagePreview(null);
        } catch (err) {
            const apiError = err.response?.data?.detail || err.message || "Internal Server Error";
            // setError(apiError);

            if (apiError === "Email is already registered.") {
                setError(prev => ({ ...prev, email: apiError }));
            } else {
                setError(apiError);
            }

            showAlert(
                "error",
                isUpdate ? "Error Updating User" : "Error Adding User",
                apiError,
                "",
                3000
            );
        }
    };

    const handleCancel = () => {
        showAlert(
            "warning",
            "Are you sure?",
            "Your input will be cleared and you'll be redirected!",
            "",
            0,
            true
        ).then((result) => {
            if (result.isConfirmed) {
                setFormData({ roleId: "", fullName: "", mobile: "", email: "", image: "" });
                setImagePreview(null);
                navigate("/ListUser");
            }
        });
    };

    return (
        <div className="user-container">
            <Sidebar />
            <div className="user-form-wrapper">
                <div className="sub-title">
                    <h2>{editingUser ? "Update User" : "Add New User"}</h2>
                    <p className="subtitle-text">Manage your User</p>
                </div>

                {isLoading && <p>Loading roles...</p>}

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="add-user-form-grid">
                        <div className="user-form-group">
                            <label>User Name</label>
                            <input type="text" value={formData.fullName} name="fullName" onChange={handleChange} />
                            {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
                        </div>

                        <div className="user-form-group">
                            <label>Mobile</label>
                            <input type="tel" value={formData.mobile} name="mobile" onChange={handleMobileChange} />
                            {formErrors.mobile && <div className="error-message">{formErrors.mobile}</div>}
                        </div>

                        <div className="user-form-group">
                            <label>Email</label>
                            <input type="email" value={formData.email} name="email" onChange={handleChange} />
                            {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                            {/* Show error message if exists */}
                            {error.email && (
                                <div style={{ color: "red", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                                    {error.email}
                                </div>
                            )}
                        </div>

                        <div className="user-form-group">
                            <label>Role</label>
                            <select name="roleId" value={formData.roleId} disabled={editingUser} onChange={handleChange}>
                                <option value="">Select</option>
                                {roles.map(r => (
                                    <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                                ))}
                            </select>
                            {formErrors.roleId && <div className="error-message">{formErrors.roleId}</div>}
                        </div>

                        <div className="user-form-group">
                            <label>User Photo</label>
                            <input
                                type="file"
                                id="userImageInput"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                            />
                            {imagePreview && (
                                <div className="image-preview">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: "100px", height: "100px", objectFit: "cover" }}
                                    />
                                    <button type="button" onClick={handleRemoveImage} className="remove-image-btn">
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="user-form-buttons">
                        <button type="submit" className="user-submit-btn">Submit</button>
                        <button type="button" onClick={handleCancel} className="user-cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUser;
