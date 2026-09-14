import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheck, FiCreditCard } from "react-icons/fi";
import { api } from "../api";

export default function Payment() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.getBooking(bookingId).then((data) => setBooking(data.booking)).catch(() => setError("Booking not found."));
  }, [bookingId]);

  async function handlePay() {
    setError("");
    setPaying(true);
    try {
      const data = await api.payBooking(bookingId);
      setBooking(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  }

  if (error && !booking) {
    return (
      <div className="section narrow">
        <p className="error-text">{error}</p>
        <Link to="/my-bookings" className="btn btn-small">Go to My Bookings</Link>
      </div>
    );
  }
  if (!booking) return <p className="page-loading">Loading...</p>;

  if (booking.status === "confirmed") {
    return (
      <div className="section narrow">
        <div className="payment-card">
          <div className="payment-success-icon"><FiCheck /></div>
          <h1>Booking Confirmed!</h1>
          <p className="muted">Transaction ID: {booking.transactionId}</p>
          <div className="payment-summary">
            <div className="payment-summary-row"><span>Package</span><span>{booking.packageName}</span></div>
            <div className="payment-summary-row"><span>Date</span><span>{new Date(booking.date).toDateString()}</span></div>
            <div className="payment-summary-row"><span>Travellers</span><span>{booking.travellers}</span></div>
            <div className="payment-summary-row"><strong>Paid</strong><strong>₹{booking.totalAmount.toLocaleString("en-IN")}</strong></div>
          </div>
          <Link to="/my-bookings" className="btn btn-primary btn-block">View My Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section narrow">
      <div className="payment-card">
        <h1>Complete Payment</h1>
        <div className="dev-note">
          <strong>Sandbox mode:</strong> no real gateway is connected yet — clicking "Pay Now" simulates a
          successful payment so the full flow can be tested end to end.
        </div>
        {error && <p className="error-text">{error}</p>}
        <div className="payment-summary">
          <div className="payment-summary-row"><span>Package</span><span>{booking.packageName}</span></div>
          <div className="payment-summary-row"><span>Date</span><span>{new Date(booking.date).toDateString()}</span></div>
          <div className="payment-summary-row"><span>Travellers</span><span>{booking.travellers}</span></div>
          <div className="payment-summary-row"><strong>Total</strong><strong>₹{booking.totalAmount.toLocaleString("en-IN")}</strong></div>
        </div>
        <button className="btn btn-primary btn-block" onClick={handlePay} disabled={paying}>
          <FiCreditCard /> {paying ? "Processing..." : `Pay ₹${booking.totalAmount.toLocaleString("en-IN")}`}
        </button>
      </div>
    </div>
  );
}
