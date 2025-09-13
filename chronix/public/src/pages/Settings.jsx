import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  // State for settings
  const [settings, setSettings] = useState({
    trackingEnabled: true,
    autoStart: true,
    idleThreshold: 5,
    notifications: true,
    soundAlerts: false,
    darkMode: false,
    dataRetention: 30,
    excludedSites: [],
    dailyGoal: 8,
    breakReminder: true,
    breakInterval: 60,
    privacyMode: false,
    syncData: true
  });

  const [newExcludedSite, setNewExcludedSite] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Load settings from Chrome storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['chronixSettings'], (result) => {
        if (result.chronixSettings) {
          setSettings({ ...settings, ...result.chronixSettings });
        }
      });
    }
  }, []);

  // Save settings to Chrome storage
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ chronixSettings: newSettings }, () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      });
    }
  };

  // Handle toggle changes
  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  // Handle input changes
  const handleInputChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // Add excluded site
  const addExcludedSite = () => {
    if (newExcludedSite.trim() && !settings.excludedSites.includes(newExcludedSite.trim())) {
      const newSettings = {
        ...settings,
        excludedSites: [...settings.excludedSites, newExcludedSite.trim()]
      };
      saveSettings(newSettings);
      setNewExcludedSite("");
    }
  };

  // Remove excluded site
  const removeExcludedSite = (site) => {
    const newSettings = {
      ...settings,
      excludedSites: settings.excludedSites.filter(s => s !== site)
    };
    saveSettings(newSettings);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaultSettings = {
      trackingEnabled: true,
      autoStart: true,
      idleThreshold: 5,
      notifications: true,
      soundAlerts: false,
      darkMode: false,
      dataRetention: 30,
      excludedSites: [],
      dailyGoal: 8,
      breakReminder: true,
      breakInterval: 60,
      privacyMode: false,
      syncData: true
    };
    saveSettings(defaultSettings);
  };

  return (
    <div className="w-96 max-h-96 overflow-y-auto p-4 font-sans text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between sticky top-0 bg-white pb-2 border-b">
        <div className="flex items-center space-x-2">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-2 py-1 text-lg font-medium text-blue-600 rounded hover:bg-blue-50 transition"
            aria-label="Go back home"
          >
            ⬅️
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        {showSuccess && (
          <span className="text-green-600 text-xs">✓ Saved!</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Tracking Settings */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">⏱️ Tracking</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Enable time tracking</label>
              <input
                type="checkbox"
                checked={settings.trackingEnabled}
                onChange={() => handleToggle('trackingEnabled')}
                className="w-4 h-4"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm">Auto-start tracking</label>
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={() => handleToggle('autoStart')}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Idle threshold (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.idleThreshold}
                onChange={(e) => handleInputChange('idleThreshold', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-center"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Daily goal (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.dailyGoal}
                onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-center"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">🔔 Notifications</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Enable notifications</label>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Sound alerts</label>
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={() => handleToggle('soundAlerts')}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Break reminders</label>
              <input
                type="checkbox"
                checked={settings.breakReminder}
                onChange={() => handleToggle('breakReminder')}
                className="w-4 h-4"
              />
            </div>

            {settings.breakReminder && (
              <div className="flex items-center justify-between ml-4">
                <label className="text-sm">Break interval (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  value={settings.breakInterval}
                  onChange={(e) => handleInputChange('breakInterval', parseInt(e.target.value))}
                  className="w-16 px-2 py-1 border rounded text-center"
                />
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">🎨 Appearance</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Dark mode</label>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
                className="w-4 h-4"
              />
            </div>
          </div>
        </section>

        {/* Privacy & Data */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">🔒 Privacy & Data</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm">Privacy mode</label>
              <input
                type="checkbox"
                checked={settings.privacyMode}
                onChange={() => handleToggle('privacyMode')}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Sync data across devices</label>
              <input
                type="checkbox"
                checked={settings.syncData}
                onChange={() => handleToggle('syncData')}
                className="w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Data retention (days)</label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleInputChange('dataRetention', parseInt(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>1 year</option>
                <option value={-1}>Forever</option>
              </select>
            </div>
          </div>
        </section>

        {/* Excluded Sites */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-gray-800">🚫 Excluded Sites</h2>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="example.com"
                value={newExcludedSite}
                onChange={(e) => setNewExcludedSite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExcludedSite()}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button
                onClick={addExcludedSite}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            {settings.excludedSites.length > 0 && (
              <div className="max-h-20 overflow-y-auto">
                {settings.excludedSites.map((site, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{site}</span>
                    <button
                      onClick={() => removeExcludedSite(site)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Reset Settings */}
        <section className="pt-2 border-t">
          <button
            onClick={resetToDefaults}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Reset to Defaults
          </button>
        </section>
      </div>
    </div>
  );
}
