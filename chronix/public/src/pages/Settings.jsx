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
    console.log('Loading settings from Chrome storage...');
    console.log('Chrome available:', typeof chrome !== 'undefined');
    console.log('Chrome storage available:', typeof chrome !== 'undefined' && chrome.storage);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['chronixSettings'], (result) => {
        console.log('Retrieved settings from Chrome storage:', result);
        if (result.chronixSettings) {
          setSettings({ ...settings, ...result.chronixSettings });
          console.log('Settings loaded from Chrome storage:', { ...settings, ...result.chronixSettings });
        } else {
          console.log('No settings found in Chrome storage, using defaults');
        }
      });
    } else {
      console.log('Chrome storage not available, checking localStorage');
      const saved = localStorage.getItem('chronixSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...settings, ...parsed });
        console.log('Settings loaded from localStorage:', parsed);
      } else {
        console.log('No settings found, using defaults');
      }
    }
  }, []);

  // Apply dark mode when settings load or change
  useEffect(() => {
    console.log('Applying dark mode on settings change:', settings.darkMode);
    document.body.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  // Save settings to Chrome storage
  const saveSettings = (newSettings) => {
    console.log('Saving settings:', newSettings);
    setSettings(newSettings);
    
    // Apply dark mode immediately for quick visual feedback
    if (typeof newSettings.darkMode !== 'undefined') {
      console.log('Applying dark mode:', newSettings.darkMode);
      document.body.classList.toggle('dark', newSettings.darkMode);
    }
    
    // Show saving indicator immediately
    setShowSuccess(true);
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ chronixSettings: newSettings }, () => {
        console.log('Settings saved successfully to Chrome storage');
        if (chrome.runtime.lastError) {
          console.error('Chrome storage error:', chrome.runtime.lastError);
          setShowSuccess(false);
        } else {
          console.log('No errors, settings saved successfully');
          setTimeout(() => setShowSuccess(false), 2000);
        }
      });
    } else {
      console.log('Chrome storage not available - saving to localStorage as fallback');
      localStorage.setItem('chronixSettings', JSON.stringify(newSettings));
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  // Handle toggle changes
  const handleToggle = (key) => {
    console.log('Toggle clicked:', key, 'Current value:', settings[key]);
    console.log('Chrome available:', typeof chrome !== 'undefined');
    console.log('Chrome storage available:', typeof chrome !== 'undefined' && chrome.storage);
    console.log('Current body classes before toggle:', document.body.className);
    
    const newSettings = { ...settings, [key]: !settings[key] };
    console.log('New settings:', newSettings);
    saveSettings(newSettings);
    
    // Extra debug for dark mode
    if (key === 'darkMode') {
      console.log('Dark mode specific debug:');
      console.log('- New dark mode value:', newSettings.darkMode);
      console.log('- Body classes after saveSettings:', document.body.className);
      console.log('- Body has dark class:', document.body.classList.contains('dark'));
    }
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
    <div className="w-full h-auto overflow-y-auto p-1 font-sans text-xs text-gray-900 bg-white">
      {/* Header */}
      <div className="mb-1 flex items-center justify-between sticky top-0 bg-white pb-0.5 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <Link
            to="/home"
            className="inline-flex items-center gap-1 px-1 py-0.5 text-base font-medium text-blue-600 rounded hover:bg-blue-50 transition"
            aria-label="Go back home"
          >
            ⬅️
          </Link>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
        {showSuccess && (
          <span className="text-green-600 text-xs font-bold animate-pulse">✓ Saved!</span>
        )}
      </div>

      <div className="space-y-1">
        {/* Tracking Settings */}
        <section>
          <h2 className="text-base font-semibold mb-1 text-gray-800">⏱️ Tracking</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs">Enable time tracking</label>
              <input
                type="checkbox"
                checked={settings.trackingEnabled}
                onChange={() => handleToggle('trackingEnabled')}
                className="w-3 h-3"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-xs">Auto-start tracking</label>
              <input
                type="checkbox"
                checked={settings.autoStart}
                onChange={() => handleToggle('autoStart')}
                className="w-3 h-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs">Idle threshold (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.idleThreshold}
                onChange={(e) => handleInputChange('idleThreshold', parseInt(e.target.value))}
                className="w-12 px-1 py-0.5 border rounded text-center text-xs"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs">Daily goal (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.dailyGoal}
                onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value))}
                className="w-12 px-1 py-0.5 border rounded text-center text-xs"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h2 className="text-base font-semibold mb-1 text-gray-800">🔔 Notifications</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs">Enable notifications</label>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
                className="w-3 h-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs">Sound alerts</label>
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={() => handleToggle('soundAlerts')}
                className="w-3 h-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs">Break reminders</label>
              <input
                type="checkbox"
                checked={settings.breakReminder}
                onChange={() => handleToggle('breakReminder')}
                className="w-3 h-3"
              />
            </div>

            {settings.breakReminder && (
              <div className="flex items-center justify-between ml-2">
                <label className="text-xs">Break interval (minutes)</label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  value={settings.breakInterval}
                  onChange={(e) => handleInputChange('breakInterval', parseInt(e.target.value))}
                  className="w-12 px-1 py-0.5 border rounded text-center text-xs"
                />
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h2 className="text-base font-semibold mb-1 text-gray-800">🎨 Appearance</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs">Dark mode</label>
              <button
                onClick={() => handleToggle('darkMode')}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 ${
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Manual Test Button */}
            <div className="flex items-center justify-between">
              <label className="text-xs">Manual Test</label>
              <button
                onClick={() => {
                  console.log('Manual dark mode test clicked');
                  const isDark = document.body.classList.contains('dark');
                  console.log('Current body classes:', document.body.className);
                  console.log('Is currently dark:', isDark);
                  document.body.classList.toggle('dark');
                  console.log('After toggle:', document.body.className);
                }}
                className="px-2 py-0.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
              >
                Test Dark
              </button>
            </div>
          </div>
        </section>

        {/* Privacy & Data */}
        <section>
          <h2 className="text-base font-semibold mb-1 text-gray-800">🔒 Privacy & Data</h2>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs">Privacy mode</label>
              <input
                type="checkbox"
                checked={settings.privacyMode}
                onChange={() => handleToggle('privacyMode')}
                className="w-3 h-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs">Sync data across devices</label>
              <input
                type="checkbox"
                checked={settings.syncData}
                onChange={() => handleToggle('syncData')}
                className="w-3 h-3"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs">Data retention (days)</label>
              <select
                value={settings.dataRetention}
                onChange={(e) => handleInputChange('dataRetention', parseInt(e.target.value))}
                className="px-1 py-0.5 border rounded text-xs"
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
          <h2 className="text-base font-semibold mb-1 text-gray-800">🚫 Excluded Sites</h2>
          <div className="space-y-1">
            <div className="flex space-x-1">
              <input
                type="text"
                placeholder="example.com"
                value={newExcludedSite}
                onChange={(e) => setNewExcludedSite(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExcludedSite()}
                className="flex-1 px-1 py-0.5 border rounded text-xs"
              />
              <button
                onClick={addExcludedSite}
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            {settings.excludedSites.length > 0 && (
              <div className="max-h-16 overflow-y-auto">
                {settings.excludedSites.map((site, index) => (
                  <div key={index} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-gray-700">{site}</span>
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
        <section className="pt-1 border-t">
          <button
            onClick={resetToDefaults}
            className="w-full px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-xs"
          >
            Reset to Defaults
          </button>
        </section>
      </div>
    </div>
  );
}
