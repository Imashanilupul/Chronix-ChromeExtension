export const getTimeData = async (site) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([site], (result) => {
      resolve(result[site] || 0);
    });
  });
};
