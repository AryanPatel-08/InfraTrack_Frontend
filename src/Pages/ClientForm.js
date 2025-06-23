import React, { useState, useEffect } from "react";
import "../CSS/ClientForm.css";
import Sidebar from "../Pages/Sidebar";
import axios from "axios";
import { showAlert } from '../utils/sweetAlert';
import stateCityData from "../Data/StateCities";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate for redirect


const ClientForm = () => {
    const navigate = useNavigate(); // Hook to handle navigation
    // const location = useLocation();
    // const editingClient = location.state?.client || null;

    const [formData, setFormData] = useState({
        clientId: null,
        clientName: "",
        email: "",
        mobile: "",
        companyName: "",
        identityProof: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        uploadClientPhoto: null,
        uploadIdentityProff: null
    });


    const [message, setMessage] = useState("");
    const [cities, setCities] = useState([]);

    const location = useLocation();
    const editingClient = location.state?.client || null;

    // Handle text input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "state") {
            setCities(stateCityData[value] || []);
            setFormData({ ...formData, state: value, city: "" });
        }
    };

    const [clientPhotoPreview, setClientPhotoPreview] = useState(null);
    const [identityProofPreview, setIdentityProofPreview] = useState(null);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            if (clientPhotoPreview) URL.revokeObjectURL(clientPhotoPreview);
            if (identityProofPreview) URL.revokeObjectURL(identityProofPreview);
        };
    }, [clientPhotoPreview, identityProofPreview]);

    // Set initial preview for edit mode
    useEffect(() => {
        if (editingClient) {
            setFormData({
                clientId: editingClient.clientId,
                clientName: editingClient.clientName,
                email: editingClient.email,
                mobile: editingClient.mobile,
                companyName: editingClient.companyName,
                identityProof: editingClient.identityProof,
                address: editingClient.address,
                state: editingClient.state,
                city: editingClient.city,
                pincode: editingClient.pincode,
                uploadClientPhoto: editingClient.uploadClientPhoto,  // Keep the existing image URL
                uploadIdentityProff: editingClient.uploadIdentityProff  // Keep the existing image URL
            });

            // Set preview images for existing URLs
            if (editingClient.uploadClientPhoto) {
                setClientPhotoPreview(editingClient.uploadClientPhoto);
            }
            if (editingClient.uploadIdentityProff) {
                setIdentityProofPreview(editingClient.uploadIdentityProff);
            }

            if (editingClient.state) {
                setCities(stateCityData[editingClient.state] || []);
            }
        }
    }, [editingClient]);

    const checkIfEmailExists = async (email, clientId) => {
        try {
            const res = await axios.get(`http://localhost:5178/api/Clients/CheckEmailExists`, {
                params: { email, clientId }
            });
            return res.data.exists;
        } catch (err) {
            console.error("Error checking email:", err);
            return false;
        }
    };

    const checkIfMobileExists = async (mobile, clientId) => {
        try {
            const res = await axios.get(`http://localhost:5178/api/Clients/CheckMobileExists`, {
                params: { mobile, clientId }
            });
            return res.data.exists;
        } catch (err) {
            console.error("Error checking mobile:", err);
            return false;
        }
    };


    // Handle mobile input (10-digit only)
    const handleMobileChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d{0,10}$/.test(value))) {
            setFormData({ ...formData, mobile: value });
        }
    };

    // Handle pincode input (6-digit only)
    const handlePincodeChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d{0,6}$/.test(value))) {
            setFormData({ ...formData, pincode: value });
        }
    };

    // Handle address input (letters, numbers, space, comma, dash, dot)
    const handleAddressChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9\s,.-]*$/.test(value)) {
            setFormData({ ...formData, address: value });
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFormData({ ...formData, email: value });
    };

    const [formErrors, setFormErrors] = useState({});

    // Client Form Validation
    const validateForm = async () => {
        let errors = {
            clientName: "",
            email: "",
            mobile: "",
            companyName: "",
            identityProof: "",
            address: "",
            state: "",
            city: "",
            pincode: ""
        };
        let isValid = true;

        const clientId = formData.clientId || null;

        // Client Name validation (required, max 50 chars)
        if (!formData.clientName.trim()) {
            errors.clientName = "Client Name is required.";
            isValid = false;
        } else if (formData.clientName.length > 50) {
            errors.clientName = "Client Name cannot exceed 50 characters.";
            isValid = false;
        }

        // Company Name validation (required, max 50 chars)
        if (!formData.companyName.trim()) {
            errors.companyName = "Company Name is required.";
            isValid = false;
        } else if (formData.companyName.length > 50) {
            errors.companyName = "Company Name cannot exceed 50 characters.";
            isValid = false;
        }

        // Address validation (required, max 100 chars)
        if (!formData.address.trim()) {
            errors.address = "Address is required.";
            isValid = false;
        } else if (formData.address.length > 100) {
            errors.address = "Address cannot exceed 100 characters.";
            isValid = false;
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required.";
            isValid = false;
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            errors.email = "Invalid email format.";
            isValid = false;
        } else {
            const emailExists = await checkIfEmailExists(formData.email.trim(), clientId);
            if (emailExists) {
                errors.email = "Email already exists.";
                isValid = false;
            }
        }

        // Mobile validation
        if (!formData.mobile.trim()) {
            errors.mobile = "Mobile number is required.";
            isValid = false;
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            errors.mobile = "Mobile number must be 10 digits.";
            isValid = false;
        } else {
            const mobileExists = await checkIfMobileExists(formData.mobile.trim(), clientId);
            if (mobileExists) {
                errors.mobile = "Mobile number already exists.";
                isValid = false;
            }
        }

        // State validation (required)
        if (!formData.state) {
            errors.state = "State is required.";
            isValid = false;
        }

        // Identity Proof validation (required)
        if (!formData.identityProof) {
            errors.identityProof = "Identity Proof is required.";
            isValid = false;
        }

        // City validation (required)
        if (!formData.city) {
            errors.city = "City is required.";
            isValid = false;
        }

        // Pincode validation (required, 6 digits)
        const pincodeNum = parseInt(formData.pincode);
        if (!formData.pincode) {
            errors.pincode = "Pincode is required.";
            isValid = false;
        } else if (isNaN(pincodeNum) || pincodeNum < 100000 || pincodeNum > 999999) {
            errors.pincode = "Pincode must be a 6-digit number.";
            isValid = false;
        }

        // Identity Proof
        if (!formData.uploadIdentityProff) {
            errors.uploadIdentityProff = "Identity Proof is required.";
            isValid = false;
        }

        // Client Photo
        if (!formData.uploadClientPhoto) {
            errors.uploadClientPhoto = "Client Photo is required.";
            isValid = false;
        }

        // Check if both are same file (File objects only)
        if (
            formData.uploadClientPhoto instanceof File &&
            formData.uploadIdentityProff instanceof File
        ) {
            if (
                formData.uploadClientPhoto.name === formData.uploadIdentityProff.name &&
                formData.uploadClientPhoto.size === formData.uploadIdentityProff.size
            ) {
                errors.uploadIdentityProff = "Client photo and identity proof cannot be the same file.";
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    useEffect(() => {
        if (editingClient) {
            setFormData({
                clientId: editingClient.clientId,
                clientName: editingClient.clientName,
                email: editingClient.email,
                mobile: editingClient.mobile,
                companyName: editingClient.companyName,
                identityProof: editingClient.identityProof,
                address: editingClient.address,
                state: editingClient.state,
                city: editingClient.city,
                pincode: editingClient.pincode,
                uploadClientPhoto: editingClient.uploadClientPhoto,  // Keep the existing image URL
                uploadIdentityProff: editingClient.uploadIdentityProff  // Keep the existing image URL
            });

            // Set preview images for existing URLs
            if (editingClient.uploadClientPhoto) {
                setClientPhotoPreview(editingClient.uploadClientPhoto);
            }
            if (editingClient.uploadIdentityProff) {
                setIdentityProofPreview(editingClient.uploadIdentityProff);
            }

            if (editingClient.state) {
                setCities(stateCityData[editingClient.state] || []);
            }
        }
    }, [editingClient]);

    useEffect(() => {
        if (formData.uploadClientPhoto instanceof File) {
            const url = URL.createObjectURL(formData.uploadClientPhoto);
            setClientPhotoPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof formData.uploadClientPhoto === "string" && formData.uploadClientPhoto) {
            const imageUrl = formData.uploadClientPhoto.startsWith('http')
                ? formData.uploadClientPhoto
                : `http://localhost:5178${formData.uploadClientPhoto}`;
            setClientPhotoPreview(imageUrl);
        }
    }, [formData.uploadClientPhoto]);

    useEffect(() => {
        if (formData.uploadIdentityProff instanceof File) {
            const url = URL.createObjectURL(formData.uploadIdentityProff);
            setIdentityProofPreview(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof formData.uploadIdentityProff === "string" && formData.uploadIdentityProff) {
            const imageUrl = formData.uploadIdentityProff.startsWith('http')
                ? formData.uploadIdentityProff
                : `http://localhost:5178${formData.uploadIdentityProff}`;
            setIdentityProofPreview(imageUrl);
        }
    }, [formData.uploadIdentityProff]);

    const handleImageChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            showAlert('error', 'Invalid File', 'Please upload only JPG, PNG, GIF, or WebP images.');
            e.target.value = '';
            return;
        }

        if (file.size > maxSize) {
            showAlert('error', 'File Too Large', 'Please upload an image smaller than 5MB.');
            e.target.value = '';
            return;
        }

        // Update form data with file
        setFormData(prev => ({
            ...prev,
            [fieldName]: file
        }));

        // Create and set preview URL
        const previewUrl = URL.createObjectURL(file);
        if (fieldName === 'uploadClientPhoto') {
            setClientPhotoPreview(previewUrl);
        } else if (fieldName === 'uploadIdentityProff') {
            setIdentityProofPreview(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!validateForm()) {
        //     showAlert('error', 'Validation Error', 'Please check all required fields and correct any errors.');
        //     return;
        // }

        const isValid = await validateForm(); // await async validation
        if (!isValid) {
            showAlert('error', 'Validation Error', 'Please check all required fields and correct any errors.');
            return;
        }

        try {
            const formPayload = new FormData();

            // Append all form fields
            formPayload.append('ClientId', formData.clientId || 0);
            formPayload.append('ClientName', formData.clientName.trim());
            formPayload.append('Email', formData.email.trim());
            formPayload.append('Mobile', formData.mobile);
            formPayload.append('CompanyName', formData.companyName.trim());
            formPayload.append('IdentityProof', formData.identityProof);
            formPayload.append('Address', formData.address.trim());
            formPayload.append('State', formData.state);
            formPayload.append('City', formData.city);
            formPayload.append('Pincode', formData.pincode);

            // Handle client photo
            if (formData.uploadClientPhoto instanceof File) {
                formPayload.append('UploadClientPhoto', formData.uploadClientPhoto); // new file selected
            } else if (typeof formData.uploadClientPhoto === 'string' && formData.uploadClientPhoto) {
                formPayload.append('UploadClientPhotoUrl', formData.uploadClientPhoto); // reuse existing URL
            }

            // Handle identity proof
            if (formData.uploadIdentityProff instanceof File) {
                formPayload.append('UploadIdentityProff', formData.uploadIdentityProff); // new file selected
            } else if (typeof formData.uploadIdentityProff === 'string' && formData.uploadIdentityProff) {
                formPayload.append('UploadIdentityProffUrl', formData.uploadIdentityProff); // reuse existing URL
            }

            const isUpdate = formData.clientId !== undefined && formData.clientId !== null;
            const url = isUpdate
                ? `http://localhost:5178/api/Clients/${formData.clientId}`
                : "http://localhost:5178/api/Clients/AddClient";

            // Log what we're sending
            console.log('Submitting to:', url);
            console.log('Form data contents:', {
                clientId: formData.clientId,
                clientPhotoType: formData.uploadClientPhoto instanceof File ? 'new file' :
                    typeof formData.uploadClientPhoto === 'string' ? 'existing url' : 'none',
                identityProofType: formData.uploadIdentityProff instanceof File ? 'new file' :
                    typeof formData.uploadIdentityProff === 'string' ? 'existing url' : 'none'
            });

            // Log all form data entries
            for (let pair of formPayload.entries()) {
                console.log(pair[0], pair[1]);
            }

            const response = await axios({
                method: isUpdate ? 'put' : 'post',
                url: url,
                data: formPayload,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Server response:', response.data);

            const actionText = isUpdate ? "updated" : "added";
            showAlert(
                'success',
                isUpdate ? 'Client Updated' : 'Client Added',
                `Client has been ${actionText} successfully!`,
                '',
                3000
            ).then(() => {
                navigate("/ClientList");
            });

        } catch (error) {
            console.error('Submission error:', error);
            console.error('Error response:', error.response?.data);

            const errorMessage = error.response?.data?.message ||
                'An error occurred while saving the client. Please try again.';
            showAlert('error', 'Error', errorMessage);
        }
    };


    // Handle cancel action with SweetAlert confirmation
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
                    clientName: "",
                    email: "",
                    mobile: "",
                    companyName: "",
                    identityProof: "",
                    address: "",
                    state: "",
                    city: "",
                    pincode: "",
                    uploadIdentityProff: "",
                    uploadClientPhoto: "",
                });
                setCities([]); // Reset city dropdown

                // Redirect to ClientList page
                navigate("/ClientList"); // Redirect to the Client List page
            }
        }).catch(error => {
            console.error("Error in alert handling:", error);
        });
    };

    return (
        <div className="client-container">
            <Sidebar />
            <div className="sub-title">
                <h2>{editingClient ? "Update Client" : "Add New Client"}</h2>
                <p className="subtitle-text">Manage your Client</p>
            </div>

            <form onSubmit={handleSubmit} className="form-grid-client" encType="multipart/form-data">
                <div>
                    <label>Client Name *</label>
                    <input
                        type="text"
                        name="clientName"
                        placeholder="Enter Client Name"
                        value={formData.clientName}
                        onChange={handleChange}
                        maxLength={50}
                    />
                    {formErrors.clientName && <span className="error">{formErrors.clientName}</span>}
                </div>
                <div>
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleEmailChange}
                    />
                    {formErrors.email && <span className="error">{formErrors.email}</span>}
                </div>
                <div>
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        name="mobile"
                        placeholder="Enter 10-digit Phone Number"
                        value={formData.mobile}
                        onChange={handleMobileChange}
                        maxLength={10}
                    />
                    {formErrors.mobile && <span className="error">{formErrors.mobile}</span>}
                </div>
                <div>
                    <label>Company Name *</label>
                    <input
                        type="text"
                        name="companyName"
                        placeholder="Enter Company Name"
                        value={formData.companyName}
                        onChange={handleChange}
                        maxLength={50}
                    />
                    {formErrors.companyName && <span className="error">{formErrors.companyName}</span>}
                </div>
                <div>
                    <label>Identity Proof</label>
                    <select name="identityProof" value={formData.identityProof} disabled={editingClient} onChange={handleChange}>
                        <option value="">Choose Proof</option>
                        <option value="1">Passport</option>
                        <option value="2">Driver's License</option>
                        <option value="3">Aadhar Card</option>
                    </select>
                    {formErrors.identityProof && <span className="error">{formErrors.identityProof}</span>}
                </div>
                <div>
                    <label>Address</label>
                    <input type="text" name="address" placeholder="Enter Address" value={formData.address} onChange={handleAddressChange} />
                    {formErrors.address && <span className="error">{formErrors.address}</span>}
                </div>

                <div>
                    <label>State</label>
                    <select name="state" value={formData.state} onChange={handleChange}>
                        <option value="">Choose State</option>
                        {Object.keys(stateCityData).map((state) => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                    {formErrors.state && <span className="error">{formErrors.state}</span>}
                </div>

                <div>
                    <label>City</label>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        disabled={!formData.state} // Disable until a state is selected
                    >
                        <option value="">Choose City</option>
                        {(stateCityData[formData.state] || []).map((city) => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    {formErrors.city && <span className="error">{formErrors.city}</span>}
                </div>

                <div>
                    <label>Pincode</label>
                    <input type="text" name="pincode" placeholder="Enter Pincode" value={formData.pincode} onChange={handlePincodeChange} />
                    {formErrors.pincode && <span className="error">{formErrors.pincode}</span>}
                </div>

                <div className="">
                    <label>Client Photo</label>
                    <input
                        type="file"
                        name="UploadClientPhoto"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => handleImageChange(e, 'uploadClientPhoto')}
                    />
                    {clientPhotoPreview && (
                        <div className="image-preview">
                            <img
                                src={clientPhotoPreview}
                                alt="Client"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        </div>
                    )}
                    {formErrors.uploadClientPhoto && <span className="error">{formErrors.uploadClientPhoto}</span>}
                </div>

                <div className="">
                    <label>Identity Proof Document</label>
                    <input
                        type="file"
                        name="UploadIdentityProff"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => handleImageChange(e, 'uploadIdentityProff')}
                    />
                    {identityProofPreview && (
                        <div className="image-preview">
                            <img
                                src={identityProofPreview}
                                alt="Identity Proof"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />
                        </div>
                    )}
                    {formErrors.uploadIdentityProff && <span className="error">{formErrors.uploadIdentityProff}</span>}
                </div>

                <div className="button-group-client">
                    <button type="submit" className="submit-btn-client">
                        {editingClient ? "Update" : "Add"}
                    </button>
                    <button type="button" className="cancel-btn-client" onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </form>

            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default ClientForm;