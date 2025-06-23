import React, { useEffect, useState } from "react";
import "../CSS/ClientList.css";
import Sidebar from "../Pages/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";


const ClientList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIDProof, setSelectedIDProof] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const [sortOrder, setSortOrder] = useState("desc");
    const [clients, setClients] = useState([]);
    const [sortField, setSortField] = useState("clientId");
    const [editClient, setEditClient] = useState(null);


    const fetchClients = async () => {
        try {
            const response = await axios.get("http://localhost:5178/api/Clients");
            setClients(response.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };
    useEffect(() => {
        fetchClients();
    }, []);

    // Delete
    const handleDeleteClient = async (id) => {
        if (window.confirm("Are you sure you want to delete this client?")) {
            try {
                await axios.delete(`http://localhost:5178/api/Clients/${id}`);
                setClients(clients.filter((client) => client.clientId !== id));
                setEditClient(null); // Close modal after deletion
            } catch (error) {
                console.error("Error deleting client:", error);
            }
        }
    };

    const openModal = (idProof) => {
        if (!idProof) {
            alert("No ID proof available");
            return;
        }
        setSelectedIDProof(idProof);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIDProof("");
    };


    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(clients.length / rowsPerPage);
    const indexOfLastClient = currentPage * rowsPerPage;
    const indexOfFirstClient = indexOfLastClient - rowsPerPage;
    console.log("clients:", clients);
    const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

    const handlePageChange = (event) => {
        let newPage = parseInt(event.target.value, 10);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Your existing handleSort function
    const handleSort = (field) => {
        const order = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sorted = [...clients].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
            }

            return sortOrder === "asc"
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });
        setClients(sorted);
    };

    // Function to get the sort icon based on the active sorted field and order
    const getSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
        }
        return <FaSortAlphaDown style={{ opacity: 0.3, position: "relative", zIndex: 1 }} />;
    };



    return (
        <div className="client-wrapper">
            <Sidebar />
            <div className="client-content">
                <div className="client-header">
                    <h2>Client List</h2>
                    <p>Manage your clients</p>
                </div>

                <div className="header-controls">
                    <input
                        type="text"
                        placeholder="Search by Client Name, Email and Mobile.."
                        className="search-box"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="add-user-btn" onClick={() => navigate("/ClientForm", { state: null })}>
                        + Add Client
                    </button>
                </div>

                <div className="client-table-wrapper">
                    <table className="client-table">
                        <thead>
                            <tr>
                                <th>Client Photo</th>
                                <th className="sortable" style={{ cursor: "pointer" }} onClick={() => handleSort("clientName")}>
                                    Client Full Name {getSortIcon("clientName")}
                                </th>
                                <th className="sortable" style={{ cursor: "pointer" }} onClick={() => handleSort("email")}>
                                    Email {getSortIcon("email")}
                                </th>
                                <th className="sortable" style={{ cursor: "pointer" }} onClick={() => handleSort("mobile")}>
                                    Mobile {getSortIcon("mobile")}
                                </th>
                                <th>ID Proof</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentClients
                                .filter(client =>
                                    client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    client.mobile.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((client, index) => (
                                    <tr key={index}>
                                        {/* <td>{client.clientId}</td> */}
                                        <td>
                                            <img
                                                src={client.uploadClientPhoto || "/default-placeholder.png"}
                                                alt="Client"
                                                className="client-img"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    // e.target.src = "/default-placeholder.png";
                                                }}
                                            />
                                        </td>
                                        <td>{client.clientName}</td>
                                        <td>{client.email}</td>
                                        <td>{client.mobile}</td>
                                        <td>
                                            <button
                                                className="view-id-btn"
                                                onClick={() => openModal(client.uploadIdentityProff)}
                                                disabled={!client.uploadIdentityProff}
                                            >
                                                View ID
                                            </button>
                                        </td>
                                        <td className="client-action-icons">
                                            {/* Edit */}
                                            <svg
                                                viewBox="0 0 214 277"
                                                xmlns="http://www.w3.org/2000/svg"
                                                onClick={() => navigate("/ClientForm", { state: { client } })}
                                                style={{
                                                    width: "24px",
                                                    height: "24px",
                                                    cursor: "pointer",
                                                    marginRight: "8px",
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
                                                onClick={() => handleDeleteClient(client.clientId)}
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
                                ))}
                        </tbody>
                    </table>
                </div>

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
                            Showing: {indexOfFirstClient + 1}-{Math.min(indexOfLastClient, clients.length)} of {clients.length} results
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



                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-btn" onClick={closeModal}>✖</button>
                            <h3>ID Proof</h3>
                            <img src={selectedIDProof} alt="ID Proof" className="id-proof-img" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientList;
