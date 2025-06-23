import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../images/logoo.png";
import mailIcon from "../images/mail.svg";
import "../CSS/ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!email) {
            setError("Email is required!");
            setSuccess("");
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Invalid email format!");
            setSuccess("");
            return;
        }

        try {
            setError("");
            const response = await axios.post("http://localhost:5178/api/Auth/send-otp", { email });

            const { message } = response.data;

            // Always show success and navigate regardless of isActive
            setSuccess(message || "OTP sent successfully.");
            navigate("/otp", { state: { email } });

        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError("Something went wrong. Please try again.");
            }
            setSuccess("");
        }
    };


    return (
        <div className="fp-wrapper">
            <div className="fp-content">
                <div className="fp-userset">
                    <div className="fp-logo">
                        <img src={logo} alt="Infra Track Logo" />
                    </div>

                    <div className="fp-userheading">
                        <h3>Forgot Password</h3>
                        <h4>Enter your email to reset your password</h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-fp">
                            <label>Email</label>
                            <div className="input-container">
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <img src={mailIcon} alt="mail-icon" className="input-icon" />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            {success && <p className="success-message">{success}</p>}
                        </div>

                        <button type="submit" className="btn-fp">
                            Send OTP Verification Link
                        </button>

                        <div className="alreadyuser">
                            <h4>
                                <Link to="/">Back to Login</Link>
                            </h4>
                        </div>
                    </form>
                </div>
            </div>

            <div className="fp-img"></div>
        </div>
    );
}

export default ForgotPassword;
