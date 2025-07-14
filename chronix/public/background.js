let activeTab = null;
let startTime = Date.now();

function saveTime(domain, timeSpent) {
  chrome.storage.local.get([domain], (result) => {
    const existing = result[domain] || 0;
    chrome.storage.local.set({ [domain]: existing + timeSpent });
  });
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
  if (activeTab?.domain && startTime) {
    const timeSpent = Math.floor((now - startTime) / 1000);
    saveTime(activeTab.domain, timeSpent);
  }

  try {
    const url = new URL(tab.url);
    activeTab = {
      domain: url.hostname,
    };
    startTime = now;
  } catch (e) {
    activeTab = null;
  }
}
