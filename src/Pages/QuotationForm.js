import React, { useState, useEffect } from "react";
import { FaRupeeSign, FaTrash } from "react-icons/fa";
import "../CSS/QuotationForm.css";
import Sidebar from "../Pages/Sidebar";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert } from '../utils/sweetAlert';

const QuotationForm = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [statusesEx, setStatusesEx] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [taxRate, setTaxRate] = useState(18);
  const [itemErrors, setItemErrors] = useState([{}]);


  const location = useLocation();
  const editingQuotation = location.state?.q || null;
  // console.log(editingQuotation);

  const [formErrors, setFormErrors] = useState({
    quotationId: "",
    clientName: "",
    email: "",
    mobile: "",
    quotationName: "",
    quotationDate: "",
    note: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    quotationId: "",
    clientName: "",
    email: "",
    mobile: "",
    quotationName: "",
    quotationDate: "",
    note: "",
    status: "",
  });

  const [items, setItems] = useState([
    { itemId: "", name: "", itemPrice: 0, quantity: "", amount: 0, remark: "" },
  ]);

  const hasError = items.some(item => item.amount === "ERROR");

  const amount = hasError
    ? "ERROR"
    : items.reduce((acc, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const itemPrice = parseFloat(item.itemPrice) || 0;
      return acc + quantity * itemPrice;
    }, 0);

  const orderTax = amount === "ERROR"
    ? "ERROR"
    : (amount * taxRate) / 100;

  const grandTotal = amount === "ERROR" || orderTax === "ERROR"
    ? "ERROR"
    : amount + orderTax;


  useEffect(() => {
    axios.get("http://localhost:5178/api/Clients")
      .then((res) => setClients(res.data))
      .catch((err) => console.error("Error fetching clients:", err));

    axios.get("http://localhost:5178/api/Items")
      .then((res) => setAllItems(res.data))
      .catch((err) => console.error("Error fetching items:", err));
    fetchQuotationStatuses();
    fetchQuotationStatusesEx();
  }, []);

  const fetchQuotationStatuses = async () => {
    try {
      const res = await axios.get("http://localhost:5178/api/Quotations/getstatus");
      const data = res.data || res.data || [];
      setStatuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      setStatuses([]);
    }
  };


  const fetchQuotationStatusesEx = async () => {
    try {
      const res = await axios.get("http://localhost:5178/api/Quotations/getstatusEx");
      const data = res.data || res.data || [];
      setStatusesEx(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching statuses:", err);
      setStatusesEx([]);
    }
  };


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Optional: Clear error for this field
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };




  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    const currentItem = updatedItems[index];

    const updatedErrors = [...itemErrors];

    if (field === 'itemId') {
      const selectedItem = allItems.find(item => item.itemId === parseInt(value));

      if (selectedItem) {
        updatedItems[index] = {
          ...currentItem,
          itemId: selectedItem.itemId,
          name: selectedItem.name,
          // itemPrice, quantity, and amount remain unchanged
        };
      }
    } else {
      updatedItems[index][field] = value;

      if (field === 'quantity' || field === 'itemPrice') {
        const price = parseFloat(updatedItems[index].itemPrice) || 0;
        const qty = parseInt(updatedItems[index].quantity) || 0;

        if (price > 99999 || qty > 99999) {
          updatedItems[index].amount = "ERROR";
        } else {
          updatedItems[index].amount = price * qty;
        }
      }

    }


    // Inline validation (like your quotationName logic)
    if (!updatedErrors[index]) {
      updatedErrors[index] = {};
    }

    switch (field) {
      case "itemId":
        updatedErrors[index].itemId = value ? "" : "Item is required.";
        break;

      case "itemPrice":
        if (value.trim() === "") {
          updatedErrors[index].itemPrice = "Price is required.";
        } else if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          updatedErrors[index].itemPrice = "Enter a valid price (up to 2 decimal places).";
        } else if (parseFloat(value) <= 0) {
          updatedErrors[index].itemPrice = "Enter valid positive price.";
        } else if (parseFloat(value) > 99999) {
          updatedErrors[index].itemPrice = "Max price is 99999.";
        } else {
          updatedErrors[index].itemPrice = "";
        }
        break;

      case "quantity":
        if (!/^[0-9]+$/.test(value) || parseInt(value) <= 0) {
          updatedErrors[index].quantity = "Enter valid positive quantity.";
        } else if (parseInt(value) > 99999) {
          updatedErrors[index].quantity = "Max quantity is 99999.";
        } else {
          updatedErrors[index].quantity = "";
        }
        break;

      default:
        break;
    }


    setItems(updatedItems);
    setItemErrors(updatedErrors);
  };


  // Add New Item Row
  const addItem = () => {
    const lastItem = items[items.length - 1];

    // Check for incomplete last item first
    if (!lastItem.itemId || !lastItem.itemPrice || !lastItem.quantity || !lastItem.amount) {
      alert("Please complete the current item before adding a new one.");
      return;
    }

    // Calculate if there's an error in the subtotal (e.g. from your validation logic)
    const hasErrorInItems = items.some(item => item.amount === "ERROR");

    if (hasErrorInItems) {
      alert("Fix item price or quantity errors before adding a new item.");
      return;
    }

    setItems([
      ...items,
      { itemId: "", name: "", itemPrice: 0, quantity: "", amount: 0 },
    ]);
  };


  // Remove Item Row
  const handleRemoveRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // Quotation Name Validation 
  const handleQuotationNameChange = (e) => {
    const value = e.target.value;
    const namePattern = /^[A-Za-z0-9\s\-]*$/;

    if (namePattern.test(value)) {
      setFormData((prevData) => ({ ...prevData, quotationName: value }));

      // Clear error if one existed
      if (formErrors.quotationName) {
        setFormErrors((prevErrors) => ({ ...prevErrors, quotationName: "" }));
      }
    }
  };

  // Note Validation
  const handleNoteChange = (e) => {
    const value = e.target.value;
    const notePattern = /^[a-zA-Z0-9\s.,!@#&()\-]*$/;

    if (notePattern.test(value)) {
      setFormData((prevData) => ({ ...prevData, note: value }));

      // Clear error if one existed
      if (formErrors.note) {
        setFormErrors((prevErrors) => ({ ...prevErrors, note: "" }));
      }

    }

  };

  // Vaidation Function
  const validateForm = () => {
    let errors = {
      clientName: "",
      quotationName: "",
      quotationDate: "",
      status: "",
      note: "",
    };
    let isValid = true;

    // Client Name validation
    if (!formData.clientName.trim()) {
      errors.clientName = "Client name is required.";
      isValid = false;
    }

    // Quotation Name validation
    if (!formData.quotationName.trim()) {
      errors.quotationName = "Quotation name is required.";
      isValid = false;
    }

    // Quotation Date validation
    if (!formData.quotationDate.trim()) {
      errors.quotationDate = "Quotation quotationDate is required.";
      isValid = false;
    }

    // Status validation
    if (editingQuotation && !formData.status) {
      errors.status = "Status is required.";
      isValid = false;
    }

    // Note validation
    if (!formData.note.trim()) {
      errors.note = "Note is required.";
      isValid = false;
    }

    // Validate each item individually and build itemErrors array
    const updatedItemErrors = items.map((item) => {
      const itemError = {};

      if (!item.itemId) {
        itemError.itemId = "Item is required.";
        isValid = false;
      }
      if (!item.itemPrice || parseFloat(item.itemPrice) <= 0) {
        itemError.itemPrice = "Enter valid positive price.";
        isValid = false;
      } else if (parseFloat(item.itemPrice) > 99999) {
        itemError.itemPrice = "Max price is 99999.";
        isValid = false;
      }
      // **Quantity validation:**
      if (!item.quantity || !/^\d+$/.test(item.quantity) || parseInt(item.quantity) <= 0) {
        itemError.quantity = "Enter valid positive quantity.";
        isValid = false;
      } else if (parseInt(item.quantity) > 99999) {
        itemError.quantity = "Max quantity is 99999.";
        isValid = false;
      }

      return itemError;
    });


    setFormErrors(errors);
    setItemErrors(updatedItemErrors);

    return isValid;
  };



  useEffect(() => {
    if (editingQuotation) {
      setFormData({
        quotationId: editingQuotation.quotationId,
        clientName: editingQuotation.clientId?.toString() || "",
        email: editingQuotation.client?.email?.toString() || "",
        mobile: editingQuotation.client?.mobile || "",
        quotationName: editingQuotation.quotationName || "",
        quotationDate: editingQuotation.date || "",
        status: editingQuotation.status || "",
        note: editingQuotation.note || "",
        grandTotal: editingQuotation.grandTotal,
        orderTax: editingQuotation.orderTax
      });

      // Set items if present
      if (editingQuotation.quotationItems) {
        setItems(editingQuotation.quotationItems.map(item => ({
          itemId: item.itemId.toString(),
          itemPrice: parseFloat(item.itemPrice),
          quantity: item.quantity,
          amount: item.amount || (item.itemPrice * item.quantity),
          remark: item.remark
        })));
      }
    } else {
      // For Add form, set today's date
      setFormData(prev => ({
        ...prev,
        quotationDate: getTodayDate(),
      }));
    }
  }, [editingQuotation]);

  // Helper function outside your component or inside (above useEffect)
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    console.log(formData);
    console.log(items);

    const isUpdate = formData.quotationId && formData.quotationId !== '';
    const quotationPayload = {
      // quotationId: formData.quotationId || null,
      clientId: parseInt(formData.clientName),
      quotationName: formData.quotationName,
      quotationDate: formData.quotationDate,
      status: Number(formData.status),
      note: formData.note,
      items: items,
      grandTotal: grandTotal,
      orderTax: orderTax,

    };

    console.log("Submitting quotation data:", quotationPayload);
    // return
    try {
      // ✅ Updated condition
      // const isUpdate = formData.quotationId && formData.quotationId !== '';
      if (isUpdate) {
        quotationPayload.quotationId = formData.quotationId;
      }

      console.log("Is update:", isUpdate);
      console.log(formData);

      const url = isUpdate
        ? `http://localhost:5178/api/Quotations/${formData.quotationId}`
        : "http://localhost:5178/api/Quotations";

      const method = isUpdate ? axios.put : axios.post;

      const response = await method(url, quotationPayload, {
        headers: { "Content-Type": "application/json" }
      });

      const actionText = isUpdate ? "updated" : "added";
      const successTitle = isUpdate ? "Quotation Updated" : "Quotation Added";

      console.log(`Quotation ${actionText}:`, response.data);
      setError("");
      setMessage("");

      showAlert(
        "success",
        successTitle,
        `Quotation has been ${actionText} successfully!`,
        "",
        3000
      ).then(() => {
        navigate("/QuotationList", { state: { newQuotation: response.data } });
      });

      // Reset form
      setFormData({
        quotationId: null,
        clientName: "",
        quotationName: "",
        quotationDate: "",
        status: "",
        note: "",
        email: "",
        mobile: "",
        remark: "",
      });

      setItems([
        { itemId: "", itemPrice: 0, quantity: "", amount: 0 }
      ]);

    } catch (err) {
      console.error("Error submitting quotation:", err);
      const apiError = err.response?.data?.detail || err.message || "Internal Server Error";
      setError(apiError);
      setMessage("");

      showAlert(
        "error",
        "Error Submitting Quotation",
        apiError,
        "",
        3000
      );
    }
  };

  const handleCancel = () => {
    showAlert(
      "warning", // Alert type
      "Are you sure?", // Title
      "Do you really want to cancel and clear the form?", // Message
      "", // No redirect URL
      0, // No timer (wait for user action)
      true // Show confirmation button
    ).then((result) => {
      if (result.isConfirmed) {
        // Reset quotation form data
        setFormData({
          quotationId: "",
          clientName: "",
          email: "",
          mobile: "",
          quotationName: "",
          quotationDate: "",
          note: "",
          status: "",
        });

        setItems([{ itemId: "", name: "", itemPrice: 0, quantity: "", amount: 0 }]);
        setError(""); // Clear error message

        // Redirect to QuotationList
        navigate("/QuotationList");
      }
    }).catch((error) => {
      console.error("Error in cancel confirmation:", error);
    });
  };



  return (
    <form className="quotation-container" onSubmit={handleSubmit}>
      <Sidebar />
      <div className="sub-title">
        <h2>{editingQuotation ? "Update Quotation" : "Add New Quotation"}</h2>
        <p className="subtitle-text">Manage your Quotation</p>
      </div>

      <div className="form-grid-q">
        <div>
          <label>Client Name</label>
          <select name="clientName" value={formData.clientName}
            disabled={editingQuotation}
            onChange={(e) => {
              const selectedId = e.target.value;
              const client = clients.find(c => c.clientId.toString() === selectedId);
              setFormData(prev => ({
                ...prev,
                clientName: selectedId,
                email: client?.email || "",
                mobile: client?.mobile || "",
              }));
            }}>
            <option value="">Select Client</option>
            {clients?.map(c => (
              <option key={c.clientId} value={c.clientId}>{c.clientName}</option>
            ))}
          </select>
          {formErrors.clientName && <span className="error">{formErrors.clientName}</span>}
        </div>

        <div>
          <label>Email</label>
          <input type="email" value={formData.email} disabled />
        </div>

        <div>
          <label>Mobile</label>
          <input type="text" value={formData.mobile} disabled />
        </div>

        <div>
          <label>Quotation Name</label>
          <input type="text" name="quotationName" value={formData.quotationName} onChange={handleQuotationNameChange} disabled={editingQuotation} placeholder="Quotation Name..." />
          {formErrors.quotationName && <span className="error">{formErrors.quotationName}</span>}
        </div>

        <div>
          <label>Quotation Date</label>
          <input type="date" name="quotationDate" disabled={editingQuotation} value={formData.quotationDate} onChange={handleFormChange} />
          {formErrors.quotationDate && <span className="error">{formErrors.quotationDate}</span>}
        </div>

        {editingQuotation && (
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleFormChange}
              className="form-control"
              disabled={!editingQuotation}
            >
              {!editingQuotation ? (
                <option value={1}>Pending</option>
              ) : (
                <>
                  {/* <option value="">Select Status</option> */}
                  {statusesEx.map((s, index) => (
                    <option key={index} value={s.id}>{s.name}</option>
                  ))}
                </>
              )}
            </select>

            {formErrors.status && <div className="error">{formErrors.status}</div>}
          </div>
        )}


        <div className="full-width">
          <label>Note</label>
          <textarea name="note" value={formData.note} onChange={handleNoteChange} placeholder="Enter Note"></textarea>
          {formErrors.note && <span className="error">{formErrors.note}</span>}
        </div>
      </div>

      <table className="quotation-table">
        <thead>
          <tr>
            <th>Work</th>
            <th>Rate Per SQ.FT (<FaRupeeSign />)</th>
            <th>Total SQ.FT</th>
            <th>Subtotal (<FaRupeeSign />)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, index) => (
            <tr key={index}>
              <td>
                {/* Item dropdown */}
                <select
                  value={item.itemId}
                  onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                >
                  <option value="">Select Work</option>
                  {allItems.map((option) => (
                    <option key={option.itemId} value={option.itemId}>
                      {option.itemName}
                    </option>
                  ))}
                </select>
                {itemErrors[index]?.itemId && (
                  <span className="error">{itemErrors[index].itemId}</span>
                )}

                {/* Remark field shown below, only if item is selected */}
                {item.itemId && (
                  <div style={{ marginTop: '5px' }}>
                    <textarea
                      placeholder="Enter remark"
                      value={item.remark || ""}
                      onChange={(e) => handleItemChange(index, "remark", e.target.value)}
                      rows="2"
                      cols="30"
                      className="remark-textarea"
                    />
                    {formErrors.remarks && formErrors.remarks[index] && (
                      <span className="error">{formErrors.remarks[index]}</span>
                    )}
                  </div>
                )}
              </td>

              <td>
                <input
                  type="text"
                  value={item.itemPrice || ""}
                  placeholder="Price per Sq.Ft"
                  onChange={(e) => {
                    const value = e.target.value;

                    // Allow only digits with at most one decimal point
                    if (/^\d*\.?\d*$/.test(value)) {
                      handleItemChange(index, "itemPrice", value); // Let all values go through
                    }
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "blue")}
                  onBlur={(e) => (e.target.style.borderColor = "")}
                />
                {itemErrors[index]?.itemPrice && (
                  <span className="error">{itemErrors[index].itemPrice}</span>
                )}
              </td>



              <td>
                <input
                  type="text"
                  value={item.quantity || ""}
                  placeholder="Total Sq.Ft"
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only digits (no decimals for quantity)
                    if (/^\d*$/.test(value)) {
                      handleItemChange(index, "quantity", value);
                    }
                  }}
                />
                {itemErrors[index]?.quantity && (
                  <span className="error">{itemErrors[index].quantity}</span>
                )}

              </td>

              {/* <td>{item.amount.toFixed(2)}</td> */}
              <td>
                {item.amount === "ERROR" ? (
                  <span className="error">ERROR</span>
                ) : (
                  Number(item.amount).toFixed(2)
                )}
              </td>

              <td>
                <svg
                  onClick={() => items.length === 1 ? null : handleRemoveRow(index)}
                  viewBox="0 0 500 500"
                  xmlSpace="preserve"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  title={items.length === 1 ? "At least one item is required" : "Remove item"}
                  style={{
                    cursor: items.length === 1 ? "not-allowed" : "pointer",
                    opacity: items.length === 1 ? 0.5 : 1,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
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

      <button type="button" className="add-btn-q" onClick={addItem}>+ New Row</button>

      <div className="order-summary-q" style={{ color: "red", fontWeight: "bold" }}>
        <p>
          <strong>
            Amount: <FaRupeeSign />{" "}
            <span className={amount === "ERROR" ? "error-text" : ""} >
              {amount === "ERROR" ? "ERROR" : amount.toFixed(2)}
            </span>
          </strong>
        </p>
        <p>
          GST: <FaRupeeSign />{" "}
          <span className={orderTax === "ERROR" ? "error-text" : ""}>
            {orderTax === "ERROR" ? "ERROR" : orderTax.toFixed(2)}
          </span>{" "}
          ({taxRate}%)
        </p>
        <p>
          <strong>
            Total Amount: <FaRupeeSign />{" "}
            <span className={grandTotal === "ERROR" ? "error-text" : ""}>
              {grandTotal === "ERROR" ? "ERROR" : grandTotal.toFixed(2)}
            </span>
          </strong>
        </p>
      </div>




      {error && <p className="error-msg-q">{error}</p>}
      {message && <p className="success-msg-q">{message}</p>}

      <div className="button-group-q">
        <button type="submit" className="submit-btn-q">Save</button>
        <button type="button" className="cancel-btn-q" onClick={(handleCancel)}> Cancel </button>
      </div>
    </form>
  );
};

export default QuotationForm;
