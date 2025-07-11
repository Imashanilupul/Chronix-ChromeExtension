// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ websites: {} });
});

// When user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.startsWith("http")) {
    const domain = new URL(tab.url).hostname;
    const favicon = tab.favIconUrl || `https://${domain}/favicon.ico`;

    updateWebsiteActivity(domain, favicon);
  }
});

// When user updates a tab (new page load, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && tab.url?.startsWith("http")) {
    const domain = new URL(tab.url).hostname;
    const favicon = tab.favIconUrl || `https://${domain}/favicon.ico`;

    updateWebsiteActivity(domain, favicon);
  }
});

function updateWebsiteActivity(domain, favicon) {
  chrome.storage.local.get("websites", (data) => {
    const sites = data.websites || {};
    const now = Date.now();

    // Mark all as inactive
    for (const key in sites) {
      sites[key].isActive = false;
    }

    // Update or create the active domain
    if (sites[domain]) {
      sites[domain].isActive = true;
    } else {
      sites[domain] = {
        domain,
        favicon,
        timeSpent: 0,
        isActive: true,
      };
    }

    chrome.storage.local.set({ websites: sites });
  });
}

// Timer that runs every second to add time to active site
setInterval(() => {
  chrome.storage.local.get("websites", (data) => {
    const sites = data.websites || {};
    for (const key in sites) {
      if (sites[key].isActive) {
        sites[key].timeSpent += 1;
        break;
      }
    }
    chrome.storage.local.set({ websites: sites });
  });
}, 1000);
