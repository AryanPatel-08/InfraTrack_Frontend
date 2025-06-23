import React, { useEffect, useState } from "react";
import Sidebar from "../Pages/Sidebar";
import "../CSS/ListUser.css";
import { FaEye, FaEdit, FaTrash, FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [editUser, setEditUser] = useState(null);
    const [sortField, setSortField] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const handleSort = (field) => {
        const order = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sorted = [...users].sort((a, b) => {
            const aValue = a[field];
            const bValue = b[field];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return order === 'asc'
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });

        setUsers(sorted);
    };


    const getSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
        }
        return <FaSortAlphaDown style={{ opacity: 0.3, position: "relative", zIndex: 1 }} />;
    };


    // useEffect(() => {
    //     if (userId) {
    //         axios.get(`http://localhost:5178/api/Users/${userId}`)
    //             .then(response => setFormData(response.data))
    //             .catch(error => console.error("Failed to fetch user", error));
    //     }
    // }, [userId]);



    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5178/api/Users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get("http://localhost:5178/api/Roles");
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    // Delete

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5178/api/Users/${id}`);
                setUsers(users.filter((user) => user.userId !== id));
                setEditUser(null); // Close modal after deletion
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };


    const filteredUsers = users.filter((user) => {
        const roleName = roles.find(role => role.roleId === user.roleId)?.roleName || "";
        const searchMatch =
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile.toLowerCase().includes(searchTerm.toLowerCase()) ||
            roleName.toLowerCase().includes(searchTerm.toLowerCase());

        const roleMatch = selectedRole ? user.roleId === Number(selectedRole) : true;
        const statusMatch = selectedStatus ? String(user.status) === selectedStatus : true;

        return searchMatch && roleMatch && statusMatch;
    });


    // const sortedUsers = [...filteredUsers].sort((a, b) =>
    //     sortOrder === "asc" ? a.fullName.localeCompare(b.fullName) : b.fullName.localeCompare(a.fullName)
    // );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortField === "fullName") {
            return sortOrder === "asc"
                ? a.fullName.localeCompare(b.fullName)
                : b.fullName.localeCompare(a.fullName);
        } else if (sortField === "userId") {
            return sortOrder === "asc" ? a.userId - b.userId : b.userId - a.userId;
        }

        return 0; // no sorting if no sortField
    });



    // Pagination

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(users.length / rowsPerPage);
    const indexOfLastUser = currentPage * rowsPerPage;
    const indexOfFirstUser = indexOfLastUser - rowsPerPage;
    // const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);


    const handlePageChange = (event) => {
        let newPage = parseInt(event.target.value, 10);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Update this function to correctly toggle status per user
    const handleToggleStatus = async (userId) => {
        try {
            const res = await axios.patch(
                `http://localhost:5178/api/Users/ToggleStatus/${userId}`
            );

            // Update the local state for the user to reflect new status
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.userId === userId
                        ? { ...user, status: res.data.status }
                        : user
                )
            );
        } catch (error) {
            console.error("Error toggling user status:", error);
            alert("Failed to update user status.");
        }
    };

    return (
        <div className="dashboard">
            <Sidebar />
            <div className="user-content">
                <div className="user-list-container">
                    <h2>User List</h2>
                    <p>Manage your Users</p>

                    <div className="header-controls">
                        <div className="left-controls">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <select
                                className="filter-dropdown"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.roleId} value={role.roleId}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="filter-dropdown"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                        <button className="add-user-btn" onClick={() => navigate("/AddUser", { state: null })}>+ Add User</button>
                    </div>


                    <div className="user-table-wrapper">
                        <div className="user-table-responsive" style={{ marginTop: 0, paddingTop: 0 }}>
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th className="sortable" onClick={() => handleSort('userName')} style={{ cursor: 'pointer' }}>
                                            User Name {getSortIcon('userName')}
                                        </th>
                                        <th className="sortable" onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                                            Email {getSortIcon('email')}
                                        </th>
                                        <th className="sortable" onClick={() => handleSort('mobile')} style={{ cursor: 'pointer' }}>
                                            Mobile {getSortIcon('mobile')}
                                        </th>
                                        <th className="sortable" onClick={() => handleSort('role')} style={{ cursor: 'pointer' }}>
                                            Role {getSortIcon('role')}
                                        </th>
                                        <th className="sortable" onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                                            Status {getSortIcon('status')}
                                        </th>
                                        <th>Action</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.length > 0 ? (
                                        currentUsers.map((user) => (
                                            <tr key={user.userId}>
                                                <td>
                                                    {/* <img src={user.image || "https://via.placeholder.com/40"} alt="User" className="user-image" /> */}

                                                    <img
                                                        src={user.image}
                                                        alt="User"
                                                        className="user-image"
                                                    />

                                                </td>
                                                <td>{user.fullName}</td>
                                                <td>{user.email}</td>
                                                <td>{user.mobile}</td>
                                                {/* <td>{roles.find(role => role.roleId === user.roleId)?.roleName || "Unknown"}</td> */}
                                                <td>
                                                    <span className={`role-status-badge ${roles.find(role => role.roleId === user.roleId)?.roleName.toLowerCase() || "unknown"}`}>
                                                        {roles.find(role => role.roleId === user.roleId)?.roleName || "Unknown"}
                                                    </span>
                                                </td>
                                                <td className="status-cell">
                                                    <label className="toggle-switch">
                                                        <input
                                                            type="checkbox"
                                                            checked={user.status}
                                                            onChange={() => handleToggleStatus(user.userId)}
                                                        />
                                                        <span className="slider"></span>
                                                    </label>
                                                    <span className="status-label">{user.status ? 'Active' : 'Inactive'}</span>
                                                </td>




                                                <td className="user-action-icons">
                                                    {/* Edit */}
                                                    {user.status ? (
                                                        <svg
                                                            viewBox="0 0 214 277"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            onClick={() => navigate("/AddUser", { state: { user } })}
                                                            style={{
                                                                width: "24px",
                                                                height: "24px",
                                                                cursor: "pointer",
                                                                margin: "5px",
                                                                opacity: 1
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
                                                    ) : (
                                                        <svg
                                                            viewBox="0 0 214 277"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            style={{
                                                                width: "20px",
                                                                height: "20px",
                                                                cursor: "not-allowed",
                                                                margin: "5px",
                                                                opacity: 0.5
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
                                                    )}
                                                    {/* Delete */}
                                                    <svg
                                                        alt="Delete"
                                                        onClick={() => handleDelete(user.userId)}
                                                        viewBox="0 0 500 500"
                                                        xmlSpace="preserve"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="24"
                                                        height="24"
                                                        cursor="pointer"
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
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="no-data">No matching users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>


                    {/* Pagination */}
                    {/* Pagination Controls */}

                    <div className="pagination-container">
                        {/* Left Section: Rows per page & Showing results */}
                        <div className="pagination-left">
                            <span className="pagination-label">Tasks per page</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value, 10));
                                    setCurrentPage(1);
                                }}
                                className="rows-per-page"
                            >
                                {[10, 20, 50, 100].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <span className="pagination-info">
                                Showing: {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} results
                            </span>
                        </div>

                        {/* Right Section: Page Navigation */}
                        <div className="pagination-right">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="pagination-btn">
                                <FaAngleDoubleLeft />
                            </button>

                            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                                <FaAngleLeft />
                            </button>

                            <span className="pagination-text">Page</span>

                            <input
                                type="number"
                                value={currentPage}
                                onChange={handlePageChange}
                                min="1"
                                max={totalPages}
                                className="page-input"
                            />

                            <span className="pagination-text">/ {totalPages}</span>

                            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
                                <FaAngleRight />
                            </button>

                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="pagination-btn">
                                <FaAngleDoubleRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserList;
