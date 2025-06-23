import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "font-awesome/css/font-awesome.min.css";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Import CSS
import "../CSS/Loginp.css";

// Import images
import logo from "../images/logoo.png";
import mailIcon from "../images/mail.svg";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({}); // Reset error message

        // Client-side validation
        if (!validateForm()) return;

        try {
            const response = await fetch("http://localhost:5178/api/Auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("API Response", data);

            // Handle invalid credentials
            if (!response.ok) {
                const msg = data.message?.toLowerCase();

                if (msg?.includes("inactive")) {
                    // Show toast error instead of inline text
                    toast.error("Your account is inactive. Please contact the administrator.", {
                        duration: 2000,
                        position: "top-right",
                    });
                    return;  // stop further execution
                } else if (msg?.includes("invalid")) {
                    setErrors({ general: "Invalid email or password." });
                } else {
                    setErrors({ general: "Login failed. Please try again later." });
                }
                return;
            }


            if (!data.token || !data.roles) {
                throw new Error("Token or role missing in response");
            }

            console.log("Full API Response:", data);
            if (data.token && data.roles) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.roles);
                localStorage.setItem("name", data.username);
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("image", data.image);

                await axios.post("http://localhost:5178/api/Logs/login", {
                    userId: data.userId
                });

                // Show success toast with 1 second duration
                toast.success("Login successful!", {
                    duration: 2000,
                    position: "top-right",
                });
                setTimeout(() => {
                    switch (data.roles) {
                        case "Admin":
                            navigate("/AdminDashboard");
                            break;
                        case "Project Manager":
                            navigate("/managerdashboard");
                            break;
                        default:
                            navigate("/unauthorized");
                    }
                }, 1000);
            } else {
                setErrors({ general: "Login failed. Please try again." });
            }

        } catch (err) {
            setErrors({ general: "An unexpected error occurred. Please try again later." });
        }

    };

    // Validate form
    const validateForm = () => {
        let errors = {};
        let isValid = true;

        // Email validation
        if (!email) {
            errors.email = "Email is required!";
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Invalid email format!";
            isValid = false;
        }

        // Password validation
        if (!password) {
            errors.password = "Password is required!";
            isValid = false;
        } else if (password.length < 6) {
            errors.password = "Password must be at least 6 characters!";
            isValid = false;
        }

        setErrors(errors);
        return isValid;
    };

    return (
        <div className="login-main-wrapper">
            {/* Left Section (Login Form) */}
            <div className="login-content">
                <div className="login-userset">
                    <div className="login-logo">
                        <img src={logo} alt="Infra Track Logo" />
                    </div>
                    <div className="login-userheading">
                        <h3>Sign In</h3>
                        <h4>Please login to your account</h4>
                    </div>

                    <form onSubmit={handleLogin}>
                        {/* Email Input */}
                        <div className="form-login">
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
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>

                        {/* Password Input */}
                        <div className="form-login">
                            <label>Password</label>
                            <div className="input-container">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    className="pass-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <span
                                    className="input-icon password-toggle"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                >
                                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>
                            {errors.password && <p className="error-message">{errors.password}</p>}
                        </div>

                        {/* Forgot Password */}
                        <div className="form-login">
                            <div className="alreadyuser">
                                <h4>
                                    <Link to="/forgotpassword">Forgot Password?</Link>
                                </h4>
                            </div>
                        </div>

                        {errors.general && (
                            <p className="error-message" style={{ color: "red", marginBottom: "10px" }}>
                                {errors.general}
                            </p>
                        )}



                        {/* Sign In Button */}
                        <div className="form-login">
                            <button type="submit" className="btn-login">Sign In</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Section (Background Image) */}
            <div className="login-img"></div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={12}
                toastOptions={{
                    duration: 3000,
                    style: {
                        fontWeight: "600",
                        fontSize: "15px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        padding: "12px 24px",
                        minWidth: "280px",
                    },
                    success: {
                        duration: 2000,
                        style: {
                            background: "#4caf50",
                            color: "#fff",
                        },
                    },
                    error: {
                        duration: 3000,
                        style: {
                            background: "#d32f2f",
                            color: "#fff",
                        },
                    },
                }}
            />

        </div>
    );
};

export default LoginPage;
