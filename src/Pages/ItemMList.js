import React, { useState, useEffect } from "react";
import "../CSS/ItemMList.css";
import Sidebar from "../Pages/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [sortField, setSortField] = useState("itemId");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get("http://localhost:5178/api/Items");
            const sorted = res.data.sort((a, b) => b.itemId - a.itemId);
            setItems(sorted);
        } catch (err) {
            console.error("Error fetching items:", err);
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`http://localhost:5178/api/Items/${id}`);
                setItems(prevItems => prevItems.filter(item => item.itemId !== id));
            } catch (error) {
                console.error("Error deleting item:", error.response || error.message);
            }
        }
    };

    const handleAddClick = () => {
        navigate("/ItemMForm");
    };

    const handleSort = (field) => {
        const order = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(order);

        const sorted = [...items].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];

            if (field === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return order === 'asc'
                ? String(aValue).localeCompare(String(bValue))
                : String(bValue).localeCompare(String(aValue));
        });

        setItems(sorted);
    };

    const getSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === 'asc' ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
        }
        return <FaSortAlphaDown style={{ opacity: 0.3, position: "relative", zIndex: 1, cursor: "pointer"}} />;
    };

    const filteredItems = items.filter((item) =>
        (item.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.itemCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.createdAt || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * rowsPerPage;
    const indexOfFirstItem = indexOfLastItem - rowsPerPage;
    const paginatedItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

    return (
        <div className="itemlist-wrapper">
            <Sidebar />

            <div className="itemlist-content">
                <div className="client-header">
                    <h2>Item List</h2>
                    <p>Manage your Items</p>
                </div>

                <div className="header-controls">
                    <input
                        type="text"
                        placeholder="Search by Item Name and code..."
                        className="search-box"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="add-user-btn" onClick={handleAddClick}>+ Add Item</button>
                </div>

                {/* Table Section */}
                <div className="table-wrapper">
                    <div className="itemlist-table-responsive">
                        <table className="itemlist-table">
                            <thead>
                                <tr>
                                    <th className="sortable" onClick={() => handleSort("itemName")}>
                                        Item Name {getSortIcon("itemName")}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort("itemCode")}>
                                        Code {getSortIcon("itemCode")}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort("createdAt")}>
                                        Created At {getSortIcon("createdAt")}
                                    </th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: "center" }}>No items found</td>
                                    </tr>
                                ) : (
                                    paginatedItems.map((item, index) => (
                                        <tr key={item.ItemId || index}>
                                            <td>{item.itemName}</td>
                                            <td>{item.itemCode}</td>
                                            <td>
                                                {item.createdAt ? (() => {
                                                    const date = new Date(item.createdAt);
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    return `${day}-${month}-${year}`;
                                                })() : "N/A"}
                                            </td>



                                            <td className="action-icons">
                                                <svg
                                                    viewBox="0 0 214 277"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    onClick={() => navigate("/ItemMForm", { state: { item } })}
                                                    style={{
                                                        cursor: "pointer",
                                                        marginRight: "5px",
                                                        width: "24px",
                                                        height: "24px",
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
                                                    onClick={() => handleDeleteItem(item.itemId)}
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
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>

                {/* Pagination Code */}

                <div className="item-pagination-container">
                    {/* Left Section: Rows per page & Showing results */}
                    <div className="item-pagination-left">
                        <span className="item-pagination-label">Items per page</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setCurrentPage(1);
                            }}
                            className="item-rows-per-page"
                        >
                            {[5, 10, 20, 50].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <span className="item-pagination-info">
                            Showing: {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} results
                        </span>
                    </div>

                    {/* Right Section: Page Navigation */}
                    <div className="item-pagination-right">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="item-pagination-btn"
                        >
                            <FaAngleDoubleLeft />
                        </button>

                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="item-pagination-btn"
                        >
                            <FaAngleLeft />
                        </button>

                        <span className="item-pagination-text">Page</span>

                        <input
                            type="number"
                            value={currentPage}
                            onChange={(e) => {
                                const newPage = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1));
                                setCurrentPage(newPage);
                            }}
                            min="1"
                            max={totalPages}
                            className="item-page-input"
                        />

                        <span className="item-pagination-text">/ {totalPages}</span>

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="item-pagination-btn"
                        >
                            <FaAngleRight />
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="item-pagination-btn"
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemList;
