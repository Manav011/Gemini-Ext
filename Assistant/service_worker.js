
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message && message.type == 'updateIcon' && message.iconPath) {
        if (chrome && chrome.action && chrome.action.setIcon) {
            chrome.action.setIcon({ path: message.iconPath });
        }
    }
});