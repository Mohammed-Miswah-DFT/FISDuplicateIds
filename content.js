// Function to find duplicate IDs
function findDuplicateIds() {
    const elements = document.querySelectorAll('[id]');
    const idMap = {};
  
    // Track elements with duplicate IDs
    elements.forEach((element) => {
      const id = element.id;
      if (idMap[id]) {
        idMap[id].push(element);
      } else {
        idMap[id] = [element];
      }
    });
  
    // Filter only duplicate IDs
    const duplicates = Object.entries(idMap).filter(([id, elements]) => elements.length > 1);
    return duplicates;
  }
  
  // Function to highlight elements with duplicate IDs
  function highlightDuplicates() {
    const duplicates = findDuplicateIds();
  
    duplicates.forEach(([id, elements]) => {
      elements.forEach((element) => {
        element.style.border = '2px solid red'; // Highlight with a red border
        element.style.backgroundColor = 'yellow'; // Add a background color
      });
    });
  
    return duplicates.length > 0;
  }
  
  // Listen for messages from the extension (e.g., from the popup or background script)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightDuplicates') {
      const hasDuplicates = highlightDuplicates();
      sendResponse({ success: true, hasDuplicates });
    }
  });