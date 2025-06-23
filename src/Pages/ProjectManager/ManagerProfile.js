import React, { useEffect, useState } from "react";
import "../../CSS/Profile.css";
import defaultProfile from "../../images/ilogo.png";
import editIcon from "../../images/edit-set.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ManagerSidebar from "./ManagerSidebar"; // Adjust path as needed


const ManagerProfile = () => {
    const [image, setImage] = useState(defaultProfile);
    const [isChangePassword, setIsChangePassword] = useState(false); // toggle mode

    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [formData, setFormData] = useState({});
    const [editable, setEditable] = useState(false);


    useEffect(() => {
        const userId = localStorage.getItem("userId");


        if (!userId) {
            alert("User not authenticated.");
            navigate("/");
            return;
        }

        fetchUserData(userId);
    }, []);

    const fetchUserData = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5178/api/users/${userId}`);
            const user = res.data;
            setUserData(user);
            console.log(res);
            setFormData({
                fullName: user.fullName,
                email: user.email,
                phoneNo: user.mobile,
                createdAt: user.createdAt,
                password: "",
                newPassword: "",
                confirmPassword: "",
            });

            if (user.image) {
                setImage(`http://localhost:5178${user.image}`);
            }

        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("image", file);

        try {
            const res = await axios.post(
                `http://localhost:5178/api/users/upload-image`,
                form,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            const imageUrl = res.data.imageUrl;
            setImage(`http://localhost:5178${imageUrl}`);

            // Save uploaded image path to user's profile
            await axios.put(
                `http://localhost:5178/api/users/update-image`,
                { imageUrl },
                { withCredentials: true }
            );

            // Optionally refresh user data
            fetchUserData(localStorage.getItem("userId"));
        } catch (err) {
            console.error("Image upload failed:", err);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleFormMode = () => {
        setIsChangePassword((prev) => !prev);
        setFormData((prev) => ({
            ...prev,
            password: "",
            newPassword: "",
            confirmPassword: "",
        }));
    };

    const handleSave = async () => {
        if (isChangePassword) {
            // Validation
            if (formData.newPassword !== formData.confirmPassword) {
                alert("New and confirm password do not match.");
                return;
            }
            if (!formData.newPassword) {
                alert("Please enter a new password.");
                return;
            }

            try {
                const token = localStorage.getItem("token"); // Adjust if token is stored differently
                if (!token) {
                    alert("You are not authenticated.");
                    return;
                }
                const response = await fetch(`http://localhost:5178/api/auth/change-password`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword: formData.password,
                        newPassword: formData.newPassword,
                    }),
                });

                if (response.ok) {
                    alert("Password changed successfully!");
                    toggleFormMode();
                    setFormData({ ...formData, password: "", newPassword: "", confirmPassword: "" });
                } else {
                    const errorText = await response.text();
                    alert(errorText || "Failed to change password.");
                }
            } catch (err) {
                alert("An error occurred.");
            }
        } else {
            // Profile Edit Validation
            const nameRegex = /^[a-zA-Z\s]{2,}$/;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^[0-9]{10}$/;

            if (!formData.fullName || !nameRegex.test(formData.fullName)) {
                alert("Please enter a valid name (letters only).");
                return;
            }

            if (!formData.email || !emailRegex.test(formData.email)) {
                alert("Please enter a valid email address.");
                return;
            }

            if (!formData.phoneNo || !phoneRegex.test(formData.phoneNo)) {
                alert("Please enter a valid 10-digit phone number.");
                return;
            }
            // Update profile logic
            try {
                await axios.put(
                    `http://localhost:5178/api/users/update`,
                    {
                        fullName: formData.fullName,
                        email: formData.email,
                        mobile: formData.phoneNo,
                    },
                    { withCredentials: true }
                );
                alert("Profile updated successfully.");
                setEditable(false);
                fetchUserData(localStorage.getItem("userId"));
            } catch (err) {
                alert("Failed to update profile.");
            }
        }
    };


    return (
        <div className="profile-page-wrapper">
            <ManagerSidebar />
            <div className="profile-content-container">
                <div className="profile-header">
                    <div className="profile-title">
                        <h4>Profile</h4>
                        <h6>User Profile</h6>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card-body">
                        <div className="profile-set">
                            <div className="profile-top">
                                <div className="profile-user-info">
                                    <div className="profile-image-container">
                                        <img src={localStorage.getItem("image")} alt="Profile" className="profile-img" />
                                    </div>
                                    {!isChangePassword && (
                                        <div className="profile-user-name">
                                            <h2>{userData.username || "Your Name"}</h2>
                                            <h4>Update Your Photo and Personal Details.</h4>
                                        </div>
                                    )}
                                </div>
                                <div className="profile-button-container">
                                    <button type="button" className="btn btn-submit" onClick={toggleFormMode}>
                                        {isChangePassword ? "Back to Profile" : "Change Password"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="profile-form">
                            {!isChangePassword ? (
                                <>
                                    <div className="profile-input-section">
                                        <div className="profile-form-group">
                                            <label>User Name</label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="User Name"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-input-section">
                                        <div className="profile-form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Email"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-input-section">
                                        <div className="profile-form-group">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                name="phoneNo"
                                                value={formData.phoneNo}
                                                onChange={handleChange}
                                                placeholder="Phone"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="profile-input-section">
                                        <div className="profile-form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Current Password"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-input-section">
                                        <div className="profile-form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                placeholder="New Password"
                                            />
                                        </div>
                                    </div>

                                    <div className="profile-input-section">
                                        <div className="profile-form-group">
                                            <label>Confirm New Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm New Password"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                        </div>
                        <div className="profile-button-section" style={{ marginLeft: "10px", marginTop: "30px" }}>
                            <button type="button" className="btn btn-submit" onClick={handleSave}>
                                Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-cancel"
                                onClick={() => {
                                    if (isChangePassword) toggleFormMode();
                                    else navigate('/managerdashboard');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerProfile;
