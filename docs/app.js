(() => {
  const records = [
    { id: 'ms_demo_01jx8z4r7q9f2k6m0n3p5s8t', recipient: 'alex@example.com', subject: '欢迎加入，开始你的第一封邮件', status: 'delivered', duration: 241, createdAt: '2026-10-28T23:42:18+08:00' },
    { id: 'ms_demo_01jx8y7c2v4b9n5m1k6q0r3s', recipient: 'reader@example.com', subject: '你的每周阅读清单已就绪', status: 'delivered', duration: 318, createdAt: '2026-10-28T21:16:04+08:00' },
    { id: 'ms_demo_01jx8w2a5s7d0f3g6h9j1k4l', recipient: 'team@example.com', subject: '项目动态 · 10 月更新', status: 'pending', duration: null, createdAt: '2026-10-28T18:30:51+08:00' },
    { id: 'ms_demo_01jx8v5z8x1c4v7b0n3m6q9w', recipient: 'morgan@example.com', subject: '请验证你的邮箱地址', status: 'delivered', duration: 186, createdAt: '2026-10-28T16:08:32+08:00' },
    { id: 'ms_demo_01jx8t9e2r5t8y1u4i7o0p3a', recipient: 'notify@example.com', subject: '工作区通知摘要', status: 'failed', duration: 1200, createdAt: '2026-10-28T14:52:46+08:00' },
    { id: 'ms_demo_01jx8s3b6n9m2q5w8e1r4t7y', recipient: 'jordan@example.com', subject: '你的订阅已更新', status: 'delivered', duration: 372, createdAt: '2026-10-28T12:24:10+08:00' },
    { id: 'ms_demo_01jx8q6u9i2o5p8a1s4d7f0g', recipient: 'hello@example.com', subject: 'Hello from MonoSignal', status: 'delivered', duration: 264, createdAt: '2026-10-28T09:45:23+08:00' },
    { id: 'ms_demo_01jx8p0h3j6k9l2z5x8c1v4b', recipient: 'casey@example.com', subject: '欢迎来到你的演示工作区', status: 'delivered', duration: 341, createdAt: '2026-10-28T07:12:06+08:00' }
  ];
  const statuses = {
    delivered: { label: '投递完成', icon: 'circle-check' },
    pending: { label: '处理中', icon: 'clock-3' },
    failed: { label: '投递失败', icon: 'circle-x' }
  };
  const snippets = {
    curl: [
      "curl -X POST 'https://api.example.com/v1/emails' " + "\\",
      "  -H 'Authorization: Bearer YOUR_API_KEY' " + "\\",
      "  -H 'Content-Type: application/json' " + "\\",
      "  -d '{",
      '    "from": "hello@example.com",',
      '    "to": "reader@example.com",',
      '    "subject": "Hello from MonoSignal",',
      '    "html": "<p>A small message. A clear signal.</p>"',
      "  }'"
    ].join('\n'),
    node: `const response = await fetch('https://api.example.com/v1/emails', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'hello@example.com',
    to: 'reader@example.com',
    subject: 'Hello from MonoSignal',
    html: '<p>A small message. A clear signal.</p>',
  }),
});

const result = await response.json();`
  };
  const search = document.querySelector('#log-search');
  const statusFilter = document.querySelector('#status-filter');
  const rows = document.querySelector('#log-rows');
  const canvas = document.querySelector('#activity-chart');
  const detailDialog = document.querySelector('#detail-dialog');
  const testDialog = document.querySelector('#test-dialog');
  const form = document.querySelector('#test-form');
  const email = document.querySelector('#test-email');
  const emailError = document.querySelector('#test-email-error');
  const submit = document.querySelector('#submit-test');
  const focusOrigins = new WeakMap();
  let activeRecord = null;
  let currentCode = 'curl';
  let testTimer = null;
  let toastTimer = null;

  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function formatTime(value) { return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date(value)); }
  function formatDate(value) { return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit' }).format(new Date(value)); }
  function statusMarkup(status) { const item = statuses[status]; return `<span class="status status-${status}"><i data-lucide="${item.icon}" aria-hidden="true"></i>${item.label}</span>`; }

  function showToast(message) {
    const element = document.querySelector('#global-status');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => { element.hidden = true; }, 4200);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* The selectable source remains available when clipboard access fails. */ }
    const field = document.createElement('textarea');
    field.value = text;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;';
    const previous = document.activeElement;
    const host = document.querySelector('dialog[open]') || document.body;
    host.appendChild(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    field.remove();
    if (previous && previous.isConnected) previous.focus();
    return copied;
  }

  function renderMetrics() {
    const delivered = records.filter(record => record.status === 'delivered');
    const average = delivered.length ? Math.round(delivered.reduce((sum, record) => sum + record.duration, 0) / delivered.length) : 0;
    document.querySelector('#metric-total').innerHTML = `${records.length}<span>封</span>`;
    document.querySelector('#metric-rate').innerHTML = `${(delivered.length / records.length * 100).toFixed(1)}<span>%</span>`;
    document.querySelector('#metric-duration').innerHTML = `${average}<span>ms</span>`;
    document.querySelector('#metric-rate-detail').textContent = `${delivered.length} 条完成 / ${records.length} 条请求`;
    document.querySelector('#nav-record-count').textContent = records.length;
    document.querySelector('#table-total').textContent = records.length;
    drawChart();
  }

  function renderRows() {
    const query = search.value.trim().toLocaleLowerCase();
    const status = statusFilter.value;
    const visible = records.filter(record => (status === 'all' || record.status === status) && `${record.recipient} ${record.subject} ${record.id}`.toLocaleLowerCase().includes(query));
    rows.innerHTML = visible.map(record => `<tr data-record="${escapeHtml(record.id)}" tabindex="0" aria-label="查看 ${escapeHtml(record.recipient)} 的投递详情"><td>${statusMarkup(record.status)}</td><td><div class="recipient">${escapeHtml(record.recipient)}</div><div class="subject">${escapeHtml(record.subject)}</div></td><td><span class="record-id" title="${escapeHtml(record.id)}">${escapeHtml(record.id)}</span></td><td class="numeric"><span class="duration">${record.duration === null ? '—' : record.duration + ' ms'}</span></td><td><span class="record-time">${formatTime(record.createdAt)}</span><span class="record-date">${formatDate(record.createdAt)} · 演示</span></td><td><button class="row-detail" type="button" data-detail="${escapeHtml(record.id)}" aria-label="查看 ${escapeHtml(record.recipient)} 的详情" title="投递详情"><i data-lucide="chevron-right"></i></button></td></tr>`).join('');
    document.querySelector('#empty-state').hidden = visible.length !== 0;
    document.querySelector('#result-summary').textContent = `显示 ${visible.length} 条，共 ${records.length} 条记录`;
    document.querySelector('#clear-filters').disabled = query === '' && status === 'all';
    icons();
  }

  function drawChart() {
    const context = canvas.getContext('2d');
    if (!context) return;
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(bounds.width, 1);
    const height = Math.max(bounds.height, 1);
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.scale(scale, scale);
    const buckets = Array.from({ length: 12 }, () => 0);
    records.forEach(record => {
      const hour = (new Date(record.createdAt).getUTCHours() + 8) % 24;
      buckets[Math.floor(hour / 2)] += 1;
    });
    document.querySelector('#chart-summary').textContent = `共 ${records.length} 条本地演示请求。` + buckets.map((count, index) => `${String(index * 2).padStart(2, '0')} 至 ${String(index * 2 + 2).padStart(2, '0')} 时：${count} 条`).join('；');
    const bottom = height - 24;
    const top = 11;
    const plotHeight = bottom - top;
    const maximum = Math.max(2, ...buckets);
    const step = width / buckets.length;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;
    context.strokeStyle = '#2b2b2b';
    [0, .5, 1].forEach(ratio => {
      const y = Math.round(bottom - plotHeight * ratio) + .5;
      context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
    });
    buckets.forEach((count, index) => {
      const barWidth = Math.max(7, Math.min(step - 14, 45));
      const x = index * step + (step - barWidth) / 2;
      const barHeight = count ? Math.max(4, count / maximum * (plotHeight - 8)) : 2;
      context.fillStyle = count ? '#a3aaa6' : '#353735';
      context.fillRect(Math.round(x), bottom - barHeight, Math.round(barWidth), barHeight);
      if (count) {
        context.fillStyle = '#b9b9b9'; context.font = '9px ui-monospace, monospace'; context.textAlign = 'center';
        context.fillText(String(count), x + barWidth / 2, bottom - barHeight - 5);
      }
      if (index % 2 === 0) {
        context.fillStyle = '#858585'; context.font = '9px ui-monospace, monospace'; context.textAlign = 'center';
        context.fillText(`${String(index * 2).padStart(2, '0')}:00`, index * step + step / 2, height - 6);
      }
    });
  }

  function openDialog(dialog, trigger) {
    focusOrigins.set(dialog, trigger || document.activeElement);
    dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    dialog.scrollTop = 0;
    (dialog === testDialog ? email : dialog.querySelector('[data-close-dialog]')).focus();
  }

  function openDetail(id, trigger) {
    const record = records.find(item => item.id === id);
    if (!record) return;
    activeRecord = record;
    const endLabel = record.status === 'delivered' ? '投递完成（模拟）' : record.status === 'failed' ? '投递失败（模拟）' : '等待处理（模拟）';
    const endDetail = record.status === 'delivered' ? '本地演示流程已完成；未发送外部邮件。' : record.status === 'failed' ? '模拟错误：收件端暂时不可用。这不是外部服务器返回的真实结果。' : '演示记录停留在队列中，未连接外部服务。';
    const endClass = record.status === 'delivered' ? 'positive' : record.status === 'failed' ? 'negative' : '';
    const startTime = formatTime(record.createdAt);
    const endTime = record.duration === null ? '—' : formatTime(new Date(new Date(record.createdAt).getTime() + record.duration));
    document.querySelector('#detail-content').innerHTML = `<div class="detail-status-line">${statusMarkup(record.status)}<span>${formatDate(record.createdAt)} · Asia/Shanghai</span></div><dl class="detail-facts"><div><dt>投递 ID</dt><dd><div class="detail-id-row"><span class="detail-id">${escapeHtml(record.id)}</span><button class="icon-button" id="copy-id" type="button" aria-label="复制投递 ID" title="复制 ID"><i data-lucide="copy"></i></button></div><span id="id-copy-feedback" role="status"></span></dd></div><div><dt>收件人</dt><dd>${escapeHtml(record.recipient)}</dd></div><div><dt>主题</dt><dd>${escapeHtml(record.subject)}</dd></div><div><dt>处理耗时</dt><dd>${record.duration === null ? '处理中（演示）' : record.duration + ' ms'}</dd></div></dl><h3 class="timeline-heading">投递时间线</h3><ol class="delivery-timeline"><li><span class="timeline-point completed"></span><div class="timeline-text"><span>本地请求已创建</span><time>${startTime}</time></div><p class="timeline-detail">演示输入已进入当前页面的内存。</p></li><li><span class="timeline-point completed"></span><div class="timeline-text"><span>队列处理（模拟）</span><time>${startTime}</time></div><p class="timeline-detail">验证请求结构，准备本地状态。</p></li><li><span class="timeline-point ${endClass}"></span><div class="timeline-text"><span>${endLabel}</span><time>${endTime}</time></div><p class="timeline-detail">${endDetail}</p></li></ol>`;
    icons();
    openDialog(detailDialog, trigger);
  }

  function resetFilters() { search.value = ''; statusFilter.value = 'all'; renderRows(); }
  search.addEventListener('input', renderRows);
  statusFilter.addEventListener('change', renderRows);
  document.querySelector('#clear-filters').addEventListener('click', resetFilters);
  document.querySelector('#reset-empty').addEventListener('click', () => { resetFilters(); search.focus(); });
  rows.addEventListener('click', event => {
    const row = event.target.closest('[data-record]');
    if (row) openDetail(row.dataset.record, event.target.closest('button') || row);
  });
  rows.addEventListener('keydown', event => {
    if (event.target.tagName === 'TR' && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); openDetail(event.target.dataset.record, event.target);
    }
  });
  document.querySelector('#detail-content').addEventListener('click', async event => {
    if (!event.target.closest('#copy-id') || !activeRecord) return;
    const copied = await copyText(activeRecord.id);
    document.querySelector('#id-copy-feedback').textContent = copied ? 'ID 已复制' : '复制未完成，请手动选择上方 ID。';
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.documentElement.style.overflow = '';
      const trigger = focusOrigins.get(dialog);
      if (trigger && trigger.isConnected) trigger.focus();
    });
  });
  document.querySelector('#open-test-dialog').addEventListener('click', event => {
    emailError.hidden = true; email.removeAttribute('aria-invalid'); openDialog(testDialog, event.currentTarget);
  });
  email.addEventListener('input', () => { emailError.hidden = true; email.removeAttribute('aria-invalid'); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (testTimer) return;
    email.value = email.value.trim();
    if (!email.value || !email.validity.valid) {
      emailError.textContent = email.value ? '请输入有效的邮箱地址，例如 reader@example.com。' : '请输入收件人邮箱。';
      emailError.hidden = false; email.setAttribute('aria-invalid', 'true'); email.focus(); return;
    }
    const recipient = email.value;
    submit.disabled = true;
    submit.querySelector('span').textContent = '正在创建…';
    testTimer = setTimeout(() => {
      testTimer = null;
      const random = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID().replaceAll('-', '') : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      records.unshift({ id: `ms_demo_${random}`, recipient, subject: 'Hello from MonoSignal', status: 'delivered', duration: 260, createdAt: new Date().toISOString() });
      resetFilters(); renderMetrics(); form.reset(); testDialog.close();
      showToast('已创建 1 条本地模拟记录，未发送外部邮件。');
    }, 550);
  });
  testDialog.addEventListener('close', () => {
    if (testTimer) { clearTimeout(testTimer); testTimer = null; }
    submit.disabled = false; submit.querySelector('span').textContent = '创建模拟记录';
  });

  function setCode(language) {
    currentCode = language;
    document.querySelector('#api-code').textContent = snippets[language];
    document.querySelector('#code-panel').setAttribute('aria-labelledby', `tab-${language}`);
    document.querySelector('#code-copy-feedback').textContent = '';
    document.querySelectorAll('[data-code]').forEach(tab => {
      const active = tab.dataset.code === language;
      tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    });
  }
  document.querySelectorAll('[data-code]').forEach(tab => {
    tab.addEventListener('click', () => setCode(tab.dataset.code));
    tab.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        const language = event.key === 'Home' ? 'curl' : event.key === 'End' ? 'node' : currentCode === 'curl' ? 'node' : 'curl';
        setCode(language); document.querySelector(`[data-code="${language}"]`).focus();
      }
    });
  });
  document.querySelector('#copy-code').addEventListener('click', async () => {
    const copied = await copyText(snippets[currentCode]);
    document.querySelector('#code-copy-feedback').textContent = copied ? '已复制' : '请手动选择代码复制';
  });
  document.querySelectorAll('[data-nav]').forEach(link => link.addEventListener('click', () => {
    document.querySelectorAll('[data-nav]').forEach(item => item.classList.toggle('is-active', item === link));
  }));
  const avatar = document.querySelector('.avatar-fallback img');
  avatar.addEventListener('error', () => { avatar.hidden = true; });
  if (avatar.complete && !avatar.naturalWidth) avatar.hidden = true;
  if (window.ResizeObserver) new ResizeObserver(drawChart).observe(canvas);
  else window.addEventListener('resize', drawChart);
  setCode('curl'); renderRows(); renderMetrics(); icons();
})();
