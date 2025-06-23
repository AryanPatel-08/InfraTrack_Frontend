import Swal from "sweetalert2";

// showAlert function to handle SweetAlert across the app
export const showAlert = (type, title, text, redirectUrl = "", timer = 0, isConfirmation = false) => {
  return Swal.fire({
    icon: type, // 'success', 'error', 'warning', 'info', etc.
    title: title,
    text: text,
    showConfirmButton: timer === 0, // Hide the button if timer is set
    timer: timer, // Automatic close after timer (ms) if set
    confirmButtonText: 'OK',
    showCancelButton: isConfirmation, // Show cancel button if it's a confirmation dialog
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (redirectUrl && result.isConfirmed) {
      window.location.href = redirectUrl; // Redirect after alert closes
    }
    return result; // Ensure result is returned
  });
};
