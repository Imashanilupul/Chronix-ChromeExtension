import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { forecastNextDay } from '../utils/aiForecast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function Graphs() {

  const [usageData, setUsageData] = useState({});
  const [period, setPeriod] = useState('weekly');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [chartData, setChartData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  // Fetch usage data on mount
  useEffect(() => {
    chrome.storage.local.get(['usage'], (result) => {
      const usage = result.usage || {};
      setUsageData(usage);

      //Auto-select first domain
      const domainsSet = new Set();
      Object.values(usage).forEach((dayData) => {
        Object.keys(dayData).forEach((domain) => domainsSet.add(domain));
      });

      const domainList = Array.from(domainsSet);
      if (domainList.length > 0) {
        setSelectedDomain(domainList[0]);
      }
    });
  }, []);

  // Build chart data based on period + selectedDomain
  useEffect(() => {
    if (!selectedDomain || !usageData) return;

    let labels = [];
    let data = [];

    const today = new Date();

    if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const key = day.toISOString().split('T')[0];
        const label = day.toLocaleDateString('en-US', { weekday: 'short' });

        labels.push(label);
        // Convert seconds to minutes and round
        const timeInSeconds = (usageData[key] && usageData[key][selectedDomain]) || 0;
        data.push(Math.round(timeInSeconds / 60));
      }
    } else {
      // Monthly: 4 weekly buckets
      const buckets = [0, 0, 0, 0];
      
      Object.entries(usageData).forEach(([dateStr, domains]) => {
        const date = new Date(dateStr);
        const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diff / 7);
        
        if (weekIndex >= 0 && weekIndex < 4) {
          // Convert seconds to minutes
          const timeInSeconds = domains[selectedDomain] || 0;
          buckets[3 - weekIndex] += Math.round(timeInSeconds / 60);
        }
      });

      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      data = buckets;
    }

    const dataset = {
      labels,
      datasets: [
        {
          label: 'Time Spent (minutes)',
          data,
          backgroundColor: period === 'weekly' ? '#3b82f6' : '#f59e42',
          borderColor: period === 'weekly' ? '#1e40af' : '#b45309',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
        },
      ],
    };

    setChartData(dataset);
  }, [period, selectedDomain, usageData]);

  // Format time in minutes to human readable
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Load AI forecast
  const loadForecast = async () => {
    setForecastLoading(true);
    try {
      const result = await forecastNextDay();
      setForecastData(result);
      console.log('Forecast result:', result);
    } catch (error) {
      console.error('Forecast error:', error);
      setForecastData({
        success: false,
        error: 'forecast_failed',
        message: error.message
      });
    }
    setForecastLoading(false);
  };

  const total =
    chartData?.datasets[0].data.reduce((acc, val) => acc + val, 0) || 0;

  const avg = period === 'weekly'
    ? Math.round(total / 7)
    : Math.round(total / 28);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${formatTime(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { 
          display: true, 
          text: 'Time (minutes)', 
          color: '#414244ff',
          font: { size: 10 }
        },
        ticks: { 
          color: '#414244ff',
          font: { size: 10 },
          callback: function(value) {
            return formatTime(value);
          }
        },
        grid: { color: '#59606aff' },
      },
      x: {
        title: {
          display: true,
          text: period === 'weekly' ? 'Days' : 'Weeks',
          color: '#414244ff',
          font: { size: 10 }
        },
        ticks: { 
          color: '#414244ff',
          font: { size: 10 }
        },
        grid: { color: '#59606aff' },
      },
    },
  };

  // Get all domains for the dropdown
  const allDomains = Object.keys(
    Object.values(usageData).reduce((acc, cur) => {
      Object.keys(cur).forEach((domain) => (acc[domain] = true));
      return acc;
    }, {})
  );
  return (
    <div className="w-full h-auto p-5 font-sans text-sm text-gray-800 overflow-hidden bg-white">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1 text-gray-900">📊 Analytics</h2>
            <p className="text-sm text-gray-500">Usage Insights & AI Predictions</p>
          </div>
          <div className="text-right">
            <Link to="/home" className="text-blue-600 hover:text-blue-800 text-lg">
              ⬅️
            </Link>
          </div>
        </div>
      </div>

      {/* Select Domain */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Website:</label>
        <select
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          {allDomains.length === 0 ? (
            <option value="">No data available</option>
          ) : (
            allDomains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Period Selector */}
      <div className="mb-6 space-y-3">
        <div className="flex space-x-3">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-base font-medium rounded-xl shadow-md transition duration-200 ease-in-out ${
              period === 'weekly'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setPeriod('weekly')}
          >
            📅 Weekly
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-base font-medium rounded-xl shadow-md transition duration-200 ease-in-out ${
              period === 'monthly'
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setPeriod('monthly')}
          >
            🗓️ Monthly
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 space-y-2">
        <div className="text-base">
          <strong>Total Time ({period}):</strong> <span className="text-blue-600 font-medium">{formatTime(total)}</span>
        </div>
        <div className="text-base">
          <strong>Daily Average:</strong> <span className="text-blue-600 font-medium">{formatTime(avg)}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50">
        <div className="text-sm font-medium text-gray-700 mb-3">
          📊 {period === 'weekly' ? 'Last 7 Days' : 'Last 4 Weeks'} - {selectedDomain}
        </div>
        {chartData && allDomains.length > 0 ? (
          <div style={{ height: '200px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-gray-600 text-sm">
              {allDomains.length === 0 ? 'No data available yet - start browsing to see your analytics!' : 'Loading chart...'}
            </p>
          </div>
        )}
      </div>

      {/* AI Forecast Section */}
      <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded border border-purple-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-purple-800 flex items-center">
            🤖 AI Forecast
          </h3>
          <button
            onClick={() => setShowForecast(!showForecast)}
            className="text-xs text-purple-600 hover:text-purple-800"
          >
            {showForecast ? 'Hide' : 'Show'}
          </button>
        </div>

        {showForecast && (
          <div>
            {!forecastData ? (
              <div className="text-center">
                <button
                  onClick={loadForecast}
                  disabled={forecastLoading}
                  className="px-4 py-2 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {forecastLoading ? '🧠 Training AI...' : '🚀 Predict Tomorrow'}
                </button>
                <p className="text-xs text-gray-600 mt-1">
                  Uses LSTM neural network to predict your total active time tomorrow
                </p>
              </div>
            ) : forecastData.success ? (
              <div>
                <div className="bg-white p-3 rounded border border-purple-100 mb-2">
                  <div className="text-center mb-2">
                    <div className="text-lg font-bold text-purple-700">
                      {formatTime(forecastData.forecast.minutes)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Predicted for {forecastData.nextDate}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Range: {formatTime(forecastData.forecast.confidenceInterval.lower)} - {formatTime(forecastData.forecast.confidenceInterval.upper)}</span>
                    <span>Confidence: {forecastData.forecast.confidence}%</span>
                  </div>

                  <div className="text-xs text-gray-500">
                    Model: {forecastData.model.type || 'LSTM Neural Network'} • 
                    Data: {forecastData.model.trainingSamples || forecastData.dailyData.length} days
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={loadForecast}
                    disabled={forecastLoading}
                    className="flex-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    {forecastLoading ? 'Updating...' : 'Refresh'}
                  </button>
                  <button
                    onClick={() => setForecastData(null)}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 p-2 rounded border border-red-200">
                <div className="text-xs text-red-700 mb-1">
                  ⚠️ {forecastData.message || 'Forecast failed'}
                </div>
                <button
                  onClick={loadForecast}
                  disabled={forecastLoading}
                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}