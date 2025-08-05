let currentSettings = { enabled: true, width: 95 };
let styleElement = null;

function createWidenStyle(width) {
  return `
    /* Target all max-width containers */
    [class*="max-w-"]:not([class*="max-w-xs"]):not([class*="max-w-sm"]):not([class*="max-w-none"]):not([class*="max-w-full"]) {
      max-width: ${width}% !important;
    }
    
    /* Target prose containers (ChatGPT output) */
    .prose {
      max-width: ${width}% !important;
    }
    
    /* Target w-fit containers */
    .w-fit {
      width: ${width}% !important;
      max-width: ${width}% !important;
    }
    
    /* Target thread content width CSS variable */
    .min-w-\\(--thread-content-width\\) {
      min-width: ${width}% !important;
    }
  `;
}

function widenChatArea() {
  if (!currentSettings.enabled) {
    if (styleElement) {
      styleElement.remove();
      styleElement = null;
    }
    return;
  }

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'wide-chat-styles';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = createWidenStyle(currentSettings.width);
}

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get({
      enabled: true,
      width: 95
    });
    currentSettings = result;
  } catch (error) {
    console.log('Could not load settings:', error);
  }
}

function observeAndWiden() {
  widenChatArea();
  
  const observer = new MutationObserver((mutations) => {
    let shouldReapply = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasMaxWidth = node.classList && Array.from(node.classList).some(cls => cls.includes('max-w-'));
            const hasMaxWidthChild = node.querySelector && node.querySelector('[class*="max-w-"]');
            const isMainElement = node.tagName === 'MAIN';
            
            if (hasMaxWidth || hasMaxWidthChild || isMainElement) {
              shouldReapply = true;
            }
          }
        });
      }
    });
    
    if (shouldReapply && currentSettings.enabled) {
      setTimeout(widenChatArea, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  const intervalCheck = setInterval(() => {
    if (currentSettings.enabled) {
      widenChatArea();
    }
  }, 2000);
  
  window.addEventListener('beforeunload', () => {
    clearInterval(intervalCheck);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSettings') {
    currentSettings = message.settings;
    widenChatArea();
    sendResponse({ success: true });
  }
});

async function init() {
  await loadSettings();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAndWiden);
  } else {
    observeAndWiden();
  }
}

init();
