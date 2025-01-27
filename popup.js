document.getElementById('checkPage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: checkForDuplicateIds,
    });
  
    displayResults(results[0].result);
  });
  
  function checkForDuplicateIds() {
    const elements = document.querySelectorAll('[id]');
    const idMap = new Map();
    const duplicates = {};
  
    function getFullPath(element) {
      const path = [];
      while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
          selector += `#${element.id}`;
        } else if (element.className) {
          selector += `.${Array.from(element.classList).join('.')}`;
        }
        
        const siblings = element.parentNode ? Array.from(element.parentNode.children) : [];
        if (siblings.length > 1) {
          const index = siblings.indexOf(element) + 1;
          selector += `:nth-child(${index})`;
        }
        
        path.unshift(selector);
        element = element.parentNode;
      }
      return path.join(' > ');
    }
  
    elements.forEach(el => {
      const id = el.id;
      if (!idMap.has(id)) {
        idMap.set(id, []);
      }
      
      idMap.get(id).push({
        tagName: el.tagName.toLowerCase(),
        cssPath: getFullPath(el),
        classes: Array.from(el.classList),
        attributes: Array.from(el.attributes)
          .filter(attr => attr.name !== 'id' && attr.name !== 'class')
          .map(attr => ({name: attr.name, value: attr.value})),
        innerHTML: el.innerHTML.substring(0, 100),
        textContent: el.textContent.trim().substring(0, 100),
        dimensions: {
          width: el.offsetWidth,
          height: el.offsetHeight,
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y
        }
      });
    });
  
    idMap.forEach((elements, id) => {
      if (elements.length > 1) {
        duplicates[id] = elements;
      }
    });
  
    return duplicates;
  }
  
  function displayResults(duplicates) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
  
    if (Object.keys(duplicates).length === 0) {
      resultsDiv.innerHTML = '<p class="no-duplicates">✓ No duplicate IDs found!</p>';
      return;
    }
  
    for (const [id, elements] of Object.entries(duplicates)) {
      const duplicateDiv = document.createElement('div');
      duplicateDiv.className = 'duplicate';
      
      duplicateDiv.innerHTML = `
        <h3>ID: "${id}" (${elements.length} occurrences)</h3>
        ${elements.map((el, index) => `
          <div style="margin-left: 10px; margin-bottom: 10px;">
            <strong>Instance ${index + 1}:</strong><br>
            <strong>Tag:</strong> ${el.tagName}<br>
            <strong>Path:</strong> ${el.cssPath}<br>
            ${el.classes.length ? `<strong>Classes:</strong> ${el.classes.join(', ')}<br>` : ''}
            ${el.textContent ? `<strong>Text:</strong> ${el.textContent}...<br>` : ''}
            <strong>Position:</strong> x: ${Math.round(el.dimensions.x)}, y: ${Math.round(el.dimensions.y)}<br>
            <strong>Size:</strong> ${el.dimensions.width}x${el.dimensions.height}px
          </div>
        `).join('')}
      `;
      
      resultsDiv.appendChild(duplicateDiv);
    }
  }