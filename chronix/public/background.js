let activeTab = null;
let startTime = Date.now();
let continuousInterval = null;
let settings = {
  trackingEnabled: true,
  autoStart: true,
  idleThreshold: 5,
  notifications: true,
  soundAlerts: false,
  dataRetention: 30,
  excludedSites: [],
  dailyGoal: 8,
  breakReminder: true,
  breakInterval: 60,
  privacyMode: false,
  syncData: true
};
let lastActivityTime = Date.now();
let isUserIdle = false;

// Load settings from Chrome storage
async function loadSettings() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(['chronixSettings'], (result) => {
        console.log('Background: Loading settings:', result);
        if (result.chronixSettings) {
          settings = { ...settings, ...result.chronixSettings };
          console.log('Background: Settings loaded:', settings);
        } else {
          console.log('Background: No settings found, using defaults');
        }
        resolve(settings);
      });
    } catch (error) {
      console.error('Background: Error loading settings:', error);
      resolve(settings);
    }
  });
}

// Check if a domain should be excluded from tracking
function isExcludedSite(domain) {
  return settings.excludedSites.some(excludedSite => 
    domain.includes(excludedSite) || excludedSite.includes(domain)
  );
}

// Check if user is idle based on threshold
function checkIdleStatus() {
  const now = Date.now();
  const idleThresholdMs = settings.idleThreshold * 60 * 1000; // Convert minutes to milliseconds
  
  if (now - lastActivityTime > idleThresholdMs && !isUserIdle) {
    isUserIdle = true;
    // Stop tracking when user becomes idle
    if (activeTab?.domain) {
      saveCurrentSession();
    }
  } else if (now - lastActivityTime <= idleThresholdMs && isUserIdle) {
    isUserIdle = false;
    // Resume tracking when user becomes active again
    if (activeTab?.domain && settings.trackingEnabled && !isExcludedSite(activeTab.domain)) {
      startTime = now;
    }
  }
}

// Update activity timestamp
function updateActivity() {
  lastActivityTime = Date.now();
}

// Called when tab is switched or closed
function saveTime(domain, timeSpent) {
  // Don't save if tracking is disabled or site is excluded
  if (!settings.trackingEnabled || isExcludedSite(domain) || timeSpent <= 0) {
    return;
  }

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
      
      chrome.storage.local.set(updatedData, () => {
        // Send notification if enabled and daily goal reached
        if (settings.notifications && checkDailyGoal(usage[today])) {
          showDailyGoalNotification();
        }
      });
    });
  });
}

// Save current session without ending it
function saveCurrentSession() {
  if (activeTab?.domain && startTime && !isUserIdle) {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTime) / 1000);
    if (timeSpent > 0) {
      saveTime(activeTab.domain, timeSpent);
      startTime = now; // Reset start time for continuous tracking
    }
  }
}

// Check if daily goal is reached
function checkDailyGoal(todayUsage) {
  const totalHours = Object.values(todayUsage).reduce((acc, seconds) => acc + seconds, 0) / 3600;
  return totalHours >= settings.dailyGoal;
}

// Show daily goal notification
function showDailyGoalNotification() {
  if (chrome.notifications) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Chronix - Daily Goal Reached!',
      message: `You've reached your daily goal of ${settings.dailyGoal} hours!`
    });
  }
}

// Show break reminder notification
function showBreakReminderNotification() {
  console.log('showBreakReminderNotification called');
  console.log('Chrome notifications available:', !!chrome.notifications);
  console.log('Settings - notifications:', settings.notifications);
  console.log('Settings - breakReminder:', settings.breakReminder);
  
  // Send a message to all extension views (popups)
  chrome.runtime.sendMessage({
    type: 'BREAK_REMINDER',
    interval: settings.breakInterval
  });
  console.log('Break reminder message sent to popup');
}

// Break reminder tracking
let breakReminderStartTime = Date.now();
let breakReminderInterval = null;

// Start break reminder timer
function startBreakReminderTimer() {
  if (breakReminderInterval) {
    clearInterval(breakReminderInterval);
  }

  if (settings.breakReminder && settings.notifications) {
    console.log('Starting break reminder timer for', settings.breakInterval, 'minutes');
    console.log('Break reminder enabled:', settings.breakReminder);
    console.log('Notifications enabled:', settings.notifications);
    breakReminderStartTime = Date.now();
    
    // For testing: if break interval is 1 minute, check every 10 seconds and use seconds
    const isTestMode = settings.breakInterval <= 1;
    const checkInterval = isTestMode ? 10000 : 60000; // 10 seconds vs 1 minute
    
    console.log('Test mode:', isTestMode, '- Check interval:', checkInterval / 1000, 'seconds');
    
    let checkCount = 0;
    breakReminderInterval = setInterval(() => {
      const now = Date.now();
      let timeElapsed, targetTime, unit;
      checkCount++;
      if (isTestMode) {
        // Test mode: work in seconds
        timeElapsed = Math.floor((now - breakReminderStartTime) / 1000); // in seconds
        targetTime = settings.breakInterval * 60; // convert minutes to seconds
        unit = 'seconds';
      } else {
        // Normal mode: work in minutes
        timeElapsed = Math.floor((now - breakReminderStartTime) / (1000 * 60)); // in minutes
        targetTime = settings.breakInterval;
        unit = 'minutes';
      }
      console.log(`Break reminder check #${checkCount} - Time elapsed: ${timeElapsed} ${unit}, Target: ${targetTime} ${unit}`);
      if (checkCount === 2) {
        console.log('Force test notification after 20 seconds');
        showBreakReminderNotification();
      }
      if (timeElapsed >= targetTime) {
        console.log('Break reminder triggered! Showing notification...');
        showBreakReminderNotification();
        breakReminderStartTime = now; // Reset timer
      }
    }, checkInterval);
  } else {
    console.log('Break reminder not started - breakReminder:', settings.breakReminder, 'notifications:', settings.notifications);
  }
}

// Stop break reminder timer
function stopBreakReminderTimer() {
  if (breakReminderInterval) {
    clearInterval(breakReminderInterval);
    breakReminderInterval = null;
    console.log('Break reminder timer stopped (stopBreakReminderTimer called)');
  } else {
    console.log('Break reminder timer stop requested, but no timer was running');
  }
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
  } else if (request.action === "getSettings") {
    sendResponse({ settings: settings });
  } else if (request.action === "getTrackingStatus") {
    sendResponse({ 
      isTracking: activeTab !== null && settings.trackingEnabled,
      activeTab: activeTab,
      isIdle: isUserIdle
    });
  }
});

// NEW: Continuously update storage every second for active tab
function startContinuousTracking() {
  if (continuousInterval) {
    clearInterval(continuousInterval);
  }

  continuousInterval = setInterval(() => {
    // Check idle status
    checkIdleStatus();
    
    if (activeTab?.domain && startTime && !isUserIdle && settings.trackingEnabled && !isExcludedSite(activeTab.domain)) {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTime) / 1000);
      
      if (timeSpent >= 1) { // Only update if at least 1 second has passed
        saveTime(activeTab.domain, 1); // Save 1 second increments
        startTime = now; // Reset start time
      }
    }
  }, 1000);

  // Start break reminder timer if enabled
  if (settings.breakReminder) {
    startBreakReminderTimer();
  }
}

function stopContinuousTracking() {
  if (continuousInterval) {
    clearInterval(continuousInterval);
    continuousInterval = null;
  }
  
  // Stop break reminder timer
  stopBreakReminderTimer();
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
  updateActivity(); // Update activity timestamp
  
  // Save time for previous tab
  if (activeTab?.domain && startTime && settings.trackingEnabled && !isExcludedSite(activeTab.domain)) {
    const timeSpent = Math.floor((now - startTime) / 1000);
    if (timeSpent > 0) {
      saveTime(activeTab.domain, timeSpent);
    }
  }

  try {
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    // Only start tracking if enabled and site not excluded
    if (settings.trackingEnabled && !isExcludedSite(domain)) {
      activeTab = { domain };
      startTime = now;
      isUserIdle = false; // Reset idle status on tab switch
      
      // Start continuous tracking for new tab
      startContinuousTracking();
    } else {
      activeTab = null;
      stopContinuousTracking();
    }
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
    chrome.storage.local.set(todayUsage, async () => {
      // Load settings before starting tracking
      await loadSettings();
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
    chrome.storage.local.set(todayUsage, async () => {
      // Load settings before starting tracking
      await loadSettings();
      // Start tracking after initialization
      initializeTracking();
    });
  });
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('Background: Storage changed:', changes, areaName);
  if (areaName === 'sync' && changes.chronixSettings) {
    console.log('Background: Settings changed from:', settings);
    settings = { ...settings, ...changes.chronixSettings.newValue };
    console.log('Background: Settings changed to:', settings);
    
    // If tracking was disabled, stop current tracking
    if (!settings.trackingEnabled) {
      console.log('Background: Tracking disabled, stopping...');
      if (activeTab?.domain && startTime) {
        const now = Date.now();
        const timeSpent = Math.floor((now - startTime) / 1000);
        saveTime(activeTab.domain, timeSpent);
      }
      activeTab = null;
      stopContinuousTracking();
    }
    // If tracking was enabled and auto-start is on, resume tracking
    else if (settings.trackingEnabled && settings.autoStart) {
      console.log('Background: Tracking enabled, resuming...');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          handleTabSwitch(tabs[0]);
        }
      });
    }
  }
});

// Listen for user activity (mouse movement, keyboard input)
chrome.tabs.onActivated.addListener(() => updateActivity());
chrome.tabs.onUpdated.addListener(() => updateActivity());

// IMPORTANT: Start tracking immediately when service worker starts
// This handles the case when the extension is already installed and browser starts
chrome.runtime.onStartup.addListener(initializeTracking);
chrome.runtime.onInstalled.addListener(initializeTracking);

// Also initialize on service worker startup (when browser starts)
initializeTracking();