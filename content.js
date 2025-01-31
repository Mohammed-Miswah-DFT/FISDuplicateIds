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
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'yellow';
      });
    });
  
    return duplicates.length > 0;
  }


  function highlightByClassName(className) {
    resetHighlights();
    const elements = document.getElementsByClassName(className);
    const count = elements.length;
  
    if (count === 0) return 0;
  
    Array.from(elements).forEach(element => {
    element.style.border = '2px solid red'; // Highlight with a red border
    element.style.backgroundColor = 'yellow'; // Add a background color
    });
  
    return count;
  }
  
  // Message listener update
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightDuplicates') {
      const hasDuplicates = highlightDuplicates();
      sendResponse({ success: true, hasDuplicates });
    }
    else if (request.action === 'highlightByClass') {
      const count = highlightByClassName(request.className);
      sendResponse({ success: true, count });
    }
  });
  
  // Keep existing resetHighlights function
  function resetHighlights() {
    document.querySelectorAll('.duplicate-id-highlight').forEach(element => {
      element.classList.remove('duplicate-id-highlight');
      const badge = element.querySelector('.duplicate-id-badge');
      if (badge) badge.remove();
    });
  }
  
  // Listen for messages from the extension (e.g., from the popup or background script)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightDuplicates') {
      const hasDuplicates = highlightDuplicates();
      sendResponse({ success: true, hasDuplicates });
    }
  });