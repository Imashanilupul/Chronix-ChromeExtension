import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Graphs() {
  // Sample websites data
  const websites = [
    { domain: "github.com", weekly: [110, 150, 80, 200, 155, 30, 20], monthly: [600, 720, 540, 800] },
    { domain: "stackoverflow.com", weekly: [60, 80, 40, 100, 90, 10, 5], monthly: [300, 350, 200, 400] },
    { domain: "youtube.com", weekly: [90, 120, 70, 160, 120, 20, 10], monthly: [500, 600, 400, 700] },
    { domain: "docs.google.com", weekly: [30, 40, 20, 50, 45, 5, 2], monthly: [100, 120, 80, 150] },
    { domain: "twitter.com", weekly: [20, 30, 10, 40, 25, 2, 1], monthly: [50, 60, 40, 80] },
  ];

  const [period, setPeriod] = useState('weekly');
  const [selectedDomain, setSelectedDomain] = useState(websites[0].domain);

  // Find selected website data
  const selectedWebsite = websites.find(site => site.domain === selectedDomain);

  // Chart data
  const chartData = {
    labels: period === 'weekly'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Time Spent (minutes)',
        data: period === 'weekly' ? selectedWebsite.weekly : selectedWebsite.monthly,
        backgroundColor: period === 'weekly' ? '#3b82f6' : '#f59e42',
        borderColor: period === 'weekly' ? '#1e40af' : '#b45309',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Time (minutes)', color: '#374151' },
        ticks: { color: '#374151' },
        grid: { color: '#d1d5db' },
      },
      x: {
        title: { display: true, text: period === 'weekly' ? 'Days' : 'Weeks', color: '#374151' },
        ticks: { color: '#374151' },
        grid: { color: '#d1d5db' },
      },
    },
  };

  // Calculate stats
  const total = (period === 'weekly'
    ? selectedWebsite.weekly.reduce((a, b) => a + b, 0)
    : selectedWebsite.monthly.reduce((a, b) => a + b, 0)
  );
  const avg = (period === 'weekly'
    ? Math.round(total / 7)
    : Math.round(total / 28)
  );

  // Format time helper
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="w-80 h-auto p-4 font-sans text-sm text-white bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">📊 Analytics</h2>
        <Link to="/home" className="text-blue-400 hover:underline text-lg">⬅️</Link>
      </div>

      {/* Select Website */}
      <div className="mb-4">
        <label className="block text-xs mb-1">Select Website:</label>
        <select
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
          value={selectedDomain}
          onChange={e => setSelectedDomain(e.target.value)}
        >
          {websites.map((site) => (
            <option key={site.domain} value={site.domain}>
              {site.domain}
            </option>
          ))}
        </select>
      </div>

      {/* Time Period Buttons */}
      <div className="mb-4 flex space-x-2">
        <button
          className={`flex-1 p-2 border rounded text-white font-bold ${
            period === 'weekly'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-700 border-gray-700 opacity-60'
          }`}
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
        <button
          className={`flex-1 p-2 border rounded text-white font-bold ${
            period === 'monthly'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-gray-700 border-gray-700 opacity-60'
          }`}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
      </div>

      {/* Time Statistics */}
      <div className="mb-4 flex space-x-2">
        <div className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-center">
          <div className="text-xs">{period === 'weekly' ? 'Total' : 'Total'}</div>
          <div className="text-lg">{formatTime(total)}</div>
        </div>
        <div className="flex-1 p-2 bg-gray-700 border border-gray-700 rounded text-center">
          <div className="text-xs">{period === 'weekly' ? 'Daily Avg' : 'Daily Avg'}</div>
          <div className="text-lg">{formatTime(avg)}</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gray-800 p-2 rounded border border-gray-700">
        <div className="text-xs mb-1">
          {period === 'weekly' ? 'Last 7 Days' : 'Last 4 Weeks'}
        </div>
        <Bar data={chartData} options={chartOptions} height={180} />
      </div>
    </div>
  );
}