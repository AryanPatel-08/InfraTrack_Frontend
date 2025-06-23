import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../images/logoo.png';
import '../CSS/Otp.css';

const OTPVerification = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || "";

    const handleChange = (index, e) => {
        const value = e.target.value.replace(/\D/g, "");
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (index < 5 && value) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleBackspace = (index, e) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];
            if (newOtp[index]) {
                newOtp[index] = "";
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                newOtp[index - 1] = "";
            }
            setOtp(newOtp);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        setError("");
        setResendMessage("");

        if (otpValue.length !== 6) {
            setError("OTP must be exactly 6 digits.");
            return;
        }

        if (!email) {
            setError("No email found. Please try again.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:5178/api/Auth/verify-otp", {
                email,
                otp: otpValue,
            });

            console.log("Response from verify-otp:", response.data);

            if (response.data.message === "OTP verified successfully.") {
                console.log("Verified OTP for email:", email);
                console.log("Navigating to enterpassword");
                navigate("/enterpassword", { state: { email } });
            } else {
                setError(response.data.message || "OTP verification failed.");
            }
            // navigate("/enterpassword", { state: { email } });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleResendOtp = async () => {
        if (!email) {
            setError("No email found. Cannot resend OTP.");
            return;
        }

        setError("");
        setResendMessage("");
        setResendLoading(true);

        try {
            const response = await axios.post("http://localhost:5178/api/Auth/resend-otp", { email });

            console.log("Response from resend-otp:", response.data);

            if (response.data.success) {
                setResendMessage("New OTP has been sent to your email.");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                setError(response.data.message || "Failed to resend OTP.");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to resend OTP. Please try again."
            );
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="otp-wrapper">
            <div className="otp-content">
                <div className="otp-userset">
                    <div className="otp-logo">
                        <img src={logo} alt="Infra Track Logo" />
                    </div>
                    <div className="otp-userheading">
                        <h3>OTP Verification</h3>
                        <h4>Please enter the OTP sent to your email</h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={digit}
                                    maxLength={1}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleChange(index, e)}
                                    onKeyDown={(e) => handleBackspace(index, e)}
                                    className="otp-box"
                                />
                            ))}
                        </div>

                        {error && <p className="error-message">{error}</p>}
                        {resendMessage && <p className="success-message">{resendMessage}</p>}

                        <button type="submit" className="btn-otp" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>

                    <div className="alreadyuser">
                        <h4>
                            <a
                                href="/resend-otp"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!resendLoading) {
                                        handleResendOtp();
                                    }
                                }}
                                style={{ cursor: resendLoading ? "wait" : "pointer", pointerEvents: resendLoading ? "none" : "auto" }}
                            >
                                {resendLoading ? "Resending..." : "Resend OTP?"}
                            </a>
                        </h4>
                    </div>
                </div>
            </div>
            <div className="otp-img"></div>
        </div>
    );
};

export default OTPVerification;
