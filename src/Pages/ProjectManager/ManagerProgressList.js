import React, { useState, useEffect } from "react";
import "../../CSS/ProgressList.css";
import axios from "axios";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import ManagerSidebar from "../../Pages/ProjectManager/ManagerSidebar";

const ProgressList = () => {
    const navigate = useNavigate();
    const [progressRecords, setProgressRecords] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [deletedItems, setDeletedItems] = useState(new Set());

    const [sortField, setSortField] = useState("itemName");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [checkboxState, setCheckboxState] = useState({});
    const [submittedItems, setSubmittedItems] = useState(() => {
        const savedItems = localStorage.getItem('submittedItems');
        return savedItems ? JSON.parse(savedItems) : {};
    });
    const userId = localStorage.getItem('userId');

    // Add effect to initialize checkbox states for items fetched from the backend
    const initializeCheckboxState = (data) => {
        const newState = {};
        data.forEach(progress => {
            if (progress.quotation?.quotationItems) {
                progress.quotation.quotationItems.forEach(item => {
                    // Initialize isChecked based on backend completion status
                    // Initialize isDisabled based on backend completion status (disabled if already completed)
                    newState[item.quoItemId] = {
                        isChecked: Boolean(item.isCompleted || item.tempQty > 0),
                        isDisabled: Boolean(item.isCompleted || item.tempQty > 0),
                    };
                });
            }
        });
        setCheckboxState(newState);
    };

    // Add effect to save submittedItems to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('submittedItems', JSON.stringify(submittedItems));
    }, [submittedItems]);

    const totalPages = Math.max(1, Math.ceil(progressRecords.length / rowsPerPage));
    const indexOfLastProgress = currentPage * rowsPerPage;
    const indexOfFirstProgress = indexOfLastProgress - rowsPerPage;
    const currentProgress = progressRecords.slice(indexOfFirstProgress, indexOfLastProgress);

    const fetchData = async () => {
        try {

            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem("token");
            if (!userId) {
                console.error("User ID or token is missing");
                return;
            }
            const res = await axios.get(`http://localhost:5178/api/Progresses/GetProgressByUser/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("Progress data:", res.data);
            let processedData = [];
            if (res.data) {
                processedData = Array.isArray(res.data)
                    ? res.data
                    : res.data.$values
                        ? res.data.$values
                        : [res.data];

                const updatedData = await Promise.all(
                    processedData.map(async (record) => {
                        if (record.quotation?.quotationItems) {
                            const quotationItems = await Promise.all(
                                record.quotation.quotationItems.map(async (item) => {
                                    try {
                                        const itemResponse = await axios.get(
                                            `http://localhost:5178/api/QuotationItems/${item.quoItemId}`
                                        );
                                        const itemData = itemResponse.data;
                                        return {
                                            ...item,
                                            itemPrice: itemData.itemPrice || 0,
                                            amount: (itemData.itemPrice || 0) * (item.quantity || 0),
                                        };
                                    } catch (error) {
                                        console.error("Error fetching item details:", error);
                                        return item;
                                    }
                                })
                            );
                            return {
                                ...record,
                                quotation: {
                                    ...record.quotation,
                                    quotationItems,
                                },
                            };
                        } else {
                            return record;
                        }
                    })
                );

                const finalProcessedData = updatedData.map((record) => {
                    const quotationItems = record.quotation?.quotationItems || [];
                    const totalItems = quotationItems.length;
                    const completedItems = quotationItems.filter(
                        (item) => item.isCompleted || item.tempQty > 0
                    ).length;

                    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                    return {
                        ...record,
                        totalQty: totalItems,
                        totalTempQty: completedItems,
                        overallProgress,
                        status: overallProgress === 100 ? 1 : record.status || 0,
                    };
                });

                setProgressRecords(finalProcessedData);
                initializeCheckboxState(finalProcessedData);

                return finalProcessedData;
            } else {
                setProgressRecords([]);
                initializeCheckboxState([]);
                return [];
            }
        } catch (err) {
            console.error("Error fetching progress:", err);
            setProgressRecords([]);
            initializeCheckboxState([]);
            return [];
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const isDeleteDisabledForProject = (progress) => {
        const isOnHold = progress.projectStatus === 2 // Now it's coming directly
        console.log("Project Status:", progress.projectStatus);
        const remainingItems = progress.quotation?.quotationItems.filter(item =>
            !deletedItems.has(item.quoItemId) && (item.tempQty > 0 || item.isCompleted)
        ).length || 0;

        return isOnHold || remainingItems <= 1 || progress.overallProgress === 100;
    };


    const handleSubmit = async (progressId) => {
        const userId = localStorage.getItem('userId');
        const progress = progressRecords.find((p) => p.progressId === progressId);
        if (!progress) return;

        try {
            const quotationItems = progress.quotation?.quotationItems || [];
            const updates = [];

            const itemsToComplete = quotationItems.filter(
                (item) =>
                    checkboxState[item.quoItemId]?.isChecked && !(item.isCompleted || item.tempQty > 0)
            );

            for (const item of itemsToComplete) {
                const baseAmount = parseFloat(item.itemPrice || 0) * parseFloat(item.quantity || 0);
                const gstAmount = (baseAmount * 18) / 100;
                const totalAmount = baseAmount + gstAmount;

                updates.push(
                    axios.put(`http://localhost:5178/api/QuotationItems/updateQuotation/${item.quoItemId}`, {
                        quoItemId: item.quoItemId,
                        tempQty: 1,
                        isCompleted: true,
                        amount: totalAmount,
                    }),
                    await axios.post(
                        "http://localhost:5178/api/Logs/task-done",
                        parseInt(userId),
                        { headers: { "Content-Type": "application/json" } }
                    )
                );
            }

            await Promise.all(updates);

            // Refetch after quotation items update
            let updatedProgressRecords = await fetchData();

            const latest = updatedProgressRecords.find((p) => p.progressId === progressId);
            if (!latest) return;

            const projectId = latest.projectId || latest.quotation?.projectId;
            const finalProgress = Math.round(latest.overallProgress || 0);

            if (projectId) {
                if (finalProgress === 100) {
                    const today = new Date().toISOString().split("T")[0];
                    const payload = {
                        status: 4,
                        endDate: today,
                    };

                    await axios.put(`http://localhost:5178/api/Projects/updateStatus/${projectId}`, payload);
                } else {
                    const payload = {
                        status: 3,
                        endDate: null,
                    };

                    await axios.put(`http://localhost:5178/api/Projects/updateStatus/${projectId}`, payload);
                }

                // Refetch after project status update to sync local state
                updatedProgressRecords = await fetchData();
                setProgressRecords(updatedProgressRecords);
            }

            // Clean up deleted items
            setDeletedItems((prev) => {
                const newSet = new Set(prev);
                quotationItems.forEach((item) => newSet.delete(item.quoItemId));
                return newSet;
            });
        } catch (err) {
            console.error("❌ Submit error:", err);
            await fetchData();
        }
    };

    const handleDelete = async (progressId, quotationId, itemId) => {
        try {
            // Add the item to deletedItems set for local tracking
            setDeletedItems(prev => new Set([...prev, itemId]));

            // Update checkbox state to unchecked and enabled locally
            setCheckboxState(prev => ({
                ...prev,
                [itemId]: {
                    ...prev[itemId],
                    isChecked: false,   // reset checked state locally
                    isDisabled: false,  // enable checkbox after delete locally
                }
            }));

            const previousProgress = progressRecords.find(p => p.progressId === progressId);

            // Update the progress record locally to reflect deletion immediately
            const updated = progressRecords.map(progress => {
                if (progress.progressId === progressId) {
                    const updatedItems = progress.quotation?.quotationItems.map(item => {
                        if (item.quoItemId === itemId) {
                            return { ...item, tempQty: 0, isCompleted: false, completion_Date: null }; // Mark as incomplete locally
                        }
                        return item;
                    }) || []; // Ensure updatedItems is an array even if quotationItems is null/undefined

                    // Recalculate progress locally based on the updated local items (considering deleted items)
                    const currentDeletedItems = new Set([...deletedItems, itemId]); // Include the item just marked for deletion
                    const totalItems = updatedItems.length;
                    const completedItems = updatedItems.filter(item =>
                        (item.isCompleted || item.tempQty > 0) && !currentDeletedItems.has(item.quoItemId) // Exclude deleted items from completed count
                    ).length;
                    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                    // Update project status locally if progress is no longer 100%
                    let newStatus = progress.status;
                    let newEndDate = progress.endDate;
                    if (overallProgress < 100 && progress.status === 1) {
                        newStatus = 0; // Change status to In Progress
                        newEndDate = null; // Clear end date
                    }

                    return {
                        ...progress,
                        quotation: { ...progress.quotation, quotationItems: updatedItems },
                        overallProgress,
                        status: newStatus,
                        endDate: newEndDate,
                    };
                }
                return progress;
            });
            setProgressRecords(updated);

            // Make API call to reset item progress in the backend
            await axios.put(`http://localhost:5178/api/QuotationItems/updateQuotation/${itemId}`, {
                quoItemId: itemId,
                tempQty: 0,
                isCompleted: false
            });
            if (userId) {
                await axios.post(
                    "http://localhost:5178/api/Logs/task-doneDecrement",
                    parseInt(userId),
                    { headers: { "Content-Type": "application/json" } }
                );
            }

            // If the project status changed locally (from 100% to less), update it in the backend
            const updatedProgressRecord = updated.find(p => p.progressId === progressId);
            // if (updatedProgressRecord && updatedProgressRecord.status === 0 && updatedProgressRecord.status === 1 && updatedProgressRecord.quotation?.projectId) {
            // If status changed from 1 (Completed) to 0 (In Progress), clear endDate in backend
            if (
                previousProgress &&
                updatedProgressRecord &&
                previousProgress.status === 1 &&
                updatedProgressRecord.status === 0 &&
                updatedProgressRecord.quotation?.projectId
            ) {
                try {
                    await axios.put(`http://localhost:5178/api/Projects/updateStatus/${updatedProgressRecord.quotation.projectId}`, {
                        status: 0,
                        endDate: null
                    });
                } catch (error) {
                    console.error("Error updating project status after deletion:", error);
                }
            }


        } catch (error) {
            console.error("Error deleting item:", error);
            // Re-fetch data to sync UI with backend in case of error
            fetchData();
        }
    };

    const handleCheckboxChange = (progressId, quotationId, itemId, isChecked) => {
        // Prevent changing checkbox state if it's disabled
        if (checkboxState[itemId]?.isDisabled) {
            return;
        }

        // Only update local checkbox state
        setCheckboxState(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                isChecked: isChecked,
                // isDisabled state is managed by handleSubmit and initializeCheckboxState
            },
        }));

        // Update deletedItems state based on checkbox check/uncheck for local tracking
        // An item is considered 'deleted' locally if its checkbox is unchecked.
        setDeletedItems(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.delete(itemId); // If checked, it's not 'deleted' locally
            } else {
                newSet.add(itemId); // If unchecked, it's 'deleted' locally
            }
            return newSet;
        });

        // No API calls or progress record updates here. These happen on submit.
    };


    const getSortIcon = (field) => {
        if (sortField === field) {
            return sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
        }
        return <FaSortAlphaDown style={{ opacity: 0.3 }} />;
    };

    const handlePageChange = (e) => {
        const page = parseInt(e.target.value);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSort = (field) => {
        if (field === "action") return;
        const order = field === sortField && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(order);
        const sorted = [...progressRecords].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];
            return field === "overallProgress"
                ? order === "asc" ? aVal - bVal : bVal - aVal
                : order === "asc"
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
        });
        setProgressRecords(sorted);
    };

    const handleRowClick = (progressId) => {
        setExpandedRow(expandedRow === progressId ? null : progressId);
    };


    const renderTableContent = () => {
        if (!currentProgress || currentProgress.length === 0) {
            return (
                <tr>
                    <td colSpan="6">No progress records found.</td>
                </tr>
            );
        }

        const rows = [];
        currentProgress
            .filter(progress => {
                const matchesSearch = searchQuery === '' ||
                    progress.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    progress.quotation?.note?.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesStatus =
                    statusFilter === "all" || progress.status.toString() === statusFilter;

                return matchesSearch && matchesStatus;
            })
            .forEach(progress => {
                // Main row with progress from the record
                rows.push(
                    <tr
                        key={`main-${progress.progressId}`}
                        onClick={() => {
                            if (progress.projectStatus === 2) {
                                alert("This project is currently on hold.");
                            }
                            handleRowClick(progress.progressId);
                        }}
                        className={`main-table-row ${expandedRow === progress.progressId ? 'expanded' : ''}`}
                    >
                        <td>{progress.projectName || "N/A"}</td>
                        <td>{progress.quotation?.note || "N/A"}</td>
                        <td>
                            <div className="progress-line-container">
                                <div
                                    className={`progress-line-fill ${progress.status === 1 ? 'completed' : ''}`}
                                    style={{ width: `${progress.overallProgress?.toFixed(0)}%` }}
                                >
                                    {progress.overallProgress?.toFixed(0)}%
                                </div>
                            </div>
                        </td>
                        <td>
                            <span className={`progress-status-badge 
                            ${progress.projectStatus === 2 ? "on-hold" :
                                    progress.status === 1 ? "completed" :
                                        progress.status === 0 ? "in-progress" :
                                            "unknown"
                                }`}>
                                {
                                    progress.projectStatus === 2 ? "Hold" :
                                        progress.status === 1 ? "Completed" :
                                            progress.status === 0 ? "In Progress" :
                                                "Unknown"}
                            </span>
                        </td>
                        <td>{progress.endDate ? new Date(progress.endDate).toLocaleDateString() : "-"}</td>
                    </tr>
                );

                // Add the expanded content if this row is expanded
                if (expandedRow === progress.progressId) {
                    rows.push(
                        <tr key={`expanded-${progress.progressId}`} className="expanded-row">
                            <td colSpan="6" className="expanded-content">
                                <div className="nested-table-container">
                                    <table className="nested-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '25%' }}>Work Name</th>
                                                <th style={{ width: '20%' }}>Remarks</th>
                                                <th style={{ width: '15%' }}>Price Per SQ.FT</th>
                                                <th style={{ width: '15%' }}>Total SQ.FT</th>
                                                <th style={{ width: '10%' }}>Total Amount</th>
                                                <th style={{ width: '5%' }}>Status</th>
                                                <th style={{ width: '15%' }}>Date</th>
                                                <th style={{ width: '10%' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {progress.quotation?.quotationItems?.map(item => {
                                                const itemName = item.itemName || 'N/A';
                                                const price = parseFloat(item.itemPrice) || 0;
                                                const quantity = parseFloat(item.quantity) || 0;
                                                const amount = price * quantity;

                                                return (
                                                    <tr key={item.quoItemId} className="nested-table-row">
                                                        <td className="item-name-cell">{itemName}</td>
                                                        <td>{item.remark || 'No Remarks'}</td>
                                                        <td className="text-right">{price}</td>
                                                        <td className="text-right">{quantity.toFixed(2)}</td>
                                                        <td className="text-right">{amount}</td>
                                                        <td className="status-checkbox-cell">
                                                            <input
                                                                type="checkbox"
                                                                className="status-checkbox"
                                                                checked={checkboxState[item.quoItemId]?.isChecked || false}
                                                                disabled={checkboxState[item.quoItemId]?.isDisabled || false}
                                                                onChange={(e) =>
                                                                    handleCheckboxChange(progress.progressId, progress.quotation.quotationId, item.quoItemId, e.target.checked)
                                                                }
                                                            />


                                                        </td>
                                                        <td>{item.completion_Date ? new Date(item.completion_Date).toLocaleDateString() : ''}</td>
                                                        <td>
                                                            <button
                                                                className="delete-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(
                                                                        progress.progressId,
                                                                        progress.quotation.quotationId,
                                                                        item.quoItemId
                                                                    );
                                                                }}
                                                                disabled={isDeleteDisabledForProject(progress)}
                                                                style={{ background: "none" }}
                                                            >
                                                                <svg
                                                                    viewBox="0 0 500 500"
                                                                    xmlSpace="preserve"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="24"
                                                                    height="24"
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
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr>
                                                <td colSpan="7" className="submit-button-cell">
                                                    {progress.project?.status === 2 ? (
                                                        <span className="on-hold-message">Your project is on hold</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSubmit(progress.progressId)}
                                                            disabled={
                                                                progress.projectStatus === 2 ||
                                                                progress.projectStatus === 4 ||
                                                                !progress.quotation?.quotationItems?.some(item => checkboxState[item.quoItemId]?.isChecked)}
                                                            className="submit-button"
                                                        >
                                                            Submit
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    );
                }
            });

        return rows;
    };



    // Add these styles to your CSS
    const styles = `
    .text-right {
        text-align: right;
        padding-right: 15px;
    }

    .nested-table th {
        background-color: #f1f3f5;
        padding: 12px 15px;
        text-align: left;
        font-weight: 600;
        color: #495057;
        border-bottom: 2px solid #e9ecef;
    }

    .nested-table td {
        padding: 12px 15px;
        border-bottom: 1px solid #e9ecef;
    }

    .nested-table tr:last-child td {
        border-bottom: none;
    }

    .delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .delete-btn:hover:not(:disabled) {
        background-color: #ffebee;
    }

    .delete-btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .status-checkbox:disabled:not(:checked) {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .status-checkbox:not(:disabled) {
        cursor: pointer;
    }

    .submit-button {
        background-color: #28a745;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .submit-button:hover:not(:disabled) {
        background-color: #218838;
    }

    .submit-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        opacity: 0.7;
    }
    `;

    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return (
        <div className="progress-wrapper">
            <ManagerSidebar />
            <div className="progress-content">
                <div className="progress-header">
                    <h2>Project Progress</h2>
                    <p>Click a row to view and update status Quotation Items</p>
                </div>

                <div className="filter-section">
                    <div className="filter-controls">
                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search by Project Name.."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ marginLeft: "10px", padding: "8px" }}
                            >
                                <option value="all">Select Status</option>
                                <option value="0">In Progress</option>
                                <option value="1">Completed</option>
                            </select>

                        </div>
                    </div>
                </div>

                <div className="progress-table-wrapper">
                    <div className="progress-table-responsive">
                        <table className="progress-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('projectName')}>Project Name {getSortIcon('projectName')}</th>
                                    <th onClick={() => handleSort('quotation.note')}>Note {getSortIcon('quotation.note')}</th>
                                    <th onClick={() => handleSort('overallProgress')}>Progress {getSortIcon('overallProgress')}</th>
                                    <th>Status</th>
                                    <th>End Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTableContent()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="progress-pagination-container">
                    <div className="progress-pagination-left">
                        <span className="progress-pagination-label">Progress per page</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setCurrentPage(1);
                            }}
                            className="progress-rows-per-page"
                        >
                            {[10, 20, 50, 100].map((num) => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <span className="progress-pagination-info">
                            Showing: {indexOfFirstProgress + 1}-{Math.min(indexOfLastProgress, progressRecords.length)} of {progressRecords.length} results
                        </span>
                    </div>

                    <div className="progress-pagination-right">
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
                        <span>Page</span>
                        <input
                            type="number"
                            value={currentPage}
                            onChange={handlePageChange}
                            min="1"
                            max={totalPages}
                            className="project-page-input"
                        />
                        <span>/ {totalPages}</span>
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
        </div>
    );
};

export default ProgressList;
