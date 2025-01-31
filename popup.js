document.getElementById("checkPage").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: checkForDuplicateIds,
  });

  openReport(results[0].result);
});


document.getElementById('highlightButton').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject the content script
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });

  // Send the message after injecting the script
  chrome.tabs.sendMessage(tab.id, { action: 'highlightDuplicates' }, (response) => {
    if (response && response.success) {
      if (response.hasDuplicates) {
        alert('Duplicate IDs found and highlighted!');
      } else {
        alert('No duplicate IDs found.');
      }
    } else {
      alert('Failed to highlight duplicate IDs.');
    }
  });
});

function checkForDuplicateIds() {
  const elements = document.querySelectorAll("[id]");
  const idMap = new Map();
  const duplicates = {};
  const pageInfo = {
    title: document.title,
    url: window.location.href,
    timestamp: new Date().toLocaleString(),
    totalElements: document.getElementsByTagName("*").length,
    totalIds: elements.length,
  };

  function getFullPath(element) {
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
        selector += `#${element.id}`;
      } else if (element.className) {
        selector += `.${Array.from(element.classList).join(".")}`;
      }

      const siblings = element.parentNode
        ? Array.from(element.parentNode.children)
        : [];
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-child(${index})`;
      }

      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(" > ");
  }

  elements.forEach((el) => {
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
        .filter((attr) => attr.name !== "id" && attr.name !== "class")
        .map((attr) => ({ name: attr.name, value: attr.value })),
      innerHTML: el.innerHTML.substring(0, 100),
      textContent: el.textContent.trim().substring(0, 100),
      dimensions: {
        width: el.offsetWidth,
        height: el.offsetHeight,
        x: el.getBoundingClientRect().x,
        y: el.getBoundingClientRect().y,
      },
      styles: {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        display: styles.display,
        position: styles.position,
        visibility: styles.visibility,
      },
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
  <script src="https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.12.0/tsparticles.confetti.bundle.min.js"></script>
 <script src="scripts.js"></script>

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

      .duplicate-item {
      background: var(--card);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--border);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .duplicate-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
      user-select: none;
    }
    
    .duplicate-header:hover {
      background: var(--background);
      border-radius: 8px;
    }
    
    .duplicate-content {
      transition: max-height 0.3s ease-out;
      overflow: hidden;
    }
    
    .duplicate-content.collapsed {
      max-height: 0;
    }
    
    .duplicate-header .toggle-icon {
      margin-right: 1rem;
      transition: transform 0.3s ease;
    }
    
    .duplicate-header .toggle-icon.collapsed {
      transform: rotate(-90deg);
    }
    
    .expand-all-button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      transition: background 0.2s;
    }
    
    .expand-all-button:hover {
      background: var(--secondary);
    }

     .celebration {
      text-align: center;
      padding: 1rem;
      background: var(--card);
      border-radius: 12px;
      margin-top: .5rem;
    }
    
    .celebration-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 1rem;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeIn 1s ease-out forwards;
    }
    
    .celebration-text {
      font-size: 1.25rem;
      color: var(--secondary);
      opacity: 0;
      transform: translateY(20px);
      animation: fadeIn 1s ease-out 0.5s forwards;
    }
    
    @keyframes fadeIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .emoji {
      font-size: 4rem;
      margin: 1rem 0;
      display: inline-block;
      animation: bounce 1s ease infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
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
            <div class="stat-value ${
              Object.keys(data.duplicates).length > 0 ? "warning" : ""
            }">${Object.keys(data.duplicates).length}</div>
          </div>
        </div>
      </div>

    <button class="expand-all-button" onclick="toggleAll()">Expand All</button>

    ${Object.keys(data.duplicates).length === 0 ? `
      <div class="celebration">
        <h2 class="celebration-title">Perfect! No Duplicate IDs Found</h2>
        <div class="emoji">
        <svg height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 366.636 366.636" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <polygon style="fill:#FFB819;" points="7.261,366.636 230.796,262.472 109.313,142.129 "></polygon> <circle style="fill:#FFD26C;" cx="139.46" cy="232.5" r="27.121"></circle> <path style="fill:#FFD26C;" d="M64.791,240.073c7.507,0.439,15.158-2.219,20.866-7.982c10.454-10.552,10.455-27.525,0.076-38.087 L64.791,240.073z"></path> <path style="fill:#FFD26C;" d="M34.985,337.966c-5.319,5.371-7.93,12.403-7.847,19.408l44.797-20.876 C61.238,327.277,45.076,327.78,34.985,337.966z"></path> <path style="fill:#FFD26C;" d="M142.845,283.129c-6.434,6.495-8.903,15.423-7.436,23.792l47.484-22.127 c-0.534-0.634-1.093-1.252-1.693-1.846C170.559,272.407,153.387,272.488,142.845,283.129z"></path> <circle style="fill:#FFD26C;" cx="77.177" cy="286.451" r="27.121"></circle> <polygon style="fill:#004D7A;" points="96.306,170.743 202.305,275.748 230.796,262.472 109.313,142.129 "></polygon> </g> <circle style="fill:#00BCB4;" cx="135" cy="86.679" r="18.497"></circle> <circle style="fill:#00BCB4;" cx="276.53" cy="235.558" r="18.497"></circle> <circle style="fill:#FFB819;" cx="316.74" cy="153.038" r="18.497"></circle> <circle style="fill:#FFB819;" cx="176.102" cy="18.497" r="18.497"></circle> <circle style="fill:#D85C72;" cx="228.315" cy="181.419" r="18.497"></circle> <circle style="fill:#D85C72;" cx="239.536" cy="74.687" r="18.497"></circle> <circle style="fill:#D85C72;" cx="334.385" cy="83.179" r="18.497"></circle> <path style="fill:#00BCB4;" d="M133.624,143.693c-3.767,0-6.819-3.053-6.819-6.819c0-3.766,3.052-6.819,6.819-6.819 c25.377,0,46.024-20.646,46.024-46.024c0-32.898,26.764-59.662,59.662-59.662c32.897,0,59.661,26.764,59.661,59.662 c0,3.766-3.053,6.818-6.818,6.818c-3.765,0-6.818-3.052-6.818-6.818c0-25.378-20.647-46.024-46.024-46.024 c-25.378,0-46.024,20.646-46.024,46.024C193.285,116.929,166.52,143.693,133.624,143.693z"></path> <path style="fill:#FFB819;" d="M312.259,210.037c-25.978,0-47.115-21.136-47.115-47.115c0-18.459-15.019-33.479-33.478-33.479 c-18.46,0-33.479,15.019-33.479,33.479c0,3.766-3.053,6.818-6.817,6.818c-3.767,0-6.819-3.052-6.819-6.818 c0-25.979,21.136-47.115,47.115-47.115c25.979,0,47.115,21.136,47.115,47.115c0,18.46,15.018,33.478,33.478,33.478 s33.478-15.018,33.478-33.478c0-3.766,3.054-6.818,6.82-6.818c3.764,0,6.817,3.052,6.817,6.818 C359.375,188.901,338.239,210.037,312.259,210.037z"></path> </g> </g></svg>
        </div>
        <p class="celebration-text">Your page's ID attributes are unique and well-structured!</p>
      </div>
    ` :     
     Object.entries(data.duplicates).map(([id, elements]) => `
      <div class="duplicate-item">
        <div class="duplicate-header" onclick="toggleCollapse(this)">
          <i class="fas fa-chevron-down toggle-icon"></i>
          <div class="duplicate-id">#${id}</div>
          <div class="duplicate-count">${elements.length} occurrences</div>
        </div>
        <div class="duplicate-content collapsed">
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
      </div>
    `).join('')}
  </div>
  <script>
  function toggleCollapse(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');
    
    content.classList.toggle('collapsed');
    icon.classList.toggle('collapsed');
    
    updateExpandAllButton();
  }
  
  function toggleAll() {
    const button = document.querySelector('.expand-all-button');
    const contents = document.querySelectorAll('.duplicate-content');
    const icons = document.querySelectorAll('.toggle-icon');
    const isExpanding = button.textContent === 'Expand All';
    
    contents.forEach(content => {
      if (isExpanding) {
        content.classList.remove('collapsed');
      } else {
        content.classList.add('collapsed');
      }
    });
    
    icons.forEach(icon => {
      if (isExpanding) {
        icon.classList.remove('collapsed');
      } else {
        icon.classList.add('collapsed');
      }
    });
    
    button.textContent = isExpanding ? 'Collapse All' : 'Expand All';
  }
  
  function updateExpandAllButton() {
    const button = document.querySelector('.expand-all-button');
    const contents = document.querySelectorAll('.duplicate-content');
    const allCollapsed = Array.from(contents).every(content => 
      content.classList.contains('collapsed')
    );
    
    button.textContent = allCollapsed ? 'Expand All' : 'Collapse All';
  }
    </script>
  </body>
  </html>
  `;

  const blob = new Blob([reportHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `DuplicateIdReport.html`;
  a.click();
  // window.open(url, "_blank");
}
