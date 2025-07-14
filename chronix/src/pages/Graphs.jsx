import React, { useState, useEffect } from 'react';
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
  const [usageData, setUsageData] = useState({});
  const [period, setPeriod] = useState('weekly');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [chartData, setChartData] = useState(null);

  // Fetch usage data on mount
  useEffect(() => {
    chrome.storage.local.get(['usage'], (result) => {
      const usage = result.usage || {};
      setUsageData(usage);

      // Auto-select first domain
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
        data.push((usageData[key] && usageData[key][selectedDomain]) || 0);
      }
    } else {
      // Monthly: 4 weekly buckets
      const buckets = [0, 0, 0, 0];
      Object.entries(usageData).forEach(([dateStr, domains]) => {
        const date = new Date(dateStr);
        const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diff / 7);
        if (weekIndex >= 0 && weekIndex < 4) {
          buckets[3 - weekIndex] += domains[selectedDomain] || 0;
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

  // Format time
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const total =
    chartData?.datasets[0].data.reduce((acc, val) => acc + val, 0) || 0;

  const avg = period === 'weekly'
    ? Math.round(total / 7)
    : Math.round(total / 28);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Time (minutes)', color: '#d1d5db' },
        ticks: { color: '#d1d5db' },
        grid: { color: '#374151' },
      },
      x: {
        title: {
          display: true,
          text: period === 'weekly' ? 'Days' : 'Weeks',
          color: '#d1d5db',
        },
        ticks: { color: '#d1d5db' },
        grid: { color: '#374151' },
      },
    },
  };

  return (
    <div className="w-80 h-auto p-4 font-sans text-sm text-white bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">📊 Analytics</h2>
        <Link to="/home" className="text-blue-400 hover:underline text-lg">
          ⬅️
        </Link>
      </div>

      {/* Select Domain */}
      <div className="mb-4">
        <label className="block text-xs mb-1">Select Website:</label>
        <select
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          {Object.keys(
            Object.values(usageData).reduce((acc, cur) => {
              Object.keys(cur).forEach((domain) => (acc[domain] = true));
              return acc;
            }, {})
          ).map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>

      {/* Period Selector */}
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

      {/* Stats */}
      <div className="mb-4 flex space-x-2">
        <div className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-center">
          <div className="text-xs">Total</div>
          <div className="text-lg">{formatTime(total)}</div>
        </div>
        <div className="flex-1 p-2 bg-gray-700 border border-gray-700 rounded text-center">
          <div className="text-xs">Daily Avg</div>
          <div className="text-lg">{formatTime(avg)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-2 rounded border border-gray-700">
        <div className="text-xs mb-1">
          {period === 'weekly' ? 'Last 7 Days' : 'Last 4 Weeks'}
        </div>
        {chartData ? (
          <Bar data={chartData} options={chartOptions} height={180} />
        ) : (
          <p className="text-gray-400 text-xs">Loading chart...</p>
        )}
      </div>
    </div>
  );
}
