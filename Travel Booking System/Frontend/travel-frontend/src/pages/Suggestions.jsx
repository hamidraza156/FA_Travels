import React, { useState } from 'react';
import api from '../api/axios';
import Cookies from 'js-cookie';
import '../styles/Suggestions.css';

const Suggestions = () => {
  const [budget, setBudget] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSuggest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuggestions('');
    setError('');

    const token = Cookies.get('token');
    console.log("Token from cookie:", token); // Debug check

    if (!token) {
      setError('You must be logged in to get suggestions.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        'suggestions/',
        { budget },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      } else {
        setError('No suggestions received from AI.');
      }
    } catch (err) {
      console.error('Suggestion error:', err.response?.data || err.message);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="suggestions-page">
      <h2>Travel Suggestions</h2>
      <form onSubmit={handleSuggest}>
        <input
          type="number"
          placeholder="Enter your budget in PKR"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Get Suggestions'}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {suggestions && (
        <div className="suggestions-output">
          <h3>AI Suggestions:</h3>
          <pre>{suggestions}</pre>
        </div>
      )}
    </div>
  );
};

export default Suggestions;
