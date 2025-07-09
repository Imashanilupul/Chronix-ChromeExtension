import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [currentTime, setCurrentTime] = useState(0);
  const [websites, setWebsites] = useState([
    {
      domain: "github.com",
      timeSpent: 7245,
      favicon: "https://github.com/favicon.ico",
      isActive: true,
    },
    {
      domain: "stackoverflow.com",
      timeSpent: 3420,
      favicon: "https://stackoverflow.com/favicon.ico",
      isActive: false,
    },
    {
      domain: "youtube.com",
      timeSpent: 5670,
      favicon: "https://youtube.com/favicon.ico",
      isActive: false,
    },
    {
      domain: "docs.google.com",
      timeSpent: 2890,
      favicon: "https://docs.google.com/favicon.ico",
      isActive: false,
    },
    {
      domain: "twitter.com",
      timeSpent: 1245,
      favicon: "https://twitter.com/favicon.ico",
      isActive: false,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
      setWebsites((prev) =>
        prev.map((site) =>
          site.isActive ? { ...site, timeSpent: site.timeSpent + 1 } : site
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetAllData = () => {
    setCurrentTime(0);
    setWebsites((prev) => prev.map((site) => ({ ...site, timeSpent: 0 })));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const totalTime = websites.reduce((acc, site) => acc + site.timeSpent, 0);

  const activeSite = websites.find((site) => site.isActive);

  return (
    <div className="w-80 h-auto p-4 font-sans text-sm text-gray-800 overflow-hidden">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-0">⏱ Chronix</h2>
        <p className="text-xs text-gray-500">Active Time Tracker</p>
      </div>

      {/* Active Website Card */}
      {activeSite && (
        <div className="border border-gray-300 p-3 rounded-md mb-4">
          <div className="flex items-center gap-2">
            <img src={activeSite.favicon} alt="" className="w-4 h-4" />
            <strong>{activeSite.domain}</strong>
          </div>
          <div className="mt-2 text-gray-700">
            Time Spent: {formatTime(activeSite.timeSpent)}
          </div>
        </div>
      )}

      {/* Reset Button */}
      <button
        onClick={resetAllData}
        className="w-full py-1 mb-3 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
      >
        🔄 Reset Data
      </button>

      {/* Stats */}
      <div className="mb-4 space-y-1">
        <div>
          <strong>Total Time Today:</strong> {formatTime(totalTime)}
        </div>
        <div>
          <strong>Sites Visited:</strong> {websites.length}
        </div>
      </div>

      {/* Website List */}
      <div className="h-28 overflow-y-auto mb-3 space-y-2">
        {websites
          .sort((a, b) => b.timeSpent - a.timeSpent)
          .map((site) => (
            <div
              key={site.domain}
              className={`flex justify-between items-center px-2 py-1 rounded-md ${
                site.isActive ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <img src={site.favicon} alt="" className="w-3 h-3" />
                <span className="text-xs">{site.domain}</span>
              </div>
              <span className="text-xs">{formatTime(site.timeSpent)}</span>
            </div>
          ))}
      </div>

      {/* Footer Links */}
      <div className="flex justify-between text-xs text-blue-600">
        <Link to="/graphs" className="hover:underline">📊 View Graphs</Link>
        <Link to="/settings" className="hover:underline">⚙️ Settings</Link>
      </div>
    </div>
  );
}
