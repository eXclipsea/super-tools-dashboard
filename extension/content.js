// Content script for Super Tools extension
// Runs on every page to provide quick access to AI tools

(function() {
    'use strict';
    
    // Initialize the extension
    function init() {
        // Don't add floating button - user wants it hidden
        // Extension accessible only through popup and side panel
        console.log('Super Tools extension loaded - use popup or side panel to access tools');
    }
    
    // Start the extension
    init();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'showMenu') {
            // Menu removed - do nothing
            sendResponse({ success: true });
        }
    });
    
})();
