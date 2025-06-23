import React, { useState, useEffect } from "react";
import "../CSS/ProjectList.css";
import Sidebar from "../Pages/Sidebar";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectList = () => {
    // const [selectedProject, setSelectedProject] = useState(null);
    const navigate = useNavigate(); // Initialize navigation
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // UI State
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState("");

    // Edit Modal
    const [editProject, setEditProject] = useState(null);

    const handleSort = (field) => {
        if (field === 'duration') return; // Skip sorting for 'duration' field

        const order = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sorted = [...projects].sort((a, b) => {
            const aValue = a[field];
            const bValue = b[field];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            } else {
                return order === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            }
        });

        setProjects(sorted);
    };

    const getSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
        }
        return <FaSortAlphaDown style={{ opacity: 0.3 }} />; // dim default icon for inactive columns
    };


    // Fetch Status / Fetch quotations / Fetch Projects from API
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get("http://localhost:5178/api/Projects");
                console.log(response.data)
                setProjects(response.data || []);
            } catch {
                setError("Failed to fetch projects.");
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Automatically Duration 
    useEffect(() => {
        if (editProject?.startDate && editProject?.expectedEndDate) {
            const start = new Date(editProject.startDate);
            const end = new Date(editProject.expectedEndDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setEditProject(prev => ({
                ...prev,
                duration: diffDays,
            }));
        }
    }, [editProject?.startDate, editProject?.expectedEndDate]);


    // Delete
    const handleDeleteProject = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await axios.delete(`http://localhost:5178/api/Projects/${id}`);
                const updatedList = projects.filter((project) => project.projectId !== id);
                setEditProject(null);
                applyDateFilter(fromDate, toDate, updatedList);
            } catch (error) {
                console.error("Error deleting project:", error);
            }
        }
    };
    const [filteredProjects, setFilteredProjects] = useState([]);

    useEffect(() => {
        applyDateFilter(fromDate, toDate);
    }, [projects, fromDate, toDate]);


    const applyDateFilter = (start, end, data = projects) => {
        if (!start && !end) {
            setFilteredProjects(data);
            return;
        }
        const fromDateObj = new Date(start);
        const toDateObj = new Date(end);

        const filtered = projects.filter(project => {
            const projectDate = new Date(project.startDate);
            return projectDate >= fromDateObj && projectDate <= toDateObj;
        });

        setFilteredProjects(filtered);
        setCurrentPage(1);
    };


    // Pagination
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const indexOfLastProject = currentPage * rowsPerPage;
    const indexOfFirstProject = indexOfLastProject - rowsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));


    const handlePageChange = (event) => {
        let newPage = parseInt(event.target.value, 10);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="project-wrapper">
            <Sidebar />

            <div className="project-content">
                <div className="project-header">
                    <h2>Project List</h2>
                    <p>Manage your Project</p>
                </div>

                <div className="filter-section">
                    <div className="filter-controls">
                        <div className="date-filters">
                            <input
                                type="date"
                                className="date-picker"
                                placeholder="From Date"
                                value={fromDate}
                                onChange={(e) => {
                                    const newFromDate = e.target.value;
                                    setFromDate(newFromDate);
                                    applyDateFilter(newFromDate, toDate);
                                }}
                            />
                            <span className="arrow">➝</span>
                            <input
                                type="date"
                                className="date-picker"
                                placeholder="To Date"
                                value={toDate}
                                onChange={(e) => {
                                    const newToDate = e.target.value;
                                    setToDate(newToDate);
                                    applyDateFilter(fromDate, newToDate);
                                }}
                            />
                        </div>

                        {/* 🔽 Search Bar */}
                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search Project Name, loc.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}  // Updates search query
                                className="search-input"
                            />
                        </div>
                    </div>

                    <button className="add-project-btn" onClick={() => navigate("/ProjectForm")}>
                        + Add Project
                    </button>
                </div>


                <div className="projectlist-table-wrapper">
                    <div className="table-responsive">
                        <table className="project-table">
                            <thead>
                                <tr>
                                    <th className="project-sortable" onClick={() => handleSort('projectName')} style={{ cursor: 'pointer' }}>
                                        Project Name {getSortIcon('projectName')}
                                    </th>
                                    <th className="project-sortable" onClick={() => handleSort('projectmanager')} style={{ cursor: 'pointer' }}>
                                        Project Manager {getSortIcon('projectManager')}
                                    </th>
                                    <th className="project-sortable" onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                                        Location {getSortIcon('location')}
                                    </th>
                                    <th className="project-sortable" onClick={() => handleSort('quotationName')} style={{ cursor: 'pointer' }}>
                                        Quotation Name {getSortIcon('quotationName')}
                                    </th>
                                    <th className="project-sortable" onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                        Status {getSortIcon('status')}
                                    </th>
                                    <th>Duration (Days)</th>

                                    <th>Action</th>
                                </tr>

                            </thead>
                            <tbody>
                                {currentProjects
                                    .filter((project) =>
                                        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        project.location.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((project) => (
                                        // <tr key={project.id} onClick={() => setSelectedProject(project)}>
                                        <tr key={project.projectId}>
                                            <td>{project.projectName}</td>
                                            <td>{project?.user.fullName}</td>
                                            <td>{project.location}</td>
                                            <td>{project?.quotation.quotationName}</td>

                                            <td>
                                                {(project.status >= 1 && project.status <= 4) && (
                                                    <span
                                                        className={`project-status-badge ${project.status === 1
                                                            ? "new"
                                                            : project.status === 2
                                                                ? "hold"
                                                                : project.status === 3
                                                                    ? "ongoing"
                                                                    : "completed"
                                                            }`}
                                                    >
                                                        {project.status === 1
                                                            ? "New"
                                                            : project.status === 2
                                                                ? "Hold"
                                                                : project.status === 3
                                                                    ? "Ongoing"
                                                                    : "Completed"}
                                                    </span>
                                                )}
                                            </td>


                                            <td>{Math.ceil((new Date(project.expectedEndDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))}</td>

                                            <td className="project-action-icons">
                                                {/* Edit */}
                                                <svg
                                                    viewBox="0 0 214 277"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    onClick={() => {
                                                        if (project.status !== 4) {
                                                            navigate("/ProjectForm", { state: { project } });
                                                        }
                                                    }}
                                                    style={{
                                                        width: "24px",
                                                        height: "24px",
                                                        cursor: project.status === 4 ? "not-allowed" : "pointer",
                                                        opacity: project.status === 4 ? 0.5 : 1,
                                                        margin: "8px",
                                                    }}
                                                >
                                                    <g fillRule="nonzero" fill="none">
                                                        <path
                                                            d="m160.344 21.122-95.155 95.155a5.99 5.99 0 0 0-1.565 2.734l-8.167 31.454a6.003 6.003 0 0 0 7.315 7.316l31.454-8.168a6.003 6.003 0 0 0 2.734-1.565l95.153-95.153.005-.004.004-.005 19.156-19.156a5.998 5.998 0 0 0 .001-8.484L187.994 1.958a5.998 5.998 0 0 0-8.485 0l-19.155 19.155-.005.004-.005.005ZM89.631 138.408 69.638 143.6l5.191-19.993 89.762-89.762 14.801 14.802-89.761 89.761Zm94.12-123.723 14.801 14.802-10.675 10.675-14.801-14.802 10.675-10.675Z"
                                                            fill="#ff7300"
                                                            stroke="#ff7300"
                                                            strokeWidth="5"
                                                        />
                                                        <path
                                                            d="M207.037 65.222a6 6 0 0 0-6 6v192.813H12.799V34.617h111.063a6 6 0 0 0 0-12H6.799a6 6 0 0 0-6 6v241.419a6 6 0 0 0 6 6h200.238a6 6 0 0 0 6-6V71.222a6 6 0 0 0-6-6Z"
                                                            fill="#ff7300"
                                                            stroke="#ff7300"
                                                            strokeWidth="5"
                                                        />
                                                    </g>
                                                </svg>
                                                {/* Delete */}
                                                <svg
                                                    alt="Delete"
                                                    onClick={() => handleDeleteProject(project.projectId)}
                                                    viewBox="0 0 500 500"
                                                    xmlSpace="preserve"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    cursor="Pointer"
                                                >
                                                    <g
                                                        fill="none"
                                                        stroke="#ff0000"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeMiterlimit="2.613"
                                                        strokeWidth="20"
                                                    >
                                                        <path d="m101.642 134.309 18.991 296.663M120.633 430.972c0 10.5 8.519 19.031 18.992 19.031M139.625 450.003h220.764M360.389 450.003c10.474 0 18.979-8.531 18.979-19.031M379.367 430.972l19.019-296.663H101.642M432.779 115.973c0 10.059-8.143 18.215-18.188 18.215M414.592 134.188H85.409M85.409 134.188c-10.018 0-18.188-8.156-18.188-18.215"></path>
                                                        <path d="M67.221 115.973c0-10.019 8.17-18.188 18.188-18.188M85.409 97.784h329.183M414.592 97.784c10.045 0 18.188 8.17 18.188 18.188M307.364 97.49V68.988M307.364 68.988c0-10.474-8.505-18.991-18.965-18.991M288.399 49.997h-76.771M211.628 49.997c-10.487 0-18.979 8.518-18.979 18.991M192.649 68.988V97.49h114.715M166.332 172.278V406.06M222.102 172.278V406.06M277.926 172.278V406.06M333.669 172.278V406.06"></path>
                                                    </g>
                                                </svg>
                                                {/* <span onClick={() => handleDeleteProject(project.projectId)} style={{ cursor: "pointer", margin: "8px" }}>🗑️</span> */}
                                                {/* <span><FiTrendingUp style={{ color: "black", fontSize: "20px", cursor: "pointer", margin: "8px" }} /></span> */}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Code */}
                <div className="project-pagination-container">
                    {/* Left Section: Rows per page & Showing results */}
                    <div className="project-pagination-left">
                        <span className="project-pagination-label">Projects per page</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setCurrentPage(1);
                            }}
                            className="project-rows-per-page"
                        >
                            {[10, 20, 50, 100].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <span className="project-pagination-info">
                            Showing: {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, projects.length)} of {projects.length} results
                        </span>
                    </div>

                    {/* Right Section: Page Navigation */}
                    <div className="project-pagination-right">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="project-pagination-btn"
                        >
                            <FaAngleDoubleLeft />
                        </button>

                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="project-pagination-btn"
                        >
                            <FaAngleLeft />
                        </button>

                        <span className="project-pagination-text">Page</span>

                        <input
                            type="number"
                            value={currentPage}
                            onChange={handlePageChange}
                            min="1"
                            max={totalPages}
                            className="project-page-input"
                        />

                        <span className="project-pagination-text">/ {totalPages}</span>

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="project-pagination-btn"
                        >
                            <FaAngleRight />
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="project-pagination-btn"
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default ProjectList;
