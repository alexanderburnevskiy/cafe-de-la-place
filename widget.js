(function() {
  // ============================================================
  // Café de la Place — Embeddable Booking Widget
  // Insérez simplement : <script src="https://votre-domaine.com/widget.js" async></script>
  // ============================================================

  const CONFIG = {
    url: 'https://cmvohltfenbslczgcrou.supabase.co',
    key: 'sb_publishable_rkPoxX_kOsYJJcXbpMLCHg_xr88XaYo',
    phone: '021 943 10 37'
  };

  const SLOTS = {
    midi: ['11:45','12:00','12:15','12:30','13:00'],
    soir: ['18:30','19:00','19:30','20:00','20:30'],
  };
  const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  const state = { guests: null, date: null, service: null, time: null, zone: 'interieur' };
  let calYear, calMonth;

  // 1. Inject Fonts & Styles
  if (!document.getElementById('cdp-fonts')) {
    const link = document.createElement('link');
    link.id = 'cdp-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  const css = `
    .cdp-modal-overlay {
      position: fixed; inset: 0; background: rgba(28, 22, 18, 0.68);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999; opacity: 0; pointer-events: none;
      transition: opacity 0.28s ease; font-family: 'Inter', -apple-system, sans-serif;
    }
    .cdp-modal-overlay.open { opacity: 1; pointer-events: auto; }
    .cdp-modal-box {
      background: #fdfbf7; border-radius: 1.5rem; max-width: 440px; width: 92%;
      max-height: 90vh; overflow-y: auto; padding: 1.75rem; position: relative;
      box-shadow: 0 32px 80px rgba(28,22,18,0.28); transform: translateY(16px);
      transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); color: #2c2520; font-size: 14px;
    }
    .cdp-modal-overlay.open .cdp-modal-box { transform: translateY(0); }
    .cdp-serif { font-family: 'DM Serif Display', Georgia, serif; }

    .cdp-close-btn {
      position: absolute; top: 1.25rem; right: 1.25rem; background: transparent;
      border: none; font-size: 1.4rem; cursor: pointer; color: #9c8c7c; line-height: 1;
      transition: color 0.15s;
    }
    .cdp-close-btn:hover { color: #2c2520; }
    .cdp-step { display: none; }
    .cdp-step.active { display: block; }

    .cdp-prog-bar { height: 2px; flex: 1; border-radius: 2px; background: rgba(92,79,68,0.15); transition: background 0.35s; }
    .cdp-prog-bar.done { background: #2c2520; }

    .cdp-grid-guests { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 1rem; }
    .cdp-tile {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      border-radius: 12px; border: 1.5px solid rgba(92,79,68,0.2); background: #fdfbf7;
      font-size: 1.25rem; font-weight: 500; cursor: pointer; color: #2c2520;
      transition: all 0.16s ease;
    }
    .cdp-tile:hover { border-color: #8b5c2a; color: #8b5c2a; transform: translateY(-2px); }
    .cdp-tile.selected { background: #2c2520; border-color: #2c2520; color: #fdfbf7; transform: scale(1.03); }
    .cdp-tile-plus {
      grid-column: span 4; aspect-ratio: auto; padding: 12px; font-size: 0.85rem; font-weight: 600;
    }

    .cdp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; text-align: center; margin: 10px 0; }
    .cdp-day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      border-radius: 8px; border: 1.5px solid transparent; background: transparent;
      cursor: pointer; font-size: 0.8rem; font-weight: 500; color: #2c2520;
    }
    .cdp-day:not(.disabled):not(.past):hover { background: #f5f0e8; }
    .cdp-day.selected { background: #2c2520; color: #fdfbf7; }
    .cdp-day.disabled, .cdp-day.past { color: rgba(92,79,68,0.25); cursor: not-allowed; }
    .cdp-day.today { border-color: #8b5c2a; font-weight: 700; }

    .cdp-svc-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
    .cdp-svc-tab {
      flex: 1; padding: 12px; border-radius: 12px; border: 1.5px solid rgba(92,79,68,0.2);
      background: #fdfbf7; font-weight: 600; cursor: pointer; text-align: center; color: #5c4f44;
      font-size: 0.82rem; transition: all 0.16s;
    }
    .cdp-svc-tab.selected { background: #2c2520; border-color: #2c2520; color: #fdfbf7; }

    .cdp-zone-btn {
      padding: 10px; border-radius: 10px; border: 1.5px solid rgba(92,79,68,0.2);
      background: #fff; cursor: pointer; text-align: left; transition: all 0.15s; font-family: inherit;
    }
    .cdp-zone-btn:hover { border-color: #2c2520; }
    .cdp-zone-btn.selected { border-color: #8b5c2a; background: #fdf8f2; }

    .cdp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .cdp-chip {
      padding: 7px 15px; border-radius: 9999px; border: 1.5px solid rgba(92,79,68,0.2);
      background: #fdfbf7; font-weight: 500; font-size: 0.85rem; cursor: pointer; color: #5c4f44;
      transition: all 0.15s;
    }
    .cdp-chip:hover { border-color: #2c2520; color: #2c2520; }
    .cdp-chip.selected { background: #2c2520; border-color: #2c2520; color: #fdfbf7; }

    .cdp-field { margin-bottom: 12px; }
    .cdp-field label { display: block; font-weight: 600; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase; color: #5c4f44; margin-bottom: 4px; }
    .cdp-field input {
      width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid rgba(92,79,68,0.2);
      font-size: 0.9rem; outline: none; box-sizing: border-box; background: #fff; color: #2c2520;
      font-family: inherit; transition: border-color 0.15s;
    }
    .cdp-field input:focus { border-color: #2c2520; }
    .cdp-field input.error { border-color: #c0392b; }
    .cdp-field-error { font-size: 0.7rem; color: #c0392b; margin-top: 3px; display: none; }
    .cdp-field-error.show { display: block; }

    .cdp-btn-submit {
      width: 100%; padding: 14px; border-radius: 9999px; background: #2c2520; color: #fdfbf7;
      border: none; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
      cursor: pointer; transition: background 0.18s, transform 0.18s; box-shadow: 0 4px 16px rgba(44,37,32,0.15);
    }
    .cdp-btn-submit:hover { background: #8b5c2a; transform: translateY(-1px); }
    .cdp-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

    .cdp-floating-trigger {
      position: fixed; bottom: 24px; right: 24px; z-index: 999990;
      background: #2c2520; color: #fdfbf7; padding: 14px 24px; border-radius: 9999px;
      font-weight: 600; font-size: 0.85rem; letter-spacing: 0.04em; text-transform: uppercase;
      border: none; cursor: pointer; box-shadow: 0 10px 30px rgba(44,37,32,0.3);
      display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif;
      transition: transform 0.2s, background 0.2s;
    }
    .cdp-floating-trigger:hover { background: #8b5c2a; transform: translateY(-2px); }

    .cdp-sugg-btn {
      width: 100%; display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px; border-radius: 12px; border: 1.5px solid rgba(92,79,68,0.18);
      background: #f5f0e8; cursor: pointer; transition: all 0.16s ease; text-align: left;
      font-family: inherit; margin-bottom: 6px;
    }
    .cdp-sugg-btn:hover { background: #ede6d6; border-color: #2c2520; transform: translateY(-1px); }
    .cdp-sugg-btn.primary-sugg { background: #f7ede0; border-color: rgba(139,92,42,0.35); }
    .cdp-sugg-btn.primary-sugg:hover { background: #f0e0ca; border-color: #8b5c2a; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // 2. Inject Modal HTML
  const modalHTML = `
    <div class="cdp-modal-overlay" id="cdpModal">
      <div class="cdp-modal-box">
        <button class="cdp-close-btn" id="cdpClose">×</button>

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
          <img src="assets/logo.png" alt="Café de la Place" style="height:28px;width:auto;object-fit:contain;filter:brightness(0);opacity:0.88;" />
          <span class="cdp-serif" style="font-size:1.15rem;color:#2c2520;">Café de la Place</span>
        </div>

        <div style="display:flex;gap:4px;margin-bottom:20px;" id="cdpProgress">
          <div class="cdp-prog-bar done" id="cdpBar1"></div>
          <div class="cdp-prog-bar" id="cdpBar2"></div>
          <div class="cdp-prog-bar" id="cdpBar3"></div>
          <div class="cdp-prog-bar" id="cdpBar4"></div>
        </div>

        <!-- Step 1: Guests -->
        <div class="cdp-step active" id="cdpStep1">
          <p style="font-size:10px;font-weight:700;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px 0;">Étape 1 / 4</p>
          <h3 class="cdp-serif" style="font-size:1.6rem;margin:0 0 1rem 0;color:#2c2520;">Combien de personnes ?</h3>
          <div class="cdp-grid-guests" id="cdpGuestGrid"></div>
        </div>

        <!-- Step 2: Date -->
        <div class="cdp-step" id="cdpStep2">
          <button style="background:none;border:none;color:#9c8c7c;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;padding:0;margin-bottom:10px;" id="cdpBack1">‹ Retour</button>
          <p style="font-size:10px;font-weight:700;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px 0;">Étape 2 / 4</p>
          <h3 class="cdp-serif" style="font-size:1.6rem;margin:0 0 10px 0;color:#2c2520;">Quelle date ?</h3>

          <div id="cdpSuggestionsBox"></div>

          <div style="display:flex;align-items:center;gap:8px;margin:12px 0 10px 0;font-size:10px;font-weight:700;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.08em;">
            <div style="flex:1;height:1px;background:rgba(92,79,68,0.18);"></div>
            <span>ou calendrier</span>
            <div style="flex:1;height:1px;background:rgba(92,79,68,0.18);"></div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <button style="border:1.5px solid rgba(92,79,68,0.2);background:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;color:#5c4f44;" id="cdpCalPrev">‹</button>
            <span style="font-weight:600;font-size:13px;color:#2c2520;" id="cdpCalTitle"></span>
            <button style="border:1.5px solid rgba(92,79,68,0.2);background:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;color:#5c4f44;" id="cdpCalNext">›</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:10px;font-weight:600;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.05em;">
            <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
          </div>
          <div class="cdp-cal-grid" id="cdpCalGrid"></div>
          <p style="font-size:11px;color:#9c8c7c;text-align:center;margin-top:6px;">Fermé le lundi et le dimanche</p>
        </div>

        <!-- Step 3: Service & Zone -->
        <div class="cdp-step" id="cdpStep3">
          <button style="background:none;border:none;color:#9c8c7c;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;padding:0;margin-bottom:10px;" id="cdpBack2">‹ Retour</button>
          <p style="font-size:10px;font-weight:700;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px 0;">Étape 3 / 4</p>
          <h3 class="cdp-serif" style="font-size:1.6rem;margin:0 0 10px 0;color:#2c2520;">Quel créneau ?</h3>
          
          <div class="cdp-svc-tabs">
            <button class="cdp-svc-tab" id="cdpTabMidi">Midi (11h45 – 13h)</button>
            <button class="cdp-svc-tab" id="cdpTabSoir">Soir (18h30 – 20h30)</button>
          </div>
          
          <div class="cdp-chips" id="cdpTimeChips"></div>

          <!-- Zone Selection -->
          <div style="border-top:1px solid rgba(92,79,68,0.15);padding-top:12px;margin-top:14px;">
            <p style="font-size:10px;font-weight:700;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 8px 0;">Zone souhaitée</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <button type="button" class="cdp-zone-btn selected" id="cdpZoneSalle" onclick="window.cdpSelectZone('interieur')">
                <span style="font-weight:600;font-size:12px;color:#2c2520;display:block;">🍷 Intérieur</span>
                <span style="font-size:10px;color:#9c8c7c;">Salle bistrot</span>
              </button>
              <button type="button" class="cdp-zone-btn" id="cdpZoneTerrasse" onclick="window.cdpSelectZone('terrasse')">
                <span style="font-weight:600;font-size:12px;color:#2c2520;display:block;">🌿 Terrasse</span>
                <span style="font-size:10px;color:#9c8c7c;">Sous les marronniers</span>
              </button>
            </div>
          </div>

          <button class="cdp-btn-submit" style="margin-top:16px;" id="cdpToStep4">Continuer ›</button>
        </div>

        <!-- Step 4: Contact -->
        <div class="cdp-step" id="cdpStep4">
          <button style="background:none;border:none;color:#9c8c7c;font-size:11px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;padding:0;margin-bottom:10px;" id="cdpBack3">‹ Retour</button>
          <p style="font-size:10px;font-weight:700;color:#9c8c7c;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 4px 0;">Étape 4 / 4</p>
          <h3 class="cdp-serif" style="font-size:1.6rem;margin:0 0 12px 0;color:#2c2520;">Vos coordonnées</h3>

          <div class="cdp-field">
            <label>Nom et prénom *</label>
            <input type="text" id="cdpName" placeholder="Alexandre Burnevskiy" />
            <p class="cdp-field-error" id="cdpErrName">Nom obligatoire.</p>
          </div>
          <div class="cdp-field">
            <label>Téléphone <span style="font-weight:400;text-transform:none;">(requis si pas d'e-mail)</span></label>
            <input type="tel" id="cdpPhone" placeholder="+41 79 123 45 67" />
            <p class="cdp-field-error" id="cdpErrPhone">Format invalide (+41 / 07x / 02x).</p>
          </div>
          <div class="cdp-field">
            <label>E-mail <span style="font-weight:400;text-transform:none;">(requis si pas de téléphone)</span></label>
            <input type="email" id="cdpEmail" placeholder="alexandre@example.ch" />
            <p class="cdp-field-error" id="cdpErrEmail">Adresse e-mail invalide.</p>
          </div>
          <div class="cdp-field">
            <label>Remarques (optionnel)</label>
            <input type="text" id="cdpNotes" placeholder="Allergie fruits de mer, chaise haute..." />
          </div>

          <p style="font-size:11px;color:#9c8c7c;margin:8px 0;font-style:italic;">* Au moins un contact requis (téléphone ou e-mail).</p>

          <div style="background:#f5f0e8;border:1px solid rgba(92,79,68,0.15);padding:12px;border-radius:10px;margin-bottom:14px;font-size:12px;line-height:1.5;" id="cdpSummary"></div>

          <button class="cdp-btn-submit" id="cdpSubmitBtn">Confirmer la réservation</button>
          <p style="color:#c0392b;font-size:12px;text-align:center;margin-top:8px;display:none;" id="cdpError"></p>
        </div>

        <!-- Step 5: Success -->
        <div class="cdp-step" id="cdpStep5" style="text-align:center;padding:12px 0;">
          <div style="width:100%;height:120px;border-radius:12px;overflow:hidden;margin-bottom:14px;position:relative;">
            <img src="assets/plat.jpg" alt="Café de la Place" style="width:100%;height:100%;object-fit:cover;" />
          </div>
          <h3 class="cdp-serif" style="font-size:1.8rem;margin:0 0 6px 0;color:#2c2520;">Table réservée !</h3>
          <p style="color:#5c4f44;font-size:13px;margin:0 0 14px 0;line-height:1.5;">Votre table est confirmée au Café de la Place.</p>
          <div style="background:#f5f0e8;border-radius:10px;padding:12px;font-size:12px;color:#2c2520;margin-bottom:16px;text-align:left;line-height:1.5;" id="cdpSuccessSummary"></div>
          <button class="cdp-btn-submit" id="cdpSuccessClose">Fermer</button>
        </div>

      </div>
    </div>

    <!-- Trigger Button -->
    <button class="cdp-floating-trigger" id="cdpTrigger">
      <img src="assets/logo.png" alt="" style="height:18px;width:auto;object-fit:contain;filter:brightness(10);" />
      Réserver une table
    </button>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHTML;
  document.body.appendChild(container);

  // 3. Logic
  const overlay = document.getElementById('cdpModal');
  const trigger = document.getElementById('cdpTrigger');
  const closeBtn = document.getElementById('cdpClose');

  function openWidget() {
    overlay.classList.add('open');
    if (!state.guests) { buildGuests(); setStep(1); }
  }
  function closeWidget() { overlay.classList.remove('open'); }

  trigger.onclick = openWidget;
  closeBtn.onclick = closeWidget;
  overlay.onclick = (e) => { if (e.target === overlay) closeWidget(); };
  document.getElementById('cdpSuccessClose').onclick = closeWidget;

  function setStep(n) {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById('cdpStep' + i);
      if (el) el.classList.toggle('active', i === n);
      const bar = document.getElementById('cdpBar' + i);
      if (bar) bar.className = 'cdp-prog-bar' + (i <= n ? ' done' : '');
    }
    if (n === 2) renderSuggestions();
    if (n === 3 && !state.service) selectService('soir');
    if (n === 4) renderSummary();
  }

  document.getElementById('cdpBack1').onclick = () => setStep(1);
  document.getElementById('cdpBack2').onclick = () => setStep(2);
  document.getElementById('cdpBack3').onclick = () => setStep(3);
  document.getElementById('cdpToStep4').onclick = () => setStep(4);

  window.cdpSelectZone = function(zone) {
    state.zone = zone;
    document.getElementById('cdpZoneSalle').classList.toggle('selected', zone === 'interieur');
    document.getElementById('cdpZoneTerrasse').classList.toggle('selected', zone === 'terrasse');
  };

  // Guests
  function buildGuests() {
    const grid = document.getElementById('cdpGuestGrid');
    grid.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const b = document.createElement('button');
      b.className = 'cdp-tile';
      b.textContent = i;
      b.onclick = () => {
        state.guests = i;
        document.querySelectorAll('#cdpGuestGrid .cdp-tile').forEach(t => t.classList.remove('selected'));
        b.classList.add('selected');
        setTimeout(() => { initCal(); setStep(2); }, 150);
      };
      grid.appendChild(b);
    }
    const plus = document.createElement('button');
    plus.className = 'cdp-tile cdp-tile-plus';
    plus.textContent = '8+ personnes (021 943 10 37)';
    plus.onclick = () => { window.location.href = 'tel:0219431037'; };
    grid.appendChild(plus);
  }

  function isClosedDay(d) {
    const dow = d.getDay();
    return dow === 0 || dow === 1;
  }

  function getSuggestions() {
    const list = [];
    const now = new Date();
    const h = now.getHours();

    if (!isClosedDay(now)) {
      if (h < 13) list.push({ label: "Aujourd'hui · Midi", sub: "11h45 – 13h00 · Déjeuner", time: '12:15', service: 'midi', date: new Date(now), primary: true, badge: 'Disponible' });
      if (h < 20) list.push({ label: "Aujourd'hui · Ce soir", sub: "18h30 – 20h30 · Dîner", time: '19:30', service: 'soir', date: new Date(now), primary: !list.length, badge: 'Recommandé' });
    }
    const tom = new Date(now); tom.setDate(now.getDate() + 1);
    if (!isClosedDay(tom)) list.push({ label: "Demain · Soir", sub: "18h30 – 20h30", time: '19:30', service: 'soir', date: tom, primary: false, badge: null });

    for (let i = 2; i <= 7; i++) {
      const d = new Date(now); d.setDate(now.getDate() + i);
      const dow = d.getDay();
      if ((dow === 5 || dow === 6) && d.toDateString() !== tom.toDateString()) {
        list.push({ label: dow === 5 ? "Vendredi soir" : "Samedi soir", sub: "18h30 – 20h30 · Week-end", time: '19:30', service: 'soir', date: d, primary: false, badge: 'Week-end' });
        break;
      }
    }

    if (list.length === 0 || isClosedDay(now)) {
      for (let i = 1; i <= 4; i++) {
        const d = new Date(now); d.setDate(now.getDate() + i);
        if (!isClosedDay(d)) {
          const cap = d.toLocaleDateString('fr-CH', { weekday: 'long' });
          list.unshift({ label: `Prochain service · ${cap.charAt(0).toUpperCase() + cap.slice(1)}`, sub: "18h30 – 20h30", time: '19:30', service: 'soir', date: d, primary: true, badge: 'Réouverture' });
          break;
        }
      }
    }
    return list.slice(0, 3);
  }

  function renderSuggestions() {
    const box = document.getElementById('cdpSuggestionsBox');
    box.innerHTML = '';
    const sugs = getSuggestions();
    if (!sugs.length) return;

    sugs.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cdp-sugg-btn' + (idx === 0 ? ' primary-sugg' : '');
      btn.innerHTML = `
        <div>
          <div style="font-weight:600;font-size:13px;color:#2c2520;">
            ${s.label}
            ${s.badge ? `<span style="font-size:9px;background:rgba(44,37,32,0.1);color:#5c4f44;padding:2px 6px;border-radius:9999px;margin-left:6px;font-weight:700;">${s.badge}</span>` : ''}
          </div>
          <div style="font-size:11px;color:#9c8c7c;margin-top:2px;">${s.sub} · <strong>${s.time}</strong></div>
        </div>
        <span style="font-size:12px;font-weight:600;color:#2c2520;">Choisir ›</span>
      `;
      btn.onclick = () => {
        state.date = s.date;
        state.service = s.service;
        state.time = s.time;
        setStep(3);
      };
      box.appendChild(btn);
    });
  }

  // Calendar
  function initCal() {
    const t = new Date();
    calYear = t.getFullYear();
    calMonth = t.getMonth();
    renderCal();
  }
  document.getElementById('cdpCalPrev').onclick = () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCal();
  };
  document.getElementById('cdpCalNext').onclick = () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCal();
  };

  function renderCal() {
    document.getElementById('cdpCalTitle').textContent = MONTHS[calMonth] + ' ' + calYear;
    const grid = document.getElementById('cdpCalGrid');
    grid.innerHTML = '';
    const today = new Date(); today.setHours(0,0,0,0);
    const first = new Date(calYear, calMonth, 1);
    let dow = first.getDay() - 1; if (dow < 0) dow = 6;
    for (let i = 0; i < dow; i++) grid.appendChild(document.createElement('div'));
    const days = new Date(calYear, calMonth + 1, 0).getDate();

    for (let d = 1; d <= days; d++) {
      const dt = new Date(calYear, calMonth, d);
      const cell = document.createElement('button');
      cell.className = 'cdp-day';
      cell.textContent = d;
      const isPast = dt < today;
      const isClosed = dt.getDay() === 0 || dt.getDay() === 1;

      if (isPast || isClosed) { cell.classList.add(isPast ? 'past' : 'disabled'); cell.disabled = true; }
      else {
        if (dt.getTime() === today.getTime()) cell.classList.add('today');
        if (state.date && dt.toDateString() === state.date.toDateString()) cell.classList.add('selected');
        cell.onclick = () => {
          state.date = dt;
          document.querySelectorAll('.cdp-day').forEach(c => c.classList.remove('selected'));
          cell.classList.add('selected');
          setTimeout(() => { selectService(state.service || 'soir'); setStep(3); }, 150);
        };
      }
      grid.appendChild(cell);
    }
  }

  // Service & Slots
  function selectService(s) {
    state.service = s;
    document.getElementById('cdpTabMidi').classList.toggle('selected', s === 'midi');
    document.getElementById('cdpTabSoir').classList.toggle('selected', s === 'soir');
    const box = document.getElementById('cdpTimeChips');
    box.innerHTML = '';
    SLOTS[s].forEach(slot => {
      const b = document.createElement('button');
      b.className = 'cdp-chip' + (state.time === slot ? ' selected' : '');
      b.textContent = slot;
      b.onclick = () => {
        state.time = slot;
        document.querySelectorAll('#cdpTimeChips .cdp-chip').forEach(c => c.classList.remove('selected'));
        b.classList.add('selected');
      };
      box.appendChild(b);
    });
    if (!state.time) {
      state.time = SLOTS[s][0];
      box.firstChild?.classList.add('selected');
    }
  }
  document.getElementById('cdpTabMidi').onclick = () => selectService('midi');
  document.getElementById('cdpTabSoir').onclick = () => selectService('soir');

  function renderSummary() {
    const box = document.getElementById('cdpSummary');
    if (!state.date) return;
    const str = state.date.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
    const cap = str.charAt(0).toUpperCase() + str.slice(1);
    const zoneLabel = (state.zone === 'terrasse') ? '🌿 Terrasse ombragée' : '🍷 Intérieur (Salle)';
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <span style="font-weight:600;color:#2c2520;">${cap}</span> à <span style="font-weight:600;color:#2c2520;">${state.time || '19:30'}</span> (${state.service === 'midi' ? 'Midi' : 'Soir'})<br/>
          <span style="color:#5c4f44;">Table pour ${state.guests} personne(s) &nbsp;·&nbsp; ${zoneLabel}</span>
        </div>
        <button type="button" id="cdpModTime" style="background:none;border:none;cursor:pointer;font-size:11px;font-weight:600;text-decoration:underline;color:#8b5c2a;">Modifier</button>
      </div>
    `;
    document.getElementById('cdpModTime').onclick = () => { setStep(3); };
  }

  // Validation
  function toLocalISO(d) {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  function validatePhone(v) {
    const clean = v.replace(/[\s\-\.\(\)]/g, '');
    return /^(0[1-9][0-9]{8}|(\+|00)[1-9][0-9]{7,14})$/.test(clean);
  }
  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  document.getElementById('cdpSubmitBtn').onclick = async () => {
    const name = document.getElementById('cdpName').value.trim();
    const phone = document.getElementById('cdpPhone').value.trim();
    const email = document.getElementById('cdpEmail').value.trim();
    const userNotes = document.getElementById('cdpNotes').value.trim();
    const err = document.getElementById('cdpError');
    const btn = document.getElementById('cdpSubmitBtn');
    err.style.display = 'none';

    let ok = true;
    if (!name || name.length < 2) {
      document.getElementById('cdpName').classList.add('error');
      document.getElementById('cdpErrName').classList.add('show');
      ok = false;
    } else {
      document.getElementById('cdpName').classList.remove('error');
      document.getElementById('cdpErrName').classList.remove('show');
    }

    const hasPhone = phone.length > 0;
    const hasEmail = email.length > 0;

    if (!hasPhone && !hasEmail) {
      document.getElementById('cdpPhone').classList.add('error');
      document.getElementById('cdpErrPhone').classList.add('show');
      document.getElementById('cdpErrPhone').textContent = 'Téléphone ou e-mail obligatoire.';
      ok = false;
    } else {
      if (hasPhone && !validatePhone(phone)) {
        document.getElementById('cdpPhone').classList.add('error');
        document.getElementById('cdpErrPhone').classList.add('show');
        document.getElementById('cdpErrPhone').textContent = 'Numéro invalide (+41 / 07x / inter).';
        ok = false;
      } else {
        document.getElementById('cdpPhone').classList.remove('error');
        document.getElementById('cdpErrPhone').classList.remove('show');
      }

      if (hasEmail && !validateEmail(email)) {
        document.getElementById('cdpEmail').classList.add('error');
        document.getElementById('cdpErrEmail').classList.add('show');
        ok = false;
      } else {
        document.getElementById('cdpEmail').classList.remove('error');
        document.getElementById('cdpErrEmail').classList.remove('show');
      }
    }

    if (!ok) return;

    btn.disabled = true;
    btn.textContent = 'Enregistrement…';

    const zoneTag = state.zone === 'terrasse' ? '[Zone: Terrasse] ' : '[Zone: Intérieur] ';
    const fullNotes = zoneTag + userNotes;

    const payload = {
      customer_name: name,
      customer_phone: phone || null,
      customer_email: email || null,
      guests_count: state.guests,
      reservation_date: toLocalISO(state.date),
      service_type: state.service,
      reservation_time: state.time || '19:30',
      notes: fullNotes.trim() || null,
      status: 'pending'
    };

    try {
      if (window.supabase) {
        const sb = window.supabase.createClient(CONFIG.url, CONFIG.key);
        const { error } = await sb.from('reservations').insert([payload]);
        if (error) throw error;
      }
      const str = state.date.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
      const zoneLabel = (state.zone === 'terrasse') ? 'Terrasse ombragée' : 'Intérieur (Salle)';
      document.getElementById('cdpSuccessSummary').innerHTML = `
        <strong>${name}</strong><br/>
        📅 ${str} à ${state.time || '19:30'} (${state.service === 'midi' ? 'Midi' : 'Soir'})<br/>
        👥 ${state.guests} personne(s) &nbsp;·&nbsp; 📍 ${zoneLabel}
      `;
      setStep(5);
    } catch(e) {
      console.error(e);
      err.textContent = 'Erreur lors de la réservation. Veuillez téléphoner au 021 943 10 37.';
      err.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmer la réservation';
    }
  };

})();
