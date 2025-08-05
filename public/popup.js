document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const widthSlider = document.getElementById('widthSlider');
  const widthValue = document.getElementById('widthValue');
  const status = document.getElementById('status');

  const supportedSites = [
    'chatgpt.com',
    'perplexity.ai', 
    'groq.com',
    'claude.ai',
    'deepseek.com'
  ];

  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function checkSiteSupport() {
    const tab = await getCurrentTab();
    const url = new URL(tab.url);
    const isSupported = supportedSites.some(site => url.hostname.includes(site));
    
    if (isSupported) {
      status.textContent = 'Active on this site';
      status.className = 'status active';
    } else {
      status.textContent = 'Not supported on this site';
      status.className = 'status inactive';
    }
    
    return isSupported;
  }

  async function loadSettings() {
    const result = await chrome.storage.sync.get({
      enabled: true,
      width: 95
    });
    
    enableToggle.classList.toggle('active', result.enabled);
    widthSlider.value = result.width;
    widthValue.textContent = `${result.width}%`;
    
    return result;
  }

  async function saveSettings(settings) {
    await chrome.storage.sync.set(settings);
    
    const tab = await getCurrentTab();
    chrome.tabs.sendMessage(tab.id, {
      action: 'updateSettings',
      settings: settings
    }).catch(() => {
      console.log('Content script not ready, settings will apply on next page load');
    });
  }

  async function injectContentScript() {
    const tab = await getCurrentTab();
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['scripts/content.js']
      });
    } catch (error) {
      console.log('Could not inject content script:', error);
    }
  }

  enableToggle.addEventListener('click', async () => {
    const isEnabled = !enableToggle.classList.contains('active');
    enableToggle.classList.toggle('active', isEnabled);
    
    await saveSettings({ 
      enabled: isEnabled, 
      width: parseInt(widthSlider.value) 
    });
  });

  widthSlider.addEventListener('input', (e) => {
    const width = parseInt(e.target.value);
    widthValue.textContent = `${width}%`;
  });

  widthSlider.addEventListener('change', async (e) => {
    const width = parseInt(e.target.value);
    await saveSettings({ 
      enabled: enableToggle.classList.contains('active'), 
      width: width 
    });
  });

  await checkSiteSupport();
  await loadSettings();
});
