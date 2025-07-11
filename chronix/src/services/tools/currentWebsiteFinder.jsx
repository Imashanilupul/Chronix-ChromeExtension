//Tab info extractor for the current active tab in Chrome
// This function retrieves the domain and favicon of the current active tab in Chrome

getCurrentTabInfo = (callback) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    const tab = tabs[0];
    const url = new URL(tab.url || '');
    const domain = url.hostname;
    const favicon = tab.favIconUrl || "";
    console.log("Current Tab URL:", tab.url);

    callback({ domain, favicon });
  });
}
export default getCurrentTabInfo;

