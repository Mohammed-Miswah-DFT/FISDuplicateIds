document.getElementById('checkPage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: checkForDuplicateIds,
    });
  
    openReport(results[0].result);
  });
  
  function checkForDuplicateIds() {
    const elements = document.querySelectorAll('[id]');
    const idMap = new Map();
    const duplicates = {};
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      timestamp: new Date().toLocaleString(),
      totalElements: document.getElementsByTagName('*').length,
      totalIds: elements.length
    };
  
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
      
      const styles = window.getComputedStyle(el);
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
        },
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          display: styles.display,
          position: styles.position,
          visibility: styles.visibility
        }
      });
    });
  
    idMap.forEach((elements, id) => {
      if (elements.length > 1) {
        duplicates[id] = elements;
      }
    });
  
    return { duplicates, pageInfo };
  }
  
  function openReport(data) {
    const reportHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Duplicate ID Report</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prismjs/1.29.0/prism.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prismjs/1.29.0/themes/prism.min.css">
    <style>
      :root {
        --primary: #0f172a;
        --secondary: #64748b;
        --accent: #0ea5e9;
        --background: #f8fafc;
        --card: #ffffff;
        --border: #e2e8f0;
        --text: #0f172a;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', system-ui, sans-serif;
        line-height: 1.5;
        color: var(--text);
        background: var(--background);
        padding: 2rem;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
      
      .header {
        background: var(--card);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
        border: 1px solid var(--border);
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .title {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 1rem;
      }
      
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }
      
      .stat-card {
        background: var(--background);
        padding: 1rem;
        border-radius: 8px;
        border: 1px solid var(--border);
      }
      
      .stat-label {
        font-size: 0.875rem;
        color: var(--secondary);
        margin-bottom: 0.5rem;
      }
      
      .stat-value {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary);
      }
      
      .duplicate-item {
        background: var(--card);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        border: 1px solid var(--border);
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .duplicate-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border);
      }
      
      .duplicate-id {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--primary);
        margin-right: 1rem;
      }
      
      .duplicate-count {
        background: var(--accent);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
      }
      
      .instance {
        background: var(--background);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      
      .instance-header {
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--primary);
      }
      
      .instance-detail {
        display: grid;
        grid-template-columns: 120px 1fr;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }
      
      .detail-label {
        color: var(--secondary);
        font-weight: 500;
      }
      
      .detail-value {
        color: var(--text);
        word-break: break-all;
      }
      
      .code {
        font-family: monospace;
        background: var(--primary);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
      }
      
      .warning {
        color: #ef4444;
      }
      
      .pill {
        background: var(--border);
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        margin-right: 0.25rem;
        margin-bottom: 0.25rem;
        display: inline-block;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="title">Duplicate ID Report</h1>
        <div class="instance-detail">
          <span class="detail-label">Page Title:</span>
          <span class="detail-value">${data.pageInfo.title}</span>
        </div>
        <div class="instance-detail">
          <span class="detail-label">URL:</span>
          <span class="detail-value">${data.pageInfo.url}</span>
        </div>
        <div class="instance-detail">
          <span class="detail-label">Generated:</span>
          <span class="detail-value">${data.pageInfo.timestamp}</span>
        </div>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-label">Total Elements</div>
            <div class="stat-value">${data.pageInfo.totalElements}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Elements with IDs</div>
            <div class="stat-value">${data.pageInfo.totalIds}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Duplicate IDs</div>
            <div class="stat-value ${Object.keys(data.duplicates).length > 0 ? 'warning' : ''}">${Object.keys(data.duplicates).length}</div>
          </div>
        </div>
      </div>
  
      ${Object.entries(data.duplicates).map(([id, elements]) => `
        <div class="duplicate-item">
          <div class="duplicate-header">
            <div class="duplicate-id">#${id}</div>
            <div class="duplicate-count">${elements.length} occurrences</div>
          </div>
          ${elements.map((el, index) => `
            <div class="instance">
              <div class="instance-header">Instance ${index + 1}</div>
              <div class="instance-detail">
                <span class="detail-label">Element</span>
                <span class="detail-value"><code class="code">${el.tagName}</code></span>
              </div>
              <div class="instance-detail">
                <span class="detail-label">CSS Path</span>
                <span class="detail-value">${el.cssPath}</span>
              </div>
              ${el.classes.length ? `
                <div class="instance-detail">
                  <span class="detail-label">Classes</span>
                  <span class="detail-value">
                    ${el.classes.map(cls => `<span class="pill">${cls}</span>`).join('')}
                  </span>
                </div>
              ` : ''}
              ${el.attributes.length ? `
                <div class="instance-detail">
                  <span class="detail-label">Attributes</span>
                  <span class="detail-value">
                    ${el.attributes.map(attr => `<span class="pill">${attr.name}="${attr.value}"</span>`).join('')}
                  </span>
                </div>
              ` : ''}
              <div class="instance-detail">
                <span class="detail-label">Position</span>
                <span class="detail-value">x: ${Math.round(el.dimensions.x)}, y: ${Math.round(el.dimensions.y)}</span>
              </div>
              <div class="instance-detail">
                <span class="detail-label">Size</span>
                <span class="detail-value">${el.dimensions.width}×${el.dimensions.height}px</span>
              </div>
              ${el.textContent ? `
                <div class="instance-detail">
                  <span class="detail-label">Content</span>
                  <span class="detail-value">${el.textContent}</span>
                </div>
              ` : ''}
              <div class="instance-detail">
                <span class="detail-label">Visibility</span>
                <span class="detail-value">
                  <span class="pill">display: ${el.styles.display}</span>
                  <span class="pill">visibility: ${el.styles.visibility}</span>
                  <span class="pill">position: ${el.styles.position}</span>
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;
  
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }



// TODO
// 1. Extend this extension to save the report.html
// 2. Implement a function to chose a element and run the duplciate id checker on that element and it's child only