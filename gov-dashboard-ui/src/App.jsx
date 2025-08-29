import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '/src/components/Sidebar.jsx';
import DashboardView from '/src/components/DashboardView.jsx';
import PublicFormView from '/src/components/PublicFormView.jsx';

// Corrected the URL to point to your ASP.NET backend
const API_BASE_URL = 'http://localhost:5175/api'; 

function App() {
  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleSearch = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Failed to search applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="flex w-screen h-screen bg-gray-100 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <DashboardView 
                applications={applications} 
                onSearch={handleSearch} 
                onClearSearch={fetchApplications}
                apiBaseUrl={API_BASE_URL}
              />
            } 
          />
          <Route 
            path="/create-form" 
            element={<PublicFormView onFormSubmit={fetchApplications} apiBaseUrl={API_BASE_URL} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;

