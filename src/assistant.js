import { fallbackAnswer } from '../api/_profile.js';

const GREETING = "Hi! I'm Amar's AI. Ask me about his products (Nexus AI, TrackAmar, Nirvan), his growth results, or why he'd fit your team.";

export function initAssistant({ onEnergy = () => {} } = {}) {
  const panel = document.getElementById('ai-panel');
  const fab = document.querySelector('.ai-fab');
  const msgs = document.getElementById('ai-messages');
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-text');
  const suggest = document.getElementById('ai-suggest');
  const micBtn = document.getElementById('ai-mic');
  const orb = document.getElementById('voice-orb');
  const stateEl = document.getElementById('voice-state');
  const transcriptEl = document.getElementById('voice-transcript');
  const continuousEl = document.getElementById('voice-continuous');
  const stopBtn = document.getElementById('voice-stop');

  const history = [];
  let busy = false;
  let started = false;

  // ---------- panel ----------
  function open(tab = 'chat') {
    panel.hidden = false;
    fab.classList.add('hide');
    if (!started) { addMsg('bot', GREETING); started = true; }
    switchTab(tab);
    if (tab === 'chat') setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    fab.classList.remove('hide');
    stopVoice();
  }
  function switchTab(tab) {
    panel.querySelectorAll('.ai-tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    panel.querySelectorAll('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== tab; });
    if (tab !== 'voice') stopVoice();
  }
  document.querySelectorAll('[data-open-ai]').forEach((b) => b.addEventListener('click', () => open(b.dataset.openAi)));
  panel.querySelector('.ai-close').addEventListener('click', close);
  panel.querySelectorAll('.ai-tabs button').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });

  // ---------- chat ----------
  function addMsg(who, text) {
    const el = document.createElement('div');
    el.className = `msg ${who}`;
    el.textContent = text;
    if (who === 'bot' && 'speechSynthesis' in window) {
      const b = document.createElement('button');
      b.className = 'speak';
      b.type = 'button';
      b.textContent = '🔊 Listen';
      b.addEventListener('click', () => speak(text));
      el.appendChild(document.createElement('br'));
      el.appendChild(b);
    }
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }
  function typing() {
    const el = document.createElement('div');
    el.className = 'msg bot';
    el.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  async function ask(text, mode = 'chat') {
    history.push({ role: 'user', content: text });
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10), mode }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const reply = data.reply || fallbackAnswer(text);
      history.push({ role: 'assistant', content: reply });
      return reply;
    } catch {
      const reply = fallbackAnswer(text);
      history.push({ role: 'assistant', content: reply });
      return reply;
    }
  }

  async function sendChat(text) {
    const q = text.trim();
    if (!q || busy) return;
    busy = true;
    suggest.hidden = true;
    addMsg('user', q);
    input.value = '';
    const t = typing();
    onEnergy(0.35);
    const reply = await ask(q, 'chat');
    t.remove();
    addMsg('bot', reply);
    onEnergy(0);
    busy = false;
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); sendChat(input.value); });
  suggest.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => sendChat(b.textContent)));

  // ---------- speech ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let voice = null;
  const pickVoice = () => {
    const vs = window.speechSynthesis?.getVoices() || [];
    voice = vs.find((v) => /en-IN/i.test(v.lang)) || vs.find((v) => /Google UK English Female|Samantha|Microsoft (Aria|Jenny)/i.test(v.name)) || vs.find((v) => /^en/i.test(v.lang)) || null;
  };
  if ('speechSynthesis' in window) { pickVoice(); window.speechSynthesis.onvoiceschanged = pickVoice; }

  function speak(text, onDone) {
    if (!('speechSynthesis' in window)) { onDone?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[-•*]\s/g, '').replace(/\s+/g, ' '));
    if (voice) u.voice = voice;
    u.rate = 1.02;
    u.pitch = 1;
    let pulse;
    u.onstart = () => {
      pulse = setInterval(() => onEnergy(0.45 + Math.random() * 0.5), 120);
    };
    u.onboundary = () => onEnergy(0.9);
    u.onend = u.onerror = () => { clearInterval(pulse); onEnergy(0); onDone?.(); };
    window.speechSynthesis.speak(u);
  }

  function makeRecognizer() {
    const r = new SR();
    r.lang = 'en-IN';
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.continuous = false;
    return r;
  }

  // Dictation in chat
  if (SR) {
    let dict = null;
    micBtn.addEventListener('click', () => {
      if (dict) { dict.stop(); return; }
      dict = makeRecognizer();
      micBtn.classList.add('live');
      dict.onresult = (e) => {
        const res = [...e.results].map((x) => x[0].transcript).join('');
        input.value = res;
        if (e.results[e.results.length - 1].isFinal) sendChat(res);
      };
      dict.onend = dict.onerror = () => { micBtn.classList.remove('live'); dict = null; };
      dict.start();
    });
  } else {
    micBtn.hidden = true;
  }

  // Voice conversation
  let rec = null;
  let voiceActive = false;
  const setState = (cls, text) => {
    orb.className = `voice-orb ${cls}`;
    stateEl.textContent = text;
  };

  function listen() {
    if (!SR) {
      setState('', 'Voice input needs Chrome, Edge or Safari. You can still type in Chat.');
      return;
    }
    voiceActive = true;
    rec = makeRecognizer();
    let finalText = '';
    setState('listening', 'Listening…');
    onEnergy(0.5);
    rec.onresult = (e) => {
      const text = [...e.results].map((x) => x[0].transcript).join('');
      transcriptEl.textContent = `“${text}”`;
      if (e.results[e.results.length - 1].isFinal) finalText = text;
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setState('', 'Microphone blocked. Allow mic access in your browser and tap again.');
        voiceActive = false;
      }
    };
    rec.onend = async () => {
      rec = null;
      if (!voiceActive) return;
      if (!finalText.trim()) { setState('', 'Tap the orb and ask your question'); onEnergy(0); voiceActive = false; return; }
      setState('thinking', 'Thinking…');
      onEnergy(0.3);
      const reply = await ask(finalText, 'voice');
      if (!voiceActive) return;
      transcriptEl.textContent = reply;
      addMsg('user', finalText);
      addMsg('bot', reply);
      setState('speaking', 'Speaking…');
      speak(reply, () => {
        if (voiceActive && continuousEl.checked) listen();
        else { setState('', 'Tap the orb to ask another question'); voiceActive = false; }
      });
    };
    try { rec.start(); } catch { /* already started */ }
  }

  function stopVoice() {
    voiceActive = false;
    try { rec?.abort(); } catch { /* noop */ }
    rec = null;
    window.speechSynthesis?.cancel();
    onEnergy(0);
    setState('', 'Tap the orb and ask your question');
  }

  orb.addEventListener('click', () => {
    if (voiceActive) { stopVoice(); return; }
    transcriptEl.textContent = '';
    if (!started) { started = true; addMsg('bot', GREETING); }
    listen();
  });
  orb.setAttribute('role', 'button');
  orb.setAttribute('tabindex', '0');
  orb.setAttribute('aria-label', 'Start or stop voice conversation');
  orb.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); orb.click(); } });
  stopBtn.addEventListener('click', stopVoice);
}
