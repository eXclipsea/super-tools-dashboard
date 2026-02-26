document.addEventListener('DOMContentLoaded', function() {
    const tools = document.querySelectorAll('.tool');
    const quickActions = {
        'scan-receipt': 'quickreceipt',
        'voice-task': 'voicetask',
        'fact-check': 'argument-settler',
        'sync-writing': 'personasync'
    };
    
    // Tool card clicks
    tools.forEach(tool => {
        tool.addEventListener('click', function() {
            const toolName = this.dataset.tool;
            openToolInTab(toolName);
        });
    });
    
    // Quick action buttons
    Object.keys(quickActions).forEach(actionId => {
        const button = document.getElementById(actionId);
        if (button) {
            button.addEventListener('click', function() {
                const toolName = quickActions[actionId];
                openToolInTab(toolName);
            });
        }
    });
});

function openToolInTab(toolName) {
    const url = `https://supertoolz.xyz/${toolName}`;
    chrome.tabs.create({ url: url, active: true });
}

// Track usage analytics
chrome.storage.local.get(['toolUsage'], function(result) {
    const usage = result.toolUsage || {};
    const today = new Date().toDateString();
    
    if (!usage[today]) {
        usage[today] = {};
    }
    
    usage[today].sidepanelOpens = (usage[today].sidepanelOpens || 0) + 1;
    
    chrome.storage.local.set({ toolUsage: usage });
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTool') {
        openToolInTab(request.toolName);
        sendResponse({ success: true });
    }
});
