// client/src/components/EventList.js

import React, { useEffect, useState } from 'react';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Upcoming Events in Sydney</h1>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <h3>{event.title}</h3>
            <img src={event.image} alt={event.title} width="300" />
            <p>{event.date}</p>
            <a href={event.link} target="_blank" rel="noopener noreferrer">
              View Event
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventList;
