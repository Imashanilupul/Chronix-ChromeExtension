import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {

  const [websites, setWebsites] = useState([]);
  const [hostname, setHostname] = useState("");
  const [activeTabStartTime, setActiveTabStartTime] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState({
    isTracking: false,
    activeTab: null,
    isIdle: false
  });
  const [settings, setSettings] = useState({
    trackingEnabled: true,
    excludedSites: []
  });

  useEffect(() => {
    const updateData = () => {
      // Get tracking status
      chrome.runtime.sendMessage({action: "getTrackingStatus"}, (response) => {
        if (response) {
          setTrackingStatus(response);
        }
      });

      // Get settings
      chrome.runtime.sendMessage({action: "getSettings"}, (response) => {
        if (response) {
          setSettings(response.settings);
        }
      });

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

  const toggleTracking = () => {
    const newSettings = { ...settings, trackingEnabled: !settings.trackingEnabled };
    chrome.storage.sync.set({ chronixSettings: newSettings });
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
    <div className="w-full h-auto p-5 font-sans text-sm text-gray-800 overflow-hidden bg-white">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1 text-gray-900">⏱ Chronix</h2>
            <p className="text-sm text-gray-500">Active Time Tracker</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              settings.trackingEnabled && trackingStatus.isTracking 
                ? 'bg-green-100 text-green-700' 
                : settings.trackingEnabled && trackingStatus.isIdle
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                settings.trackingEnabled && trackingStatus.isTracking 
                  ? 'bg-green-500' 
                  : settings.trackingEnabled && trackingStatus.isIdle
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}></div>
              {settings.trackingEnabled && trackingStatus.isTracking 
                ? 'Tracking' 
                : settings.trackingEnabled && trackingStatus.isIdle
                ? 'Idle'
                : 'Disabled'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Active Website Card */}
      {activeSite && (
        <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <img src={activeSite.favicon} alt="" className="w-4 h-4" />
            <strong className="text-base">{activeSite.domain}</strong>
            {settings.excludedSites?.includes(activeSite.domain) && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Excluded</span>
            )}
          </div>
          <div className="text-gray-700">
            Time Spent: <span className="font-medium">{formatTime(activeSite.timeSpent)}</span>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="mb-6 space-y-3">
        <button
          onClick={toggleTracking}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-base font-medium rounded-xl shadow-md transition duration-200 ease-in-out ${
            settings.trackingEnabled 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {settings.trackingEnabled ? '⏸️ Pause Tracking' : '▶️ Start Tracking'}
        </button>
        
        <button
          onClick={resetAllData}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white text-base font-medium rounded-xl shadow-md hover:bg-blue-700 transition duration-200 ease-in-out"
        >
          🔄 <span>Reset Data</span>
        </button>
      </div>


      {/* Stats */}
      <div className="mb-4 space-y-2">
        <div className="text-base">
          <strong>Total Time Today:</strong> <span className="text-blue-600 font-medium">{formatTime(totalTime)}</span>
        </div>
        <div className="text-base">
          <strong>Sites Visited:</strong> <span className="text-blue-600 font-medium">{websites.length}</span>
        </div>
      </div>

      {/* Website List */}
      <div className="max-h-32 overflow-y-auto mb-4 space-y-2">
        {websites
          .sort((a, b) => b.timeSpent - a.timeSpent)
          .map((site) => (
            <div
              key={site.domain}
              className={`flex justify-between items-center px-3 py-2 rounded-lg ${site.isActive ? "bg-blue-100 border border-blue-200" : "bg-gray-100"
                }`}
            >
              <div className="flex items-center gap-2">
                <img src={site.favicon} alt="" className="w-4 h-4" />
                <span className="text-sm font-medium">{site.domain}</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">{formatTime(site.timeSpent)}</span>
            </div>
          ))}
      </div>

      {/* Footer Links */}
      <div className="flex justify-between gap-2 mt-4">
        <Link to="/graphs" className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:underline transition">
          📊 View Graphs
        </Link>
        <Link to="/settings" className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:underline transition">
          ⚙️ Settings
        </Link>
      </div>
    </div>
  );
}