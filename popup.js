function getPageText() {
  return document.body.innerText;
}

async function getActiveTabText() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
    return { url: null, text: null };
  }

  let results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: getPageText
  });
  return { url: tab.url, text: results[0].result };
}

// Custom word-by-word diff engine
function generateDiff(oldText, newText) {
  const oldWords = oldText.trim().split(/\s+/);
  const newWords = newText.trim().split(/\s+/);
  
  let i = 0, j = 0;
  let htmlResult = [];

  while (i < oldWords.length || j < newWords.length) {
    if (i < oldWords.length && j < newWords.length && oldWords[i] === newWords[j]) {
      htmlResult.push(escapeHtml(oldWords[i]));
      i++;
      j++;
    } else {
      let matchIndex = -1;
      for (let k = i; k < Math.min(i + 8, oldWords.length); k++) {
        if (oldWords[k] === newWords[j]) {
          matchIndex = k;
          break;
        }
      }

      if (matchIndex !== -1) {
        while (i < matchIndex) {
          htmlResult.push(`<span class="del">${escapeHtml(oldWords[i])}</span>`);
          i++;
        }
      } else {
        if (j < newWords.length) {
          htmlResult.push(`<span class="ins">${escapeHtml(newWords[j])}</span>`);
          j++;
        } else if (i < oldWords.length) {
          htmlResult.push(`<span class="del">${escapeHtml(oldWords[i])}</span>`);
          i++;
        }
      }
    }
  }
  return htmlResult.join(" ");
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let activeHistory = [];
let currentLiveText = "";

// Save Button Click
document.getElementById('save-btn').addEventListener('click', async () => {
  const { url, text } = await getActiveTabText();
  const statusDiv = document.getElementById('status');

  if (!url) {
    statusDiv.innerText = "Cannot track this page type.";
    return;
  }

  chrome.storage.local.get([url], (result) => {
    let history = [];
    
    if (result[url] && Array.isArray(result[url])) {
      history = result[url];
    } else if (result[url] && typeof result[url] === 'string') {
      history.push({
        timestamp: "Legacy Save",
        text: result[url]
      });
    }

    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateString = new Date().toLocaleTimeString('en-US', options);

    history.unshift({
      timestamp: dateString,
      text: text
    });

    chrome.storage.local.set({ [url]: history }, () => {
      statusDiv.innerText = `Saved successfully as version: ${dateString}`;
      document.getElementById('result').style.display = "none";
      document.getElementById('history-container').style.display = "none";
    });
  });
});

// Check Changes Button Click
document.getElementById('compare-btn').addEventListener('click', async () => {
  const { url, text: liveText } = await getActiveTabText();
  const statusDiv = document.getElementById('status');
  const resultDiv = document.getElementById('result');
  const historyContainer = document.getElementById('history-container');
  const historySelect = document.getElementById('history-select');

  if (!url) {
    statusDiv.innerText = "Cannot track this page type.";
    return;
  }

  currentLiveText = liveText;

  chrome.storage.local.get([url], (result) => {
    const history = result[url];

    if (!history || history.length === 0) {
      statusDiv.innerText = "No saved version found. Save a version first.";
      resultDiv.style.display = "none";
      historyContainer.style.display = "none";
      return;
    }

    activeHistory = history;

    historySelect.innerHTML = "";
    history.forEach((version, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.innerText = version.timestamp;
      historySelect.appendChild(option);
    });

    historyContainer.style.display = "flex";
    statusDiv.innerText = `Select a snapshot below to compare. Total saved: ${history.length}`;

    runComparison(0);
  });
});

document.getElementById('history-select').addEventListener('change', (e) => {
  const index = e.target.value;
  runComparison(index);
});

function runComparison(index) {
  const selectedVersion = activeHistory[index];
  const diffContent = document.getElementById('diff-content');
  const resultDiv = document.getElementById('result');
  const diffHeader = document.getElementById('diff-header-text');

  if (!selectedVersion) return;

  diffHeader.innerText = `Changes against: ${selectedVersion.timestamp}`;

  if (selectedVersion.text.trim() === currentLiveText.trim()) {
    diffContent.innerHTML = `<span style="color: var(--text-muted);">No changes detected between the live page and this version.</span>`;
  } else {
    const diffHtml = generateDiff(selectedVersion.text, currentLiveText);
    diffContent.innerHTML = diffHtml;
  }

  resultDiv.style.display = "block";
}