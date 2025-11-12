// Basic frontend: sends message to /api/chat and appends messages
(function () {
  const toggle = document.getElementById('ai-chat-toggle');
  const win = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const form = document.getElementById('ai-chat-form');
  const input = document.getElementById('ai-chat-input');
  const messages = document.getElementById('ai-chat-messages');

  function addMessage(text, who='bot') {
    const div = document.createElement('div');
    div.className = `ai-msg ${who}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  toggle.addEventListener('click', () => {
    const shown = win.getAttribute('aria-hidden') === 'false';
    win.setAttribute('aria-hidden', shown ? 'true' : 'false');
  });
  closeBtn.addEventListener('click', () => win.setAttribute('aria-hidden', 'true'));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    addMessage('Typing...', 'bot'); // temporary

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      // remove last "Typing..." message
      const last = messages.querySelector('.ai-msg.bot:last-child');
      if (last && last.textContent === 'Typing...') last.remove();

      if (res.ok && data?.reply) {
        addMessage(data.reply, 'bot');
      } else {
        addMessage('Sorry, something went wrong. Please try again later.', 'bot');
      }
    } catch (err) {
      // remove last "Typing..."
      const last = messages.querySelector('.ai-msg.bot:last-child');
      if (last && last.textContent === 'Typing...') last.remove();
      addMessage('Network error. Please try again.', 'bot');
      console.error(err);
    }
  });
})();
