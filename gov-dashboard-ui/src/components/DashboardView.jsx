import { useState, useMemo } from 'react';
import { marked } from 'marked';
import { BarChart, Card, Title, Text } from '@tremor/react';


const TriageTag = ({ type, value }) => {
  if (!value) return null;

  const styles = {
    urgency: {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-blue-100 text-blue-800',
    },
    sentiment: {
      Positive: 'bg-green-100 text-green-800',
      Neutral: 'bg-gray-100 text-gray-800',
      Negative: 'bg-orange-100 text-orange-800',
    },
  };

  const style = styles[type]?.[value] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
      {value}
    </span>
  );
};

const getIsoDate = (date) => date.toISOString().split('T')[0];


const DashboardView = ({ applications, onSearch, onClearSearch, apiBaseUrl }) => {

  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(() => getIsoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [endDate, setEndDate] = useState(() => getIsoDate(new Date()));
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [isScanning, setIsScanning] = useState(false);


  const handleSearchClick = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClearClick = () => {
    setQuery('');
    onClearSearch();
    setAnomalies([]);
  };
  
  const handleGenerateReport = async () => {
      setIsGenerating(true);
      setReport('');
      try {
        const response = await fetch(`${apiBaseUrl}/applications/generate-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate, endDate }),
        });
        if (!response.ok) throw new Error('Report generation failed');
        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        console.error('Failed to generate report:', error);
        setReport('Error: Could not generate report.');
      } finally {
        setIsGenerating(false);
      }
    };

    const handleDownloadReport = () => {
        const plainTextReport = report.replace(/##/g, '').replace(/\*/g, '').replace(/###/g, '');
        const blob = new Blob([plainTextReport], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${startDate}-to-${endDate}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleScanAnomalies = async () => {
        setIsScanning(true);
        setAnomalies([]);
        try {
          const response = await fetch(`${apiBaseUrl}/applications/anomalies`);
          if (!response.ok) throw new Error('Anomaly scan failed');
          const data = await response.json();
          setAnomalies(data);
        } catch (error) {
          console.error('Failed to scan for anomalies:', error);
        } finally {
          setIsScanning(false);
        }
    };
  

  const chartData = useMemo(() => {
    if (!applications || applications.length === 0) {
      return { districtData: [], schemeData: [] };
    }
    const districtCounts = {};
    const schemeCounts = {};

    for (const app of applications) {
      districtCounts[app.district] = (districtCounts[app.district] || 0) + 1;
      schemeCounts[app.schemeAppliedFor] = (schemeCounts[app.schemeAppliedFor] || 0) + 1;
    }

    const districtData = Object.entries(districtCounts).map(([name, value]) => ({
      name,
      'Number of Applications': value,
    }));
    
    const schemeData = Object.entries(schemeCounts).map(([name, value]) => ({
      name,
      'Number of Applications': value,
    }));

    return { districtData, schemeData };
  }, [applications]);



  return (
    <div className="p-8 w-full">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">View, manage, and analyze all submitted applications.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-700">AI-Powered Search</h2>
            <div className="flex items-center space-x-2">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., 'south tamilnadu loans'" className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={handleSearchClick} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Search</button>
                <button onClick={handleClearClick} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition">Clear</button>
            </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2 text-gray-700">AI Report Generation</h2>
            <div className="flex items-center space-x-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border border-gray-300 rounded-md"/>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border border-gray-300 rounded-md"/>
                <button onClick={handleGenerateReport} disabled={isGenerating} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition disabled:bg-green-400">
                    {isGenerating ? 'Generating...' : 'Generate Summary'}
                </button>
                {report && <button onClick={handleDownloadReport} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Download</button>}
            </div>
             {report && <div className="mt-4 p-4 bg-gray-50 rounded-lg max-h-48 overflow-y-auto" dangerouslySetInnerHTML={{ __html: marked(report) }} />}
        </div>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Data Visualizations</h2>
        {applications && applications.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <Title>Total Applications</Title>
                <Text className="text-3xl font-bold">{applications.length}</Text>
              </Card>
               <Card>
                <Title>Anomalies Detected</Title>
                <Text className="text-3xl font-bold">{anomalies.length}</Text>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <Card>
                <Title>Applications by District</Title>
                <BarChart
                  className="mt-6"
                  data={chartData.districtData}
                  index="name"
                  categories={['Number of Applications']}
                  colors={['blue']}
                  yAxisWidth={48}
                />
              </Card>
              <Card>
                <Title>Scheme Popularity</Title>
                <BarChart
                  className="mt-6"
                  data={chartData.schemeData}
                  index="name"
                  categories={['Number of Applications']}
                  colors={['teal']}
                  layout="vertical"
                  yAxisWidth={120}
                />
              </Card>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500">No data available to display visualizations.</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">All Applications</h3>
          <button onClick={handleScanAnomalies} disabled={isScanning || !applications || applications.length === 0} className="bg-yellow-500 text-white px-5 py-2 rounded-md hover:bg-yellow-600 transition disabled:bg-yellow-300 disabled:cursor-not-allowed">
            {isScanning ? 'Scanning...' : 'Scan for Anomalies'}
          </button>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-3 w-12"></th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications && applications.length > 0 ? (
                    applications.map((app) => {
                      const anomaly = anomalies.find(a => a.applicationId === app.id);
                      return (
                        <tr key={app.id} className={anomaly ? 'bg-red-50' : ''}>
                          <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-center">
                            {anomaly && (
                              <div className="relative flex items-center justify-center group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                                </svg>
                                <div className="absolute z-10 bottom-full mb-2 w-max max-w-xs p-3 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                  <p className="font-bold">Anomaly Detected:</p>
                                  <p>{anomaly.reason}</p>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.fullName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.district}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <TriageTag type="urgency" value={app.urgency} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <TriageTag type="sentiment" value={app.sentiment} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.schemeAppliedFor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.submissionDate).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                ) : (
                    <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No applications found.</td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;