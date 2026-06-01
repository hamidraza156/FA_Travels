import React from 'react';
import { useNavigate } from "react-router-dom";
import '../styles/Destinations.css';

const destinations = [
  {
    id: 1,
    name: 'Hunza Valley',
    description: 'A stunning mountainous valley in Gilgit-Baltistan, known for its breathtaking views and serene environment.',
    price: 25000,
    image: '/Images/hunza-valley.jpg',
  },
  {
    id: 2,
    name: 'Skardu',
    description: 'Gateway to some of the highest peaks in the world, Skardu is a dream for nature lovers and trekkers.',
    price: 30000,
    image: '/Images/Skardu.jpg',
  },
  {
    id: 3,
    name: 'Murree',
    description: 'Popular hill station near Islamabad, great for a quick getaway with cool weather and scenic views.',
    price: 15000,
    image: '/Images/Murree.jpg',
  },
  {
    id: 4,
    name: 'Faisal Mosque',
    description: "Faisal Mosque is Pakistan's largest mosque, located in Islamabad, and is known for its unique modern architecture and scenic backdrop of the Margalla Hills.",
    price: 15000,
    image: '/Images/Faisal-Mosque.jpg',
  }
  ,
  {
    id: 5,
    name: 'Swat Valley',
    description: "Swat Valley, known as the 'Switzerland of Pakistan' is famous for its lush green landscapes, rivers, and snow-capped mountains. It offers a perfect blend of natural beauty, adventure, and cultural heritage for tourists",
    price: 20000,
    image: '/Images/swat.jpg',
  }
  ,
  {
    id: 6,
    name: 'Badshai Mosque',
    description: "The Badshahi Mosque in Lahore is a majestic example of Mughal architecture, built in 1673 by Emperor Aurangzeb. It is one of the largest mosques in the world and a symbol of Pakistan's rich Islamic heritage.",
    price: 12000,
    image: '/Images/Lahore.jpg',
  }
  ,
  {
    id: 7,
    name: 'Karachi sea-view',
    description: "Karachi Sea View is a popular coastal attraction along Clifton Beach, offering stunning views of the Arabian Sea. It's a favorite spot for families and tourists to relax, enjoy the sea breeze, and experience local street food.",
    price: 10000,
    image: '/Images/Karachi.jpg',
  }
];

const Destinations = () => {
  const navigate = useNavigate();

  return (
    <div className="destination-page">
      <h1>Explore Destinations</h1>
      <div className="destination-grid">
        {destinations.map(dest => (
          <div className="destination-card" key={dest.id}>
            <img src={dest.image} alt={dest.name} />
            <h3>{dest.name}</h3>
            <p>{dest.description}</p>
            <p className="price">PKR {dest.price.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Buttons for navigation */}
      <div className="destination-buttons">
        <button onClick={() => navigate('/suggestions')} className="dest-btn suggestion-btn">
          Get Suggestions
        </button>
        <button onClick={() => navigate('/bookings')} className="dest-btn booking-btn">
          Start Booking
        </button>
      </div>
    </div>
  );
};

export default Destinations;
