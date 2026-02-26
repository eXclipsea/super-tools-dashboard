// Content script for Super Tools extension
// Runs on every page to provide quick access to AI tools

(function() {
    'use strict';
    
    // Create floating action button
    function createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'super-tools-fab';
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>
            </svg>
        `;
        
        // Style the floating button
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            transition: 'all 0.3s ease',
            opacity: '0.9'
        });
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.opacity = '1';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.opacity = '0.9';
        });
        
        button.addEventListener('click', showToolMenu);
        
        return button;
    }
    
    // Create tool menu
    function showToolMenu() {
        // Remove existing menu if present
        const existingMenu = document.getElementById('super-tools-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.id = 'super-tools-menu';
        menu.innerHTML = `
            <div class="st-menu-header">
                <h3>Super Tools</h3>
                <button class="st-close-btn">&times;</button>
            </div>
            <div class="st-tools">
                <div class="st-tool" data-tool="quickreceipt">
                    <div class="st-tool-icon" style="background: rgba(34, 211, 238, 0.2); color: #22d3ee;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                        </svg>
                    </div>
                    <div class="st-tool-info">
                        <div class="st-tool-name">QuickReceipt</div>
                        <div class="st-tool-desc">Scan receipts instantly</div>
                    </div>
                </div>
                
                <div class="st-tool" data-tool="voicetask">
                    <div class="st-tool-icon" style="background: rgba(167, 139, 250, 0.2); color: #a78bfa;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        </svg>
                    </div>
                    <div class="st-tool-info">
                        <div class="st-tool-name">VoiceTask</div>
                        <div class="st-tool-desc">Voice to task organizer</div>
                    </div>
                </div>
                
                <div class="st-tool" data-tool="argument-settler">
                    <div class="st-tool-icon" style="background: rgba(251, 146, 60, 0.2); color: #fb923c;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        </svg>
                    </div>
                    <div class="st-tool-info">
                        <div class="st-tool-name">Argument Settler</div>
                        <div class="st-tool-desc">AI fact checker</div>
                    </div>
                </div>
                
                <div class="st-tool" data-tool="personasync">
                    <div class="st-tool-icon" style="background: rgba(251, 113, 133, 0.2); color: #fb7185;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div class="st-tool-info">
                        <div class="st-tool-name">PersonaSync</div>
                        <div class="st-tool-desc">AI writing assistant</div>
                    </div>
                </div>
            </div>
            <div class="st-menu-footer">
                <a href="https://supertoolz.xyz" target="_blank">Get full app →</a>
            </div>
        `;
        
        // Style the menu
        Object.assign(menu.style, {
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '320px',
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            zIndex: '10001',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            color: 'white'
        });
        
        // Add menu styles
        const style = document.createElement('style');
        style.textContent = `
            #super-tools-menu .st-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid #333;
            }
            
            #super-tools-menu .st-menu-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            #super-tools-menu .st-close-btn {
                background: none;
                border: none;
                color: #888;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #super-tools-menu .st-close-btn:hover {
                color: white;
            }
            
            #super-tools-menu .st-tools {
                padding: 8px;
            }
            
            #super-tools-menu .st-tool {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            #super-tools-menu .st-tool:hover {
                background: #252525;
            }
            
            #super-tools-menu .st-tool-icon {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            
            #super-tools-menu .st-tool-info {
                flex: 1;
            }
            
            #super-tools-menu .st-tool-name {
                font-weight: 600;
                margin-bottom: 2px;
            }
            
            #super-tools-menu .st-tool-desc {
                font-size: 12px;
                color: #888;
            }
            
            #super-tools-menu .st-menu-footer {
                padding: 12px 16px;
                border-top: 1px solid #333;
                text-align: center;
            }
            
            #super-tools-menu .st-menu-footer a {
                color: #3b82f6;
                text-decoration: none;
                font-size: 13px;
            }
            
            #super-tools-menu .st-menu-footer a:hover {
                text-decoration: underline;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.querySelector('.st-close-btn').addEventListener('click', () => {
            menu.remove();
        });
        
        menu.querySelectorAll('.st-tool').forEach(tool => {
            tool.addEventListener('click', () => {
                const toolName = tool.dataset.tool;
                chrome.tabs.create({ url: `https://supertoolz.xyz/${toolName}` });
                menu.remove();
            });
        });
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target.id !== 'super-tools-fab') {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }
    
    // Initialize the extension
    function init() {
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(addFloatingButton, 1000);
            });
        } else {
            setTimeout(addFloatingButton, 1000);
        }
    }
    
    function addFloatingButton() {
        // Don't add on certain sites
        const blockedSites = ['chrome.google.com', 'addons.mozilla.org'];
        if (blockedSites.some(site => window.location.hostname.includes(site))) {
            return;
        }
        
        // Don't add if already exists
        if (document.getElementById('super-tools-fab')) {
            return;
        }
        
        const button = createFloatingButton();
        document.body.appendChild(button);
    }
    
    // Start the extension
    init();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'showMenu') {
            const button = document.getElementById('super-tools-fab');
            if (button) {
                button.click();
            }
            sendResponse({ success: true });
        }
    });
    
})();
