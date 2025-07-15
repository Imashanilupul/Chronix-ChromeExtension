import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {

  const [websites, setWebsites] = useState([]);
  const [hostname, setHostname] = useState("");
  const [activeTabStartTime, setActiveTabStartTime] = useState(null);

  useEffect(() => {
    const updateData = () => {
      chrome.storage.local.get(null, (data) => {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
          if (!tab || !tab.url) return;
          const domain = new URL(tab.url).hostname;
          
          // Read from root level (background script now stores there)
          const formatted = Object.entries(data)
            .filter(([key]) => key !== 'usage') // Skip the nested usage object
            .map(([d, t]) => ({
              domain: d,
              timeSpent: t || 0,
              favicon: `https://${d}/favicon.ico`,
              isActive: d === domain,
            }));

          // Add current domain if not in list
          if (!formatted.find((s) => s.domain === domain)) {
            formatted.unshift({
              domain: domain,
              timeSpent: data[domain] || 0,
              favicon: `https://${domain}/favicon.ico`,
              isActive: true,
            });
          }

          // For the active site, add the current session time to show real-time updates
          const activeIndex = formatted.findIndex(site => site.isActive);
          if (activeIndex !== -1) {
            // Get the current session time from background script
            chrome.runtime.sendMessage({action: "getCurrentSessionTime"}, (response) => {
              if (response && response.currentSessionTime) {
                const updatedFormatted = [...formatted];
                updatedFormatted[activeIndex] = {
                  ...updatedFormatted[activeIndex],
                  timeSpent: updatedFormatted[activeIndex].timeSpent + response.currentSessionTime
                };
                setWebsites(updatedFormatted);
              } else {
                setWebsites(formatted);
              }
            });
          } else {
            setWebsites(formatted);
          }

          setHostname(domain);
        });
      });
    };

    // Initial data fetch
    updateData();

    // Update every 1 second to show real-time changes
    const interval = setInterval(updateData, 1000);

    return () => {
      clearInterval(interval);
    };

 
  }, []);

  const resetAllData = () => {
    chrome.storage.local.clear(() => {
      setWebsites([]);
    });
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
  className="w-full flex items-center justify-center gap-2 py-2 px-4 mb-4 bg-blue-600 text-white text-base font-medium rounded-xl shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
>
  🔄 <span>Reset Data</span>
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
      <div className="h-auto overflow-y-auto mb-3 space-y-2">
        {websites
          .sort((a, b) => b.timeSpent - a.timeSpent)
          .map((site) => (
            <div
              key={site.domain}
              className={`flex justify-between items-center px-2 py-1 rounded-md ${site.isActive ? "bg-blue-100" : "bg-gray-100"
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

        <Link to="/graphs" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 rounded hover:bg-blue-50 hover:underline transition">
          📊 View Graphs
        </Link>
        <Link to="/settings" className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 rounded hover:bg-gray-100 hover:underline transition">
          ⚙️ Settings
        </Link>

      </div>
    </div>
  );
}