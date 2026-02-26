document.addEventListener('DOMContentLoaded', function() {
    const tools = document.querySelectorAll('.tool');
    
    tools.forEach(tool => {
        tool.addEventListener('click', function() {
            const toolName = this.dataset.tool;
            openTool(toolName);
        });
    });
});

function openTool(toolName) {
    // Open the tool in a new tab focused on the specific app
    const url = `https://supertoolz.xyz/${toolName}`;
    chrome.tabs.create({ url: url });
}

// Store usage analytics
chrome.storage.local.get(['toolUsage'], function(result) {
    const usage = result.toolUsage || {};
    const today = new Date().toDateString();
    
    if (!usage[today]) {
        usage[today] = {};
    }
    
    // Increment popup open count
    usage[today].popupOpens = (usage[today].popupOpens || 0) + 1;
    
    chrome.storage.local.set({ toolUsage: usage });
});
