import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css'; // Make sure to import your CSS file

const App = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/events`)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleGetTickets = (event) => {
    const enteredEmail = prompt('Enter your email to continue:');
    if (!enteredEmail) return;
    
    const eventUrl = event.url || event.link;
    if (!eventUrl) {
      alert('Event URL is missing.');
      return;
    }
    
    // Redirect in same tab instead of popup
    window.location.href = eventUrl;
    
    
    // Backend call
    axios.post(`${process.env.REACT_APP_API_URL}/api/capture-email`, {
      email: enteredEmail,
      eventTitle: event.title,
      eventLink: eventUrl
    })
    .catch(err => console.error('Error saving email:', err));
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Events in Sydney</h1>
      <div className="events-grid">
        {events.map((event, idx) => (
          <div key={idx} className="event-card">
            {event.image && (
              <img 
                src={event.image} 
                alt={event.title} 
                className="event-image"
              />
            )}
            <h3>{event.title}</h3>
            <p className="event-date">{event.date}</p>
            <button onClick={() => handleGetTickets(event)}>
              GET TICKETS
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;



