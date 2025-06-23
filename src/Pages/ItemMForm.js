import React, { useState, useEffect } from "react";
import "../CSS/ItemMForm.css";
import Sidebar from "../Pages/Sidebar";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { showAlert } from "../utils/sweetAlert"; // Import your showAlert function

const AddItem = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();
    const editingItem = location.state?.item || null;

    const [itemName, setItemName] = useState("");
    const [itemCode, setItemCode] = useState("");

    const [formData, setFormData] = useState({
        itemName: "",
        itemCode: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Empty Field Error Message
    const [formErrors, setFormErrors] = useState({});


    // Validate form
    const validateForm = () => {
        let errors = {
            itemName: "",
            itemCode: "",
        };
        let isValid = true;

        // Item Name: only letters and spaces
        if (!formData.itemName.trim()) {
            errors.itemName = "Item name is required.";
            isValid = false;
        } else if (!/^[A-Za-z\s]+$/.test(formData.itemName.trim())) {
            errors.itemName = "Item name can contain only letters and spaces.";
            isValid = false;
        }

        // Item Code: allow letters, numbers, spaces, and dashes
        if (!formData.itemCode.trim()) {
            errors.itemCode = "Item code is required.";
            isValid = false;
        } else if (!/^[A-Za-z0-9\s\-]+$/.test(formData.itemCode.trim())) {
            errors.itemCode = "Item code can contain only letters, numbers, spaces, and dashes.";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };


    useEffect(() => {
        if (editingItem) {
          setFormData({
            itemId: editingItem.itemId,
            itemName: editingItem.itemName,
            itemCode: editingItem.itemCode,
          });
        }
      }, [editingItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting item data:", formData);

        if (!validateForm()) return;
        const itemData = { itemName, itemCode };

        
        try {
            const isUpdate = formData.itemId !== undefined && formData.itemId !== null;
            const url = isUpdate
                ? `http://localhost:5178/api/Items/${formData.itemId}`
                : "http://localhost:5178/api/Items";
        
            const method = isUpdate ? axios.put : axios.post;
        
            const response = await method(url, formData, {
                headers: { "Content-Type": "application/json" }
            });
        
            const actionText = isUpdate ? "updated" : "added";
            const successTitle = isUpdate ? "Item Updated" : "Item Added";
        
            console.log(`Item ${actionText}:`, response.data);
            setError("");
        
            showAlert(
                'success',
                successTitle,
                `${formData.itemName} has been ${actionText} successfully!`,
                "",
                3000
            ).then(() => {
                navigate("/ItemMList");
            });
        
            setFormData({
                itemId: null, // Ensure reset
                itemName: "",
                itemCode: ""
            });
        }catch (err) {
            console.error("Error adding item:", err);
            const apiError = err.response?.data?.detail || err.message || "Internal Server Error";
            setError(apiError);
            setMessage("");

            // Use showAlert for error
            showAlert(
                'error', // Type
                'Error Adding Item', // Title
                apiError, // Message
                "", // No redirect URL
                3000 // Timer duration
            );
        }
    };
   

    const handleCancel = () => {
        // Show confirmation dialog and handle result
        showAlert(
            "warning", // Set the type to 'warning'
            "Are you sure?", // Title of the confirmation
            "Do you really want to clear the form?", // Message of the confirmation
            "", // No redirect URL here
            0, // No timer
            true // This is a confirmation dialog
        ).then((result) => {
            if (result.isConfirmed) {
                // Reset form after confirmation
                setFormData({
                    itemName: "",
                    itemCode: ""
                });

                // Redirect to Item List page
                navigate("/ItemMList"); // Redirect to the Item List page
            }
        }).catch(error => {
            console.error("Error in alert handling:", error);
        });
    };



    return (
        <div className="add-item-container">
            <Sidebar />
            {/* <h2>Add Item</h2> */}
            <div className="sub-title">
            <h2>{editingItem ? "Update Item" : "Add New Item"}</h2>
                <p className="subtitle-text">Manage your Item</p>
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <form className="form-grid-item" onSubmit={handleSubmit}>
                <div>
                    <label>Item Name</label>
                    <input
                        type="text"
                        name="itemName"
                        value={formData.itemName}
                        onChange={handleChange}
                        placeholder="Enter Name"
                    />
                    {formErrors.itemName && <p className="error-text">{formErrors.itemName}</p>}
                </div>
                <div>
                    <label>Item Code</label>
                    <input
                        type="text"
                        name="itemCode"
                        value={formData.itemCode}
                        onChange={handleChange}
                        placeholder="Enter Code"
                    />
                    {formErrors.itemCode && <p className="error-text">{formErrors.itemCode}</p>}
                </div>
                <div>
                    <label>Created At</label>
                    <input
                        type="text"
                        value={new Date().toLocaleDateString()}
                        disabled
                    />
                </div>

                <div className="button-group-item">
                    <button type="submit" className="submit-btn-item">{editingItem ? "Update" : "Add"}</button>
                    <button type="button" className="cancel-btn-item" onClick={handleCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddItem;
