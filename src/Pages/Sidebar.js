import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaHome, FaUsers, FaUserTie, FaFileAlt, FaSignOutAlt, FaTools
} from 'react-icons/fa';
import { MdAssignment } from "react-icons/md";
import progress_icon from "../images/progress_icon.png";
import project_icon from "../images/project_icon.png";
import '../CSS/Sidebar.css';
import logo from '../images/ilogo.png';
import { Link } from 'react-router-dom';

import profilePic from "../images/profilePic.png";


const Sidebar = () => {
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

    const handleLogout = () => {
        localStorage.removeItem('role'); // Remove role
        localStorage.removeItem('token');
        localStorage.removeItem('name'); // Remove token
        navigate('/');
        setIsProfileOpen(false);  // Close modal on logout
    };


    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setIsProfileOpen(false);  // Close profile modal when toggling sidebar
    };

    const toggleProfileModal = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleProfileClick = () => {
        navigate('/Profile');
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
                        <img
                            src={localStorage.getItem("image") || profilePic}
                            alt="Profile"
                            className="profile-img"
                        />
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
                    <Link to="/AdminDashboard" className="item-menu-link" >
                        <li className="item-menu">
                            <div className="menu-left">
                                <FaHome className="menu-icon" />
                                <span className="menu-text active">Dashboard</span>
                            </div>
                        </li>
                    </Link>

                    <Link to="/QuotationList" className="item-menu-link" >
                        <li className="item-menu">
                            <div className="menu-left">
                                <MdAssignment className="menu-icon" />
                                <span className="menu-text active">Quotation</span>
                            </div>
                        </li>
                    </Link>

                    <Link to="/ProjectList" className="item-menu-link">
                        <li className="item-menu">
                            <div className="menu-left">
                                <svg
                                    className="menu-icon"
                                    viewBox="0 0 64 64"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    fill="#6c757d"  // You can change this color
                                >
                                    <g data-name="Layer 10">
                                        <path d="M42,5H22a1,1,0,0,1,0-2H42a1,1,0,0,1,0,2Z" />
                                    </g>
                                    <g data-name="Layer 48">
                                        <path d="M6,53H58a3,3,0,0,0,0-6H6a3,3,0,0,0,0,6Z" />
                                        <path d="M58,55H6a3,3,0,0,0,0,6H58a3,3,0,0,0,0-6Z" />
                                        <path d="M15.5,45.5a1,1,0,0,0,.71-.29l10.5-10.5a1,1,0,0,0-1.42-1.42l-10.5,10.5a1,1,0,0,0,0,1.42A1,1,0,0,0,15.5,45.5Z" />
                                        <path d="M37.29,33.29a1,1,0,0,0,0,1.42l10.5,10.5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42l-10.5-10.5A1,1,0,0,0,37.29,33.29Z" />
                                        <path d="M32,34a7,7,0,0,0,1.53-13.83A1,1,0,0,0,33,20V18.91A6,6,0,0,0,38,13V9A6,6,0,0,0,26,9v4a6,6,0,0,0,5,5.91v1.18a6.18,6.18,0,0,0-1.35.32,1,1,0,0,0,.7,1.88A4.73,4.73,0,0,1,32,22a5,5,0,1,1-5,5,1,1,0,0,0-2,0A7,7,0,0,0,32,34ZM30,11a2,2,0,1,1,2,2A2,2,0,0,1,30,11Z" />
                                    </g>
                                </svg>
                                <span className="menu-text">Project</span>
                            </div>
                        </li>
                    </Link>


                    {/* <Link to="/ProgressList" className="item-menu-link">
                        <li className="item-menu">
                            <div className="menu-left">
                                <BsBarChartSteps className="menu-icon" />
                                <span className="menu-text">Progress</span>
                            </div>
                        </li>
                    </Link> */}

                    <Link to="/ProgressList" className="item-menu-link">
                        <li className="item-menu">
                            <div className="menu-left">
                                <img src={progress_icon} alt="Progress Icon" className="menu-icon" style={{ width: "20px", height: "20px" }} />
                                <span className="menu-text">Progress</span>
                            </div>
                        </li>
                    </Link>


                    <Link to="/ListUser" className="item-menu-link">
                        <li className="item-menu">
                            <div className="menu-left">
                                <FaUsers className="menu-icon" />
                                <span className="menu-text">Users</span>
                            </div>
                        </li>
                    </Link>

                    <Link to="/ClientList" className="item-menu-link">
                        <li className="item-menu">
                            <div className="menu-left">
                                <FaUserTie className="menu-icon" />
                                <span className="menu-text">Client</span>
                            </div>
                        </li>
                    </Link>

                    <Link to="/ItemMList" className="item-menu-link">
                        <li className="item-menu" >
                            <div className="menu-left">
                                <FaFileAlt className="menu-icon" />
                                <span className="menu-text">Work Master</span>
                            </div>
                        </li>
                    </Link>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
