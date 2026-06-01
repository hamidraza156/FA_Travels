import React, { useState, useEffect } from "react";
import "../styles/Bookings.css";
import api from "../api/axios";

const Bookings = () => {
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [transports, setTransports] = useState([]);

  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedTransport, setSelectedTransport] = useState("");

  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);

  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingTransports, setLoadingTransports] = useState(false);

  const [bookingMessage, setBookingMessage] = useState("");

  // New states for user bookings, editing booking, and editing fields
  const [userBookings, setUserBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editGuests, setEditGuests] = useState(1);

  // Fetch destinations
  useEffect(() => {
    api
      .get("/destinations/")
      .then((res) => {
        const dests = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setDestinations(dests);
      })
      .catch((err) => {
        console.error("Destination fetch error:", err);
        setDestinations([]);
      });
  }, []);

  // Fetch hotels when destination changes
  useEffect(() => {
    if (!selectedDestination) {
      setHotels([]);
      setSelectedHotel("");
      return;
    }

    setLoadingHotels(true);
    api
      .get(`/hotels/?destination=${selectedDestination}`)
      .then((res) => {
        const hotelList = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setHotels(hotelList);
        setSelectedHotel("");
        setLoadingHotels(false);
      })
      .catch(() => {
        setHotels([]);
        setLoadingHotels(false);
      });
  }, [selectedDestination]);

  // Fetch transports when destination changes
  useEffect(() => {
    if (!selectedDestination) {
      setTransports([]);
      setSelectedTransport("");
      return;
    }

    setLoadingTransports(true);
    api
      .get(`/transports/?destination=${selectedDestination}`)
      .then((res) => {
        const transportList = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setTransports(transportList);
        setSelectedTransport("");
        setLoadingTransports(false);
      })
      .catch(() => {
        setTransports([]);
        setLoadingTransports(false);
      });
  }, [selectedDestination]);

  // Fetch user's bookings from backend
  const fetchUserBookings = () => {
    api
      .get("/bookings/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        setUserBookings(list);
      })
      .catch((err) => {
        console.error("Error fetching user bookings:", err);
      });
  };

  // Load user bookings on mount
  useEffect(() => {
    fetchUserBookings();
  }, []);

  // Handle booking form submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!selectedDestination || !date || guests < 1) {
      setBookingMessage("Please fill in all required booking details.");
      return;
    }

    const bookingPayload = {
      destination: selectedDestination,
      hotel: selectedHotel || null,
      transport: selectedTransport || null,
      date,
      guests: Number(guests),
    };

    api
      .post("/bookings/", bookingPayload)
      .then(() => {
        setBookingMessage("✅ Booking successful!");
        setSelectedDestination("");
        setSelectedHotel("");
        setSelectedTransport("");
        setDate("");
        setGuests(1);
        setHotels([]);
        setTransports([]);
        fetchUserBookings();

        setTimeout(() => setBookingMessage(""), 4000);
      })
      .catch(() => {
        setBookingMessage("❌ Booking failed. Please try again.");
      });
  };

  // Handle delete booking
  const handleDeleteBooking = (id) => {
    api
      .delete(`/bookings/${id}/`)
      .then(() => fetchUserBookings())
      .catch((err) => console.error("Delete error:", err));
  };

  // Prepare to edit booking
  const prepareUpdate = (booking) => {
    setEditingBooking(booking);
    setEditDate(booking.date);
    setEditGuests(booking.guests);
  };

  // Handle update booking submit
  const handleUpdateBooking = (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    api
      .put(`/bookings/${editingBooking.id}/`, {
        destination: editingBooking.destination,
        hotel: editingBooking.hotel,
        transport: editingBooking.transport,
        date: editDate,
        guests: Number(editGuests),
      })
      .then(() => {
        setEditingBooking(null);
        fetchUserBookings();
      })
      .catch((err) => {
        console.error("Update error:", err);
      });
  };

  return (
    <div className="bookings-container">
      <h2>Book Your Travel Package</h2>

      <form onSubmit={handleBookingSubmit} className="bookings-form">
        <label>
          Select Destination:
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            required
          >
            <option value="">-- Choose a Destination --</option>
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Select Hotel:
          {loadingHotels ? (
            <p>Loading hotels...</p>
          ) : (
            <select
              value={selectedHotel}
              onChange={(e) => setSelectedHotel(e.target.value)}
              disabled={hotels.length === 0}
            >
              <option value="">
                {hotels.length === 0
                  ? "No hotels available for selected destination"
                  : "-- Choose a Hotel --"}
              </option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          )}
        </label>

        <label>
          Select Transport:
          {loadingTransports ? (
            <p>Loading transport options...</p>
          ) : (
            <select
              value={selectedTransport}
              onChange={(e) => setSelectedTransport(e.target.value)}
              disabled={transports.length === 0}
            >
              <option value="">
                {transports.length === 0
                  ? "No transport available for selected destination"
                  : "-- Choose Transport --"}
              </option>
              {transports.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.type} - {t.description}
                </option>
              ))}
            </select>
          )}
        </label>

        <label>
          Date of Travel:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Number of Guests:
          <input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="bookings-submit-btn">
          Book Now
        </button>
      </form>

      {bookingMessage && <p className="bookings-message">{bookingMessage}</p>}

      <hr style={{ margin: "2rem 0" }} />

      <h3>Your Bookings</h3>
      <div className="user-bookings">
        {userBookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          userBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <h4>{booking.destination_detail?.name || "Unknown Destination"}</h4>
              <p>
                <strong>Date:</strong> {booking.date}
              </p>
              <p>
                <strong>Guests:</strong> {booking.guests}
              </p>
              <p>
                <strong>Hotel:</strong> {booking.hotel_detail?.name || "None"}
              </p>
              <p>
                <strong>Transport:</strong> {booking.transport_detail?.type || "None"}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDeleteBooking(booking.id)}
              >
                🗑 Delete
              </button>
              <button className="edit-btn" onClick={() => prepareUpdate(booking)}>
                ✏️ Edit
              </button>
            </div>
          ))
        )}
      </div>

      {editingBooking && (
        <div className="booking-edit-form">
          <h4>Edit Booking</h4>
          <form onSubmit={handleUpdateBooking}>
            <label>
              New Date:
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </label>
            <label>
              Guests:
              <input
                type="number"
                value={editGuests}
                min={1}
                onChange={(e) => setEditGuests(e.target.value)}
                required
              />
            </label>
            <button type="submit">✅ Save</button>
            <button type="button" onClick={() => setEditingBooking(null)}>
              ❌ Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Bookings;
