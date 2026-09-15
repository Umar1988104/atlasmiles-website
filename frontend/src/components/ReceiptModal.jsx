import { FiPrinter, FiX } from "react-icons/fi";

export default function ReceiptModal({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-box receipt-box" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-print-area">
          <h2 style={{ marginBottom: "0.2rem" }}>Atlasmiles</h2>
          <p className="muted" style={{ marginBottom: "1.2rem" }}>Booking Receipt</p>

          <div className="payment-summary">
            <div className="payment-summary-row"><span>Booking ID</span><span>{booking.id.slice(0, 8).toUpperCase()}</span></div>
            <div className="payment-summary-row"><span>Package</span><span>{booking.packageName}</span></div>
            <div className="payment-summary-row"><span>Destination</span><span>{booking.destination}</span></div>
            <div className="payment-summary-row"><span>Travel Date</span><span>{new Date(booking.date).toDateString()}</span></div>
            <div className="payment-summary-row"><span>Travellers</span><span>{booking.travellers}</span></div>
            <div className="payment-summary-row"><span>Lead Traveller</span><span>{booking.leadName}</span></div>
            <div className="payment-summary-row"><span>Price / Person</span><span>₹{booking.pricePerPerson.toLocaleString("en-IN")}</span></div>
            <div className="payment-summary-row"><strong>Total Paid</strong><strong>₹{booking.totalAmount.toLocaleString("en-IN")}</strong></div>
            {booking.transactionId && <div className="payment-summary-row"><span>Transaction ID</span><span>{booking.transactionId}</span></div>}
          </div>

          {booking.travellerDetails && booking.travellerDetails.length > 0 && (
            <div style={{ textAlign: "left", marginTop: "1rem" }}>
              <p className="muted" style={{ marginBottom: "0.4rem" }}>Travellers</p>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
                {booking.travellerDetails.map((t, i) => <li key={i}>{t.name} ({t.age} yrs)</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button className="btn btn-outline" onClick={onClose}><FiX /> Close</button>
          <button className="btn btn-primary" onClick={() => window.print()}><FiPrinter /> Print</button>
        </div>
      </div>
    </div>
  );
}
