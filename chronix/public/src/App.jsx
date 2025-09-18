import React, { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Graphs from "./pages/Graphs";
import Popup from "./pages/popup";
import Settings from "./pages/Settings";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode setting
  useEffect(() => {
    console.log('App.jsx: Loading dark mode setting...');
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['chronixSettings'], (result) => {
        console.log('App.jsx: Retrieved settings:', result);
        if (result.chronixSettings && typeof result.chronixSettings.darkMode !== 'undefined') {
          console.log('App.jsx: Setting dark mode to:', result.chronixSettings.darkMode);
          setIsDarkMode(result.chronixSettings.darkMode);
          document.body.classList.toggle('dark', result.chronixSettings.darkMode);
        }
      });

      // Listen for settings changes
      const handleStorageChange = (changes, areaName) => {
        console.log('App.jsx: Storage change detected:', areaName, changes);
        if (areaName === 'sync' && changes.chronixSettings) {
          const newSettings = changes.chronixSettings.newValue;
          if (newSettings && typeof newSettings.darkMode !== 'undefined') {
            console.log('App.jsx: Updating dark mode to:', newSettings.darkMode);
            setIsDarkMode(newSettings.darkMode);
            document.body.classList.toggle('dark', newSettings.darkMode);
          }
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);
  
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Popup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/graphs" element={<Graphs />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}