let activeTab = null;
let startTime = Date.now();
let continuousInterval = null;

// Called when tab is switched or closed
function saveTime(domain, timeSpent) {
  const today = new Date().toISOString().split("T")[0]; // "2025-07-14"

  chrome.storage.local.get(["usage"], (result) => {
    const usage = result.usage || {};
    usage[today] = usage[today] || {};

    if (!usage[today][domain]) usage[today][domain] = 0;
    usage[today][domain] += timeSpent;

    // ALSO store in the root level for the popup to read
    chrome.storage.local.get(null, (allData) => {
      const updatedData = { ...allData };
      updatedData[domain] = usage[today][domain]; // Store current day's time at root level
      updatedData.usage = usage; // Keep the nested structure too
      
      chrome.storage.local.set(updatedData);
    });
  });
}

// NEW: Get current session time without saving it
function getCurrentSessionTime() {
  if (activeTab?.domain && startTime) {
    const now = Date.now();
    return Math.floor((now - startTime) / 1000);
  }
  return 0;
}

// NEW: Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentSessionTime") {
    sendResponse({ currentSessionTime: getCurrentSessionTime() });
  }
});

// NEW: Continuously update storage every second for active tab
function startContinuousTracking() {
  if (continuousInterval) {
    clearInterval(continuousInterval);
  }

  continuousInterval = setInterval(() => {
    if (activeTab?.domain && startTime) {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTime) / 1000);
      
      if (timeSpent > 0) {
        saveTime(activeTab.domain, timeSpent);
        startTime = now; // Reset start time to avoid double counting
      }
    }
  }, 1000); // Update every second
}

function stopContinuousTracking() {
  if (continuousInterval) {
    clearInterval(continuousInterval);
    continuousInterval = null;
  }
}

// Initialize tracking for current active tab
async function initializeTracking() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      handleTabSwitch(tab);
    }
  } catch (error) {
    console.error('Error initializing tracking:', error);
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  handleTabSwitch(tab);
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (tab.active && info.status === "complete") {
    handleTabSwitch(tab);
  }
});

function handleTabSwitch(tab) {
  const now = Date.now();
  
  // Save time for previous tab
  if (activeTab?.domain && startTime) {
    const timeSpent = Math.floor((now - startTime) / 1000);
    if (timeSpent > 0) {
      saveTime(activeTab.domain, timeSpent);
    }
  }

  try {
    const url = new URL(tab.url);
    activeTab = {
      domain: url.hostname,
    };
    startTime = now;
    
    // Start continuous tracking for new tab
    startContinuousTracking();
  } catch (e) {
    activeTab = null;
    stopContinuousTracking();
  }
}

// Handle window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus, stop tracking
    stopContinuousTracking();
  } else {
    // Browser gained focus, resume tracking
    if (activeTab?.domain) {
      startTime = Date.now();
      startContinuousTracking();
    }
  }
});

// Initialize storage for today's domains on startup
chrome.runtime.onStartup.addListener(() => {
  const today = new Date().toISOString().split("T")[0];
  chrome.storage.local.get(["usage"], (result) => {
    const usage = result.usage || {};
    const todayUsage = usage[today] || {};
    
    // Copy today's usage to root level
    chrome.storage.local.set(todayUsage, () => {
      // Start tracking after initialization
      initializeTracking();
    });
  });
});

// Also run on install
chrome.runtime.onInstalled.addListener(() => {
  const today = new Date().toISOString().split("T")[0];
  chrome.storage.local.get(["usage"], (result) => {
    const usage = result.usage || {};
    const todayUsage = usage[today] || {};
    
    // Copy today's usage to root level
    chrome.storage.local.set(todayUsage, () => {
      // Start tracking after initialization
      initializeTracking();
    });
  });
});

// IMPORTANT: Start tracking immediately when service worker starts
// This handles the case when the extension is already installed and browser starts
chrome.runtime.onStartup.addListener(initializeTracking);
chrome.runtime.onInstalled.addListener(initializeTracking);

// Also initialize on service worker startup (when browser starts)
initializeTracking();