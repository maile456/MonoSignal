(() => {
  "use strict";

  const examples = {
    node: {
      file: "send.ts",
      code: "import { MonoSignal } from 'monosignal';\n\nconst mail = new MonoSignal('YOUR_API_KEY');\n\nawait mail.emails.send({\n  from: 'hello@example.com',\n  to: 'reader@example.com',\n  subject: 'Welcome to the good part.',\n  html: '<p>Your next chapter starts here.</p>',\n});"
    },
    python: {
      file: "send.py",
      code: "from monosignal import MonoSignal\n\nmail = MonoSignal(api_key='YOUR_API_KEY')\n\nmail.emails.send({\n    'from': 'hello@example.com',\n    'to': 'reader@example.com',\n    'subject': 'Welcome to the good part.',\n    'html': '<p>Your next chapter starts here.</p>',\n})"
    },
    curl: {
      file: "terminal",
      code: "curl https://api.example.com/v1/emails \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n    \"from\": \"hello@example.com\",\n    \"to\": \"reader@example.com\",\n    \"subject\": \"Welcome to the good part.\",\n    \"html\": \"<p>Your next chapter starts here.</p>\"\n  }'"
    }
  };
  let selected = "node";
  let copyTimer;
  let runTimer;
  let runCount = 0;
  const tabs = [...document.querySelectorAll("[data-code]")];
  const code = document.querySelector("#api-code");
  const panel = document.querySelector("#code-panel");
  const copyStatus = document.querySelector("#copy-status");
  const escape = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  function highlight(source) {
    const parts = source.split(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b(?:import|from|const|await)\b)/g);
    code.innerHTML = parts.map(part => {
      if (/^['"]/.test(part)) return '<span class="code-string">' + escape(part) + "</span>";
      if (/^(import|from|const|await)$/.test(part)) return '<span class="code-keyword">' + part + "</span>";
      return escape(part);
    }).join("");
  }

  function selectTab(key, focus = false) {
    selected = key;
    tabs.forEach(tab => {
      const active = tab.dataset.code === key;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panel.setAttribute("aria-labelledby", "tab-" + key);
    document.querySelector("#code-filename").textContent = examples[key].file;
    highlight(examples[key].code);
    copyStatus.textContent = "";
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.code));
    tab.addEventListener("keydown", event => {
      let index = i;
      if (event.key === "ArrowRight") index = (i + 1) % tabs.length;
      else if (event.key === "ArrowLeft") index = (i + tabs.length - 1) % tabs.length;
      else if (event.key === "Home") index = 0;
      else if (event.key === "End") index = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(tabs[index].dataset.code, true);
    });
  });

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.style.position = "fixed";
    field.style.opacity = "0";
    field.setAttribute("readonly", "");
    document.body.appendChild(field);
    field.select();
    const success = document.execCommand("copy");
    field.remove();
    if (!success) throw new Error("Clipboard access was not granted.");
  }
  document.querySelector("#copy-code").addEventListener("click", async event => {
    clearTimeout(copyTimer);
    try {
      await copyText(examples[selected].code);
      copyStatus.textContent = "Copied";
    } catch {
      copyStatus.textContent = "Select code to copy";
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    event.currentTarget?.focus();
    copyTimer = setTimeout(() => { copyStatus.textContent = ""; }, 2600);
  });

  const runButton = document.querySelector("#run-example");
  const runStatus = document.querySelector("#run-status");
  const response = document.querySelector("#response-code code");
  runButton.addEventListener("click", () => {
    clearTimeout(runTimer);
    runButton.disabled = true;
    runStatus.classList.remove("is-success");
    runStatus.textContent = "Running locally...";
    runTimer = setTimeout(() => {
      runCount += 1;
      response.textContent = JSON.stringify({
        id: "msg_demo_" + String(runCount).padStart(2, "0"),
        status: "accepted",
        mode: "local_demo",
        external_requests: 0
      }, null, 2);
      runStatus.textContent = "200 / Local response";
      runStatus.classList.add("is-success");
      runButton.disabled = false;
    }, 450);
  });

  const menuToggle = document.querySelector("#menu-toggle");
  const nav = document.querySelector("#site-nav");
  function closeMenu() {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
  menuToggle.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => {
    const path = event.composedPath();
    if (!path.includes(menuToggle) && !path.includes(nav)) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);
  selectTab(selected);
  window.lucide?.createIcons();
})();
