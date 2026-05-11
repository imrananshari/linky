document.getElementById('download').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    const linkyUrl = `http://localhost:3000/?url=${encodeURIComponent(tab.url)}`;
    chrome.tabs.create({ url: linkyUrl });
  }
});
