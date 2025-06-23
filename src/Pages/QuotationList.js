import React, { useState, useEffect } from "react";
import "../CSS/QuotationList.css";
import Sidebar from "./Sidebar";
import { FaSortAlphaDown, FaSortAlphaUp, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import exportIcon from '../images/pdf-icon.png';
import { generateQuotationPDFBlob } from "../utils/generateQuotationPDFBlob ";


const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientMap, setClientMap] = useState({});
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [client, setClient] = useState("");
  const [sortField, setSortField] = useState("quotationName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRows, setSelectedRows] = useState([]); // State to manage selected rows

  // Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  // Call this when you add a new quotation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotationsRes, clientsRes, statusesRes] = await Promise.all([
          axios.get("http://localhost:5178/api/Quotations"),
          axios.get("http://localhost:5178/api/Clients"),
          axios.get("http://localhost:5178/api/Quotations/getstatus"),
        ]);

        // Sort quotations by date descending (newest first)
        const sortedQuotations = (quotationsRes.data || []).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        const clientsList = clientsRes.data || [];
        const statusesList = statusesRes.data || [];

        // Create a map: clientId -> { name, email, mobile }
        const clientDetailsMap = {};
        clientsList.forEach(client => {
          clientDetailsMap[client.clientId] = {
            name: client.clientName,
            email: client.email,
            mobile: client.mobile,
          };
        });

        // Set states
        setQuotations(sortedQuotations);
        setFilteredQuotations(sortedQuotations);
        setClients(clientsList);
        setClientMap(clientDetailsMap);
        setStatus(statusesList);
        setClient(clientsList);

      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();

    // Check if fetchClient() fetches clients again; if yes, you can remove this call to avoid duplication
    fetchClient();

  }, []);


  const addNewQuotation = (newQuotation) => {
    const updatedList = [newQuotation, ...quotations];
    setQuotations(updatedList);
    setFilteredQuotations(updatedList);

    // Optionally reset sorting
    setSortField(null);
    setSortOrder(null);
  };

  const handleSort = (field) => {
    const isSameField = sortField === field;
    const newOrder = isSameField && sortOrder === "asc" ? "desc" : "asc";

    setSortField(field);
    setSortOrder(newOrder);

    const sorted = [...filteredQuotations].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // If sorting by clientId, use clientMap to get the client name for sorting
      if (field === "clientId") {
        aValue = clientMap[aValue]?.name || "";
        bValue = clientMap[bValue]?.name || "";
      }

      // Handle null or undefined
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // If both values are numeric, compare as numbers
      const isNumeric = !isNaN(aValue) && !isNaN(bValue);

      if (isNumeric) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        // For strings: trim, convert to lower case (case-insensitive)
        aValue = aValue.toString().trim().toLowerCase();
        bValue = bValue.toString().trim().toLowerCase();
      }

      if (aValue < bValue) return newOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return newOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredQuotations(sorted);
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />;
    }
    return <FaSortAlphaDown style={{ opacity: 0.3 }} />;
  };

  const fetchClient = async () => {
    try {
      const res = await axios.get("http://localhost:5178/api/Clients");
      const data = (res.data?.$values || res.data || []);
      setClient(Array.isArray(data) ? data : [])
    } catch (error) {
      console.log(error)
      setClient([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await axios.delete(`http://localhost:5178/api/Quotations/${id}`);
        const updatedList = quotations.filter(q => q.quotationId !== id);
        setQuotations(updatedList);
        applyDateFilter(fromDate, toDate, updatedList);
      } catch (err) {
        console.error("Error deleting quotation:", err);
      }
    }
  };

  const handlePageChange = (e) => {
    const page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const applyDateFilter = (start, end, data = quotations) => {
    if (!start && !end) {
      setFilteredQuotations(data);
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const filtered = data.filter(q => {
      const qDate = new Date(q.date);
      return (!start || qDate >= startDate) && (!end || qDate <= endDate);
    });

    setFilteredQuotations(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredQuotations.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentQuotations = filteredQuotations.slice(indexOfFirst, indexOfLast);

  const handleCheckboxChange = (id) => {
    setSelectedRows(prevState => {
      if (prevState.includes(id)) {
        return prevState.filter(rowId => rowId !== id);
      } else {
        return [...prevState, id];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredQuotations.map(q => q.quotationId);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleExportPDF = async (quotationId) => {
    try {
      console.log('Fetching quotation with ID:', quotationId);
      const response = await axios.get(`http://localhost:5178/api/Quotations/${quotationId}`);
      let quotationData = response.data;
      console.log('Raw quotation data:', quotationData);

      if (quotationData.clientId) {
        const clientResponse = await axios.get(`http://localhost:5178/api/Clients/${quotationData.clientId}`);
        quotationData.clientName = clientResponse.data.clientName;
      }

      try {
        console.log('Fetching quotation items...');
        const itemsResponse = await axios.get(`http://localhost:5178/api/Quotations/byquotation/${quotationId}`);
        console.log('Items response:', itemsResponse.data);

        if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
          const itemPromises = itemsResponse.data.map(async (item) => {
            try {
              const itemDetailsResponse = await axios.get(`http://localhost:5178/api/Items/${item.itemId}`);
              return {
                ...item,
                itemName: itemDetailsResponse.data.itemName,
                quantity: item.quantity,
                itemPrice: item.itemPrice,
                amount: item.quantity * item.itemPrice
              };
            } catch (error) {
              console.error(`Error fetching item details for ${item.itemId}:`, error);
              return {
                ...item,
                itemName: 'Unknown Item',
                quantity: item.quantity,
                itemPrice: item.itemPrice,
                amount: item.quantity * item.itemPrice
              };
            }
          });

          const processedItems = await Promise.all(itemPromises);
          console.log('Processed items:', processedItems);
          quotationData.quotationItems = processedItems;
        }
      } catch (error) {
        console.error('Error fetching quotation items:', error);
      }

      console.log('Final quotation data being sent to PDF generator:', quotationData);

      // Generate and preview PDF in a new tab
      const pdfBlob = await generateQuotationPDFBlob(quotationData);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank"); // Preview in a new tab

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);

    } catch (error) {
      console.error('Error in handleExportPDF:', error);
      alert('Error generating PDF. Please check console for details.');
    }
  };


  const handleBulkExportPDF = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one quotation to export");
      return;
    }

    try {
      // Export PDFs for all selected quotations
      for (const quotationId of selectedRows) {
        await handleExportPDF(quotationId);
      }
    } catch (error) {
      console.error('Error exporting PDFs:', error);
      alert('Error generating PDFs. Please check console for details.');
    }
  };

  return (
    <div className="quotation-list-wrapper">
      <Sidebar />

      <div className="quotation-list-content">
        <div className="quotation-list-header">
          <div>
            <h2>Quotation List</h2>
            <p>Manage your quotations</p>
          </div>
          <button
            className="quotation-list-export-btn"
            onClick={handleBulkExportPDF}
          >
            📄 Export as PDF ({selectedRows.length} selected)
          </button>
        </div>

        <div className="quotation-list-filter-section">
          <div className="quotation-list-date-filters">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                applyDateFilter(e.target.value, toDate);
              }}
              className="quotation-list-date-picker"
            />
            <span className="quotation-list-arrow">➝</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                applyDateFilter(fromDate, e.target.value);
              }}
              className="quotation-list-date-picker"
            />
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
              <option value="1">Pending</option>
              <option value="2">Confirmed</option>
              <option value="3">Canceled</option>
            </select>
          </div>
          <button className="quotation-list-add-btn" onClick={() => navigate("/QuotationForm")}>
            + Add Quotation
          </button>
        </div>

        <div className="quotation-list-table-wrapper">
          <div className="quotation-list-table-responsive">
            <table className="quotation-list-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === filteredQuotations.length}
                    />
                  </th>
                  <th className="quotation-sortable" onClick={() => handleSort('quotationName')} style={{ cursor: 'pointer' }}>
                    Quotation Name {getSortIcon('quotationName')}
                  </th>
                  <th className="quotation-sortable" onClick={() => handleSort('clientId')} style={{ cursor: 'pointer' }}>
                    Client {getSortIcon('clientId')}
                  </th>
                  <th className="quotation-sortable" onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                    Date {getSortIcon('date')}
                  </th>
                  <th className="quotation-sortable" onClick={() => handleSort('grandTotal')} style={{ cursor: 'pointer' }}>
                    Total Amount {getSortIcon('grandTotal')}
                  </th>
                  <th className="quotation-sortable" onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    Status {getSortIcon('status')}
                  </th>
                  <th className="quotation-sortable" onClick={() => handleSort('note')} style={{ cursor: 'pointer' }}>
                    Note {getSortIcon('note')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentQuotations
                  .filter(q => {
                    const matchesSearch = setSearchQuery === '' ||
                      q.quotationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      q.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (client.find(c => c.clientId === q.clientId)?.clientName || '')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase());

                    const matchesStatus =
                      statusFilter === "all" || q.status.toString() === statusFilter;

                    return matchesSearch && matchesStatus;
                  })
                  .map((q) => (
                    <tr key={q.quotationId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(q.quotationId)}
                          onChange={() => handleCheckboxChange(q.quotationId)}
                        />
                      </td>
                      <td>{q.quotationName}</td>
                      <td>{client.find(c => c.clientId === q.clientId)?.clientName}</td>
                      <td>{new Date(q.date).toLocaleDateString()}</td>
                      <td>{q.grandTotal.toFixed(2)}</td>
                      <td>
                        <span className={`quotationlist-status-badge ${status.find(s => s.id === q.status)?.name.toLowerCase()}`}>
                          {status.find(s => s.id === q.status)?.name}
                        </span>
                      </td>
                      <td>{q.note}</td>

                      {/* Action Field */}
                      <td className="quotation-list-action-icons">
                        {/* Edit */}
                        <svg
                          viewBox="0 0 214 277"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={() => {
                            if (q.status !== 2 && q.status !== 3) {
                              navigate("/QuotationForm", { state: { q } });
                            }
                          }}
                          style={{
                            width: "24px",
                            height: "24px",
                            cursor: (q.status === 2 || q.status === 3) ? "not-allowed" : "pointer",
                            opacity: (q.status === 2 || q.status === 3) ? 0.5 : 1,
                            margin: "8px"
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
                          onClick={() => handleDelete(q.quotationId)}
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

                        <img
                          src={exportIcon}
                          alt="Export PDF"
                          onClick={() => handleExportPDF(q.quotationId)}
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                            marginLeft: "8px"
                          }}
                        />


                        {/* <span onClick={() => handleExportPDF(q.quotationId)} style={{ cursor: "pointer", marginLeft: "8px" }}>📄</span> */}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="quotation-list-pagination-container">
          <div className="quotation-list-pagination-left">
            <span>Quotations per page</span>
            <select value={rowsPerPage} onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}>
              {[10, 20, 50, 100].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span>
              Showing: {indexOfFirst + 1}-{Math.min(indexOfLast, filteredQuotations.length)} of {filteredQuotations.length}
            </span>
          </div>

          <div className="quotation-list-pagination-right">
            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><FaAngleDoubleLeft /></button>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}><FaAngleLeft /></button>
            <span>Page</span>
            <input type="number" value={currentPage} onChange={handlePageChange} min="1" max={totalPages} />
            <span>/ {totalPages}</span>
            <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}><FaAngleRight /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><FaAngleDoubleRight /></button>
          </div>
        </div>

        {/* Quotation Detail Modal */}
        {showModal && selectedQuotation && (
          <div className="ql-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="ql-modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close-button" onClick={() => setShowModal(false)}>&times;</span>
              <h3>{selectedQuotation.quotationName}</h3>

              {/* Horizontal Form Rows */}
              <div className="ql-form-row">
                <p><strong>Client:</strong> {clientMap[selectedQuotation.clientId]}</p>
                <p><strong>Date:</strong> {new Date(selectedQuotation.date).toLocaleDateString()}</p>
              </div>

              <div className="ql-form-row">
                <p><strong>Total:</strong> ₹{selectedQuotation.grandTotal}</p>
                <p><strong>Status:</strong> {status.find(s => s.id === selectedQuotation.status)?.name}</p>
              </div>

              <div className="ql-form-row">
                <p><strong>Note:</strong> {selectedQuotation.note}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationList;
