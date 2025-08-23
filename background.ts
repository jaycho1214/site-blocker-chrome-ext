// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "closeTab" && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id).catch(console.error)
    sendResponse({ success: true })
  }
  return true // Keep the message channel open for async response
})

export {}
