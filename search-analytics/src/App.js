import React, { useState } from 'react';
import axios from 'axios';
import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import './App.css';

const App = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Retrieve tokens from environment variables
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.REACT_APP_REFRESH_TOKEN;

  // Initialize access token from localStorage or environment variable
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('access_token') || process.env.REACT_APP_GOOGLE_ACCESS_TOKEN || ''
  );

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      const errorMsg = 'Missing required environment variables: CLIENT_ID, CLIENT_SECRET, or REFRESH_TOKEN';
      console.error(errorMsg);
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('Client ID:', CLIENT_ID);
    console.log('Client Secret:', CLIENT_SECRET);
    console.log('Refresh Token:', REFRESH_TOKEN);

    try {
      const response = await axios.post(
        'https://www.googleapis.com/auth/webmasters', // Correct endpoint
        {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: REFRESH_TOKEN,
          grant_type: 'refresh_token',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const newAccessToken = response.data.access_token;
      localStorage.setItem('access_token', newAccessToken);
      setAccessToken(newAccessToken);
      console.log('New Access Token:', newAccessToken);
      return newAccessToken;
    } catch (err) {
      const errorDetails = err.response?.data || err.message;
      console.error('Failed to refresh token:', errorDetails);
      setError(`Failed to refresh access token: ${errorDetails.error_description || errorDetails}`);
      throw err;
    }
  };

  const handleFetchData = async (formData) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let currentAccessToken = accessToken;

      // If no access token, try to refresh it
      if (!currentAccessToken) {
        currentAccessToken = await refreshAccessToken();
      }

      const response = await axios.post(
        'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fseoscientist.agency%2F/searchAnalytics/query',
        {
          startDate: formData.startDate,
          endDate: formData.endDate,
          dimensions: formData.dimensions,
        },
        {
          headers: {
            Authorization: `Bearer ${currentAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setResults(response.data.rows || []);
    } catch (err) {
      if (err.response?.status === 401) {
        // Token likely expired, try refreshing it
        try {
          const newAccessToken = await refreshAccessToken();
          // Retry the original request with the new token
          const response = await axios.post(
            'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fseoscientist.agency%2F/searchAnalytics/query',
            {
              startDate: formData.startDate,
              endDate: formData.endDate,
              dimensions: formData.dimensions,
            },
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          setResults(response.data.rows || []);
        } catch (refreshErr) {
          const errorDetails = refreshErr.response?.data || refreshErr.message;
          setError(`Access token expired and could not be refreshed: ${errorDetails.error_description || errorDetails}`);
          console.error('Refresh error:', errorDetails);
        }
      } else if (err.response?.status === 403) {
        setError('Access denied. Ensure your account has permission to access this Search Console property.');
      } else if (err.response?.status === 404) {
        setError('Site not found. Verify the site URL matches a property in Google Search Console.');
      } else {
        const errorDetails = err.response?.data?.error?.message || err.message;
        setError(`Failed to fetch data: ${errorDetails}`);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Search Analytics Dashboard</h1>
      <SearchForm onSubmit={handleFetchData} />
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Fetching data...</div>}
      {results.length > 0 && <ResultsTable results={results} dimensions={results[0]?.keys || []} />}
    </div>
  );
};

export default App;