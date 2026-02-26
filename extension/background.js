// Background service worker for Super Tools extension

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // First time install
        chrome.storage.local.set({
            installDate: new Date().toISOString(),
            toolUsage: {}
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: 'https://supertoolz.xyz?source=extension_install'
        });
    }
});

// Handle context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'super-tools-menu',
        title: 'Super Tools',
        contexts: ['page', 'selection', 'image']
    });
    
    chrome.contextMenus.create({
        id: 'scan-receipt',
        parentId: 'super-tools-menu',
        title: 'Scan Receipt with QuickReceipt',
        contexts: ['image']
    });
    
    chrome.contextMenus.create({
        id: 'voice-task',
        parentId: 'super-tools-menu',
        title: 'Create Voice Task',
        contexts: ['page', 'selection']
    });
    
    chrome.contextMenus.create({
        id: 'fact-check',
        parentId: 'super-tools-menu',
        title: 'Fact Check Selection',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case 'scan-receipt':
            chrome.tabs.create({
                url: 'https://supertoolz.xyz/quickreceipt'
            });
            break;
        case 'voice-task':
            chrome.tabs.create({
                url: 'https://supertoolz.xyz/voicetask'
            });
            break;
        case 'fact-check':
            const selectedText = info.selectionText;
            chrome.tabs.create({
                url: `https://supertoolz.xyz/argument-settler?text=${encodeURIComponent(selectedText)}`
            });
            break;
    }
});

// Track tool usage
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const url = new URL(tab.url);
        
        if (url.hostname === 'supertoolz.xyz') {
            const pathParts = url.pathname.split('/').filter(Boolean);
            const toolName = pathParts[0];
            
            if (toolName && ['quickreceipt', 'kitchen-commander', 'personasync', 'voicetask', 'argument-settler'].includes(toolName)) {
                trackToolUsage(toolName);
            }
        }
    }
});

function trackToolUsage(toolName) {
    chrome.storage.local.get(['toolUsage'], function(result) {
        const usage = result.toolUsage || {};
        const today = new Date().toDateString();
        
        if (!usage[today]) {
            usage[today] = {};
        }
        
        usage[today][toolName] = (usage[today][toolName] || 0) + 1;
        
        chrome.storage.local.set({ toolUsage: usage });
    });
}
