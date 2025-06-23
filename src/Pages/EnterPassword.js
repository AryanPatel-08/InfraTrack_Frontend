import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../CSS/EnterPassword.css";

function EnterPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setError("Both fields are required!");
        } else if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long!");
        } else if (newPassword !== confirmPassword) {
            setError("Passwords do not match!");
        } else {
            try {
                await axios.post("http://localhost:5178/api/Auth/reset-password", {
                    email,
                    newPassword,
                });
                
                navigate("/");

                // if (response.data.success) {
                //     navigate("/");
                // } else {
                //     setError(response.data.message || "Password reset failed.");
                // }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Something went wrong. Please try again."
                );
            }
        }
    };

    return (
        <div className="ep-wrapper">
            <div className="ep-content">
                <div className="ep-userset">
                    <div className="ep-userheading">
                        <h3>Enter New Password</h3>
                        <h4>Set a strong password to protect your account</h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-ep">
                            <label>New Password</label>
                            <div className="input-container-ep">
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <img src="https://cdn-icons-png.flaticon.com/512/3064/3064155.png" alt="lock-icon" className="input-icon" />
                            </div>
                        </div>

                        <div className="form-ep">
                            <label>Confirm Password</label>
                            <div className="input-container-ep">
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <img src="https://cdn-icons-png.flaticon.com/512/3064/3064155.png" alt="lock-icon" className="input-icon" />
                            </div>
                        </div>

                        {error && <p className="error-message-ep">{error}</p>}

                        <button type="submit" className="btn-ep" disabled={loading}>
                            {loading ? "Setting..." : "Set New Password"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="ep-img"></div>
        </div>
    );
}

export default EnterPassword;
