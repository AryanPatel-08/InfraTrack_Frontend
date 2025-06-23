import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaHome, FaShoppingCart, FaCog, FaClipboardList,
    FaUsers, FaUserTie, FaFileAlt, FaSignOutAlt
} from 'react-icons/fa';
import '../../CSS/Sidebar.css';
import logo from '../../images/ilogo.png';
import { Link } from 'react-router-dom';
import axios from 'axios';
import profilePic from "../../images/profilePic.png";


const ManagerSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const modalRef = useRef();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) setIsSidebarOpen(false); // auto-close sidebar on mobile
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isProfileOpen]);


    const handleLogout = async () => {
        const userId = localStorage.getItem("userId");

        if (userId) {
            try {
                await axios.post("http://localhost:5178/api/Logs/logout", userId, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
            } catch (error) {
                console.error("Logout log error:", error);
                // Optional: toast error
            }
        }

        // Clear session
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("userId");
        localStorage.removeItem("image");

        setIsProfileOpen(false);
        navigate("/");
    };
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setIsProfileOpen(false);  // Close profile modal when toggling sidebar
    };

    const toggleProfileModal = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleProfileClick = () => {
        navigate('/managerprofile');
        setIsProfileOpen(false);  // Close modal on profile click
    };

    return (
        <div className="layout">
            {/* Navbar */}
            <nav className="navbar-n">
                <div className="search-container">
                    <div className="navbar-right">
                        <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                        <div className="profile-icon" onClick={toggleProfileModal}>
                            <img src={localStorage.getItem("image") || profilePic} alt="Profile" className="profile-img" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Profile Modal */}
            {isProfileOpen && (
                <div className="profile-modal">
                    <div className="profile-content" style={{ textAlign: 'center' }} ref={modalRef}>
                        <img src={localStorage.getItem("image") || profilePic} alt="Profile" className="profile-img" />                       
                        <h5>{localStorage.getItem("name")}</h5>
                        <p>{localStorage.getItem("role")}</p>
                        <hr />
                        <ul>
                            <li onClick={handleProfileClick}><FaUsers /> My Profile</li>
                            <li className="logout" onClick={handleLogout}><FaSignOutAlt /> Logout</li>
                        </ul>
                    </div>
                </div>
            )}


            {/* Sidebar */}
            <div className={`sidebar-s ${isSidebarOpen ? "open" : ""}`}>
                <div className="sidebar-logo">
                    <img src={logo} alt="Infra Track" />
                </div>

                <ul className="sidebar-s-menu">

                    <Link to="/managerdashboard" className="item-menu-link" >
                        <li className="item-menu">
                            <div className="menu-left">
                                <FaHome className="menu-icon" />
                                <span className="menu-text active">Dashboard</span>
                            </div>
                        </li>
                    </Link>

                    <Link to="/managerprogresslist" className="item-menu-link">
                        <li className="item-menu">
                            <div className="menu-left">
                                <FaClipboardList className="menu-icon" />
                                <span className="menu-text">Progress</span>
                            </div>
                        </li>
                    </Link>
                </ul>
            </div>
        </div>
    );
};

export default ManagerSidebar;
