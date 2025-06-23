import React from "react";

const quotationExpandableRow = ({ quotation, isExpanded, onToggle, q, client }) => {
  return (
    <>
      <tr onClick={() => onToggle(quotation.id)} style={{ cursor: "pointer", backgroundColor: "#f4f4f4" }}>
        <td>{client.find(c => c.clientId === q.clientId)?.clientName}</td>
        <td>{quotation.date}</td>
        <td>{quotation.totalAmount}</td>
        <td>{quotation.tax}</td>
        <td>{quotation.finalAmount}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="5">
            <table style={{ width: "100%", background: "#fff", border: "1px solid #ccc" }}>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.quotationItems?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.itemName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.rate}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};

export default quotationExpandableRow;
