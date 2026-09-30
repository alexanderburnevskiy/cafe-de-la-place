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

  const state = { guests: null, date: null, service: null, time: null };
  let calYear, calMonth;

  // 1. Inject Styles
  const css = `
    .cdp-modal-overlay {
      position: fixed; inset: 0; background: rgba(12, 10, 9, 0.65);
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      z-index: 999999; opacity: 0; pointer-events: none;
      transition: opacity 0.25s ease; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .cdp-modal-overlay.open { opacity: 1; pointer-events: auto; }
    .cdp-modal-box {
      background: #ffffff; border-radius: 1.5rem; max-width: 440px; width: 92%;
      max-height: 90vh; overflow-y: auto; padding: 1.75rem; position: relative;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); transform: translateY(15px);
      transition: transform 0.25s ease; color: #1c1917; font-size: 14px;
    }
    .cdp-modal-overlay.open .cdp-modal-box { transform: translateY(0); }
    .cdp-close-btn {
      position: absolute; top: 1.25rem; right: 1.25rem; background: transparent;
      border: none; font-size: 1.5rem; cursor: pointer; color: #a8a29e; line-height: 1;
    }
    .cdp-close-btn:hover { color: #1c1917; }
    .cdp-step { display: none; }
    .cdp-step.active { display: block; }
    .cdp-grid-guests { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 1rem; }
    .cdp-tile {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      border-radius: 12px; border: 1.5px solid #e7e5e4; background: #fff;
      font-size: 1.3rem; font-weight: 600; cursor: pointer; color: #1c1917;
      transition: all 0.15s ease;
    }
    .cdp-tile:hover { border-color: #92400e; color: #92400e; }
    .cdp-tile.selected { background: #92400e; border-color: #92400e; color: #fff; }
    .cdp-tile-plus {
      grid-column: span 4; aspect-ratio: auto; padding: 12px; font-size: 0.9rem; font-weight: 600;
    }
    .cdp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; margin: 10px 0; }
    .cdp-day {
      aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
      border-radius: 8px; border: 1.5px solid transparent; background: transparent;
      cursor: pointer; font-size: 0.85rem; font-weight: 500;
    }
    .cdp-day:not(.disabled):not(.past):hover { background: #fef3c7; }
    .cdp-day.selected { background: #92400e; color: #fff; }
    .cdp-day.disabled, .cdp-day.past { color: #d6d3d1; cursor: not-allowed; }
    .cdp-day.today { border-color: #fbbf24; font-weight: 700; }
    .cdp-svc-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
    .cdp-svc-tab {
      flex: 1; padding: 12px; border-radius: 12px; border: 1.5px solid #e7e5e4;
      background: #fff; font-weight: 600; cursor: pointer; text-align: center;
    }
    .cdp-svc-tab.selected { background: #92400e; border-color: #92400e; color: #fff; }
    .cdp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .cdp-chip {
      padding: 8px 16px; border-radius: 9999px; border: 1.5px solid #e7e5e4;
      background: #fff; font-weight: 500; cursor: pointer;
    }
    .cdp-chip.selected { background: #92400e; border-color: #92400e; color: #fff; }
    .cdp-field { margin-bottom: 12px; }
    .cdp-field label { display: block; font-weight: 600; font-size: 0.8rem; color: #57534e; margin-bottom: 4px; }
    .cdp-field input {
      width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e7e5e4;
      font-size: 0.95rem; outline: none; box-sizing: border-box;
    }
    .cdp-field input:focus { border-color: #92400e; }
    .cdp-btn-submit {
      width: 100%; padding: 14px; border-radius: 12px; background: #92400e; color: #fff;
      border: none; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s;
    }
    .cdp-btn-submit:hover { background: #78350f; }
    .cdp-btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .cdp-floating-trigger {
      position: fixed; bottom: 24px; right: 24px; z-index: 999990;
      background: #92400e; color: #fff; padding: 14px 22px; border-radius: 9999px;
      font-weight: 600; font-size: 0.95rem; border: none; cursor: pointer;
      box-shadow: 0 10px 25px rgba(146,64,14,0.35); display: flex; align-items: center; gap: 8px;
      font-family: inherit; transition: transform 0.2s, background 0.2s;
    }
    .cdp-floating-trigger:hover { background: #78350f; transform: translateY(-2px); }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // 2. Inject Modal HTML
  const modalHTML = `
    <div class="cdp-modal-overlay" id="cdpModal">
      <div class="cdp-modal-box">
        <button class="cdp-close-btn" id="cdpClose">×</button>

        <!-- Step 1: Guests -->
        <div class="cdp-step active" id="cdpStep1">
          <p style="font-size:11px;font-weight:700;color:#a8a29e;text-transform:uppercase;margin:0 0 4px 0;">Étape 1 / 4</p>
          <h3 style="font-size:1.3rem;font-weight:700;margin:0 0 1rem 0;">Combien de personnes ?</h3>
          <div class="cdp-grid-guests" id="cdpGuestGrid"></div>
        </div>

        <!-- Step 2: Date -->
        <div class="cdp-step" id="cdpStep2">
          <button style="background:none;border:none;color:#78716c;font-size:12px;font-weight:600;cursor:pointer;padding:0;margin-bottom:8px;" id="cdpBack1">‹ Retour</button>
          <p style="font-size:11px;font-weight:700;color:#a8a29e;text-transform:uppercase;margin:0 0 4px 0;">Étape 2 / 4</p>
          <h3 style="font-size:1.3rem;font-weight:700;margin:0 0 10px 0;">Quelle date ?</h3>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <button style="border:1px solid #e7e5e4;background:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;" id="cdpCalPrev">‹</button>
            <span style="font-weight:700;font-size:14px;" id="cdpCalTitle"></span>
            <button style="border:1px solid #e7e5e4;background:#fff;border-radius:50%;width:28px;height:28px;cursor:pointer;" id="cdpCalNext">›</button>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);text-align:center;font-size:11px;font-weight:600;color:#a8a29e;">
            <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
          </div>
          <div class="cdp-cal-grid" id="cdpCalGrid"></div>
          <p style="font-size:11px;color:#a8a29e;text-align:center;margin:4px 0 0 0;">Fermé le lundi et le dimanche</p>
        </div>

        <!-- Step 3: Service -->
        <div class="cdp-step" id="cdpStep3">
          <button style="background:none;border:none;color:#78716c;font-size:12px;font-weight:600;cursor:pointer;padding:0;margin-bottom:8px;" id="cdpBack2">‹ Retour</button>
          <p style="font-size:11px;font-weight:700;color:#a8a29e;text-transform:uppercase;margin:0 0 4px 0;">Étape 3 / 4</p>
          <h3 style="font-size:1.3rem;font-weight:700;margin:0 0 12px 0;">Quel horaire ?</h3>
          <div class="cdp-svc-tabs">
            <button class="cdp-svc-tab" id="cdpTabMidi">🌞 Midi</button>
            <button class="cdp-svc-tab" id="cdpTabSoir">🌙 Soir</button>
          </div>
          <div class="cdp-chips" id="cdpChips"></div>
        </div>

        <!-- Step 4: Contact -->
        <div class="cdp-step" id="cdpStep4">
          <button style="background:none;border:none;color:#78716c;font-size:12px;font-weight:600;cursor:pointer;padding:0;margin-bottom:8px;" id="cdpBack3">‹ Retour</button>
          <p style="font-size:11px;font-weight:700;color:#a8a29e;text-transform:uppercase;margin:0 0 4px 0;">Étape 4 / 4</p>
          <h3 style="font-size:1.3rem;font-weight:700;margin:0 0 12px 0;">Vos coordonnées</h3>

          <div class="cdp-field">
            <label>Nom et prénom *</label>
            <input type="text" id="cdpName" placeholder="Marie Dupont" required />
          </div>
          <div class="cdp-field">
            <label>Téléphone *</label>
            <input type="tel" id="cdpPhone" placeholder="+41 79 123 45 67" required />
          </div>
          <div class="cdp-field">
            <label>E-mail (optionnel)</label>
            <input type="email" id="cdpEmail" placeholder="contact@example.com" />
          </div>
          <div class="cdp-field">
            <label>Remarques (optionnel)</label>
            <input type="text" id="cdpNotes" placeholder="Allergies, terrasse..." />
          </div>

          <div id="cdpSummary" style="background:#fef3c7;border:1px solid #fde68a;padding:10px;border-radius:10px;font-size:12px;color:#78350f;margin-bottom:12px;"></div>

          <button class="cdp-btn-submit" id="cdpSubmit">Confirmer la réservation</button>
          <p id="cdpError" style="color:#ef4444;font-size:12px;text-align:center;display:none;margin-top:8px;"></p>
        </div>

        <!-- Step 5: Success -->
        <div class="cdp-step" id="cdpStep5" style="text-align:center;padding:1.5rem 0;">
          <div style="width:60px;height:60px;border-radius:50%;background:#dcfce7;color:#15803d;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 1rem auto;">✓</div>
          <h3 style="font-size:1.4rem;font-weight:700;margin:0 0 8px 0;">Merci !</h3>
          <p style="color:#57534e;font-size:14px;margin:0 0 1rem 0;">Votre réservation a bien été enregistrée au <strong>Café de la Place</strong>.</p>
          <button class="cdp-btn-submit" id="cdpDone" style="width:auto;padding:10px 24px;margin:0 auto;">Fermer</button>
        </div>

        <!-- Modal 8+ -->
        <div id="cdpModal8" style="display:none;position:absolute;inset:0;background:#fff;border-radius:1.5rem;padding:2rem;text-align:center;flex-direction:column;justify-content:center;align-items:center;">
          <div style="font-size:2.5rem;margin-bottom:8px;">📞</div>
          <h4 style="font-size:1.2rem;font-weight:700;margin:0 0 8px 0;">Grand groupe</h4>
          <p style="font-size:13px;color:#57534e;margin:0 0 1rem 0;">Pour les groupes de plus de 8 personnes, merci de nous appeler directement :</p>
          <a href="tel:${CONFIG.phone.replace(/\\s/g,'')}" style="display:inline-block;background:#92400e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:700;">${CONFIG.phone}</a>
          <button id="cdpClose8" style="background:none;border:none;color:#78716c;margin-top:1.5rem;cursor:pointer;">Fermer</button>
        </div>

      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = modalHTML;
  document.body.appendChild(container);

  // 3. Optional Floating Button (auto-created if no [data-cdp-booking] exists on page)
  const existingTriggers = document.querySelectorAll('[data-cdp-booking], .cdp-booking-btn, #open-cdp-booking');
  if (existingTriggers.length === 0) {
    const floatBtn = document.createElement('button');
    floatBtn.className = 'cdp-floating-trigger';
    floatBtn.innerHTML = `<span>☕</span><span>Réserver une table</span>`;
    floatBtn.onclick = openWidget;
    document.body.appendChild(floatBtn);
  }

  // Bind clicks on any custom buttons on the host website
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cdp-booking], .cdp-booking-btn, #open-cdp-booking')) {
      e.preventDefault();
      openWidget();
    }
  });

  // 4. Widget Logic
  function openWidget() {
    document.getElementById('cdpModal').classList.add('open');
    if (!state.guests) { buildGuests(); setStep(1); }
  }
  function closeWidget() {
    document.getElementById('cdpModal').classList.remove('open');
  }

  document.getElementById('cdpClose').onclick = closeWidget;
  document.getElementById('cdpDone').onclick = closeWidget;
  document.getElementById('cdpModal').onclick = (e) => { if (e.target.id === 'cdpModal') closeWidget(); };

  function setStep(n) {
    document.querySelectorAll('.cdp-step').forEach(s => s.classList.remove('active'));
    document.getElementById('cdpStep' + n).classList.add('active');
    if (n === 4) {
      const str = state.date.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' });
      document.getElementById('cdpSummary').innerHTML = `📅 <strong>${str}</strong> à <strong>${state.time}</strong> (${state.service === 'midi' ? 'Midi' : 'Soir'}) pour <strong>${state.guests} personne(s)</strong>`;
    }
  }

  document.getElementById('cdpBack1').onclick = () => setStep(1);
  document.getElementById('cdpBack2').onclick = () => setStep(2);
  document.getElementById('cdpBack3').onclick = () => setStep(3);

  function buildGuests() {
    const box = document.getElementById('cdpGuestGrid');
    box.innerHTML = '';
    for (let i = 1; i <= 8; i++) {
      const b = document.createElement('button');
      b.className = 'cdp-tile';
      b.textContent = i;
      b.onclick = () => {
        state.guests = i;
        document.querySelectorAll('.cdp-tile').forEach(t => t.classList.remove('selected'));
        b.classList.add('selected');
        setTimeout(() => { initCalendar(); setStep(2); }, 150);
      };
      box.appendChild(b);
    }
    const b8 = document.createElement('button');
    b8.className = 'cdp-tile cdp-tile-plus';
    b8.textContent = '8+ personnes';
    b8.onclick = () => { document.getElementById('cdpModal8').style.display = 'flex'; };
    box.appendChild(b8);
  }

  document.getElementById('cdpClose8').onclick = () => { document.getElementById('cdpModal8').style.display = 'none'; };

  function initCalendar() {
    const today = new Date();
    calYear = today.getFullYear();
    calMonth = today.getMonth();
    renderCal();
  }

  function renderCal() {
    document.getElementById('cdpCalTitle').textContent = MONTHS[calMonth] + ' ' + calYear;
    const box = document.getElementById('cdpCalGrid');
    box.innerHTML = '';
    const today = new Date(); today.setHours(0,0,0,0);
    const first = new Date(calYear, calMonth, 1);
    let dow = first.getDay() - 1;
    if (dow < 0) dow = 6;
    for (let i = 0; i < dow; i++) box.appendChild(document.createElement('div'));
    const days = new Date(calYear, calMonth + 1, 0).getDate();

    for (let d = 1; d <= days; d++) {
      const date = new Date(calYear, calMonth, d);
      const b = document.createElement('button');
      b.className = 'cdp-day';
      b.textContent = d;
      const isPast = date < today;
      const isClosed = date.getDay() === 0 || date.getDay() === 1; // Sun & Mon closed
      if (isPast || isClosed) {
        b.classList.add(isPast ? 'past' : 'disabled');
        b.disabled = true;
      } else {
        if (date.getTime() === today.getTime()) b.classList.add('today');
        if (state.date && date.toDateString() === state.date.toDateString()) b.classList.add('selected');
        b.onclick = () => {
          state.date = date;
          document.querySelectorAll('.cdp-day').forEach(c => c.classList.remove('selected'));
          b.classList.add('selected');
          setTimeout(() => { selectSvc(state.service || 'midi'); setStep(3); }, 150);
        };
      }
      box.appendChild(b);
    }
  }

  document.getElementById('cdpCalPrev').onclick = () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCal();
  };
  document.getElementById('cdpCalNext').onclick = () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCal();
  };

  function selectSvc(s) {
    state.service = s;
    document.getElementById('cdpTabMidi').classList.toggle('selected', s === 'midi');
    document.getElementById('cdpTabSoir').classList.toggle('selected', s === 'soir');
    const box = document.getElementById('cdpChips');
    box.innerHTML = '';
    SLOTS[s].forEach(slot => {
      const chip = document.createElement('button');
      chip.className = 'cdp-chip' + (state.time === slot ? ' selected' : '');
      chip.textContent = slot;
      chip.onclick = () => {
        state.time = slot;
        document.querySelectorAll('.cdp-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        setTimeout(() => setStep(4), 150);
      };
      box.appendChild(chip);
    });
  }

  document.getElementById('cdpTabMidi').onclick = () => selectSvc('midi');
  document.getElementById('cdpTabSoir').onclick = () => selectSvc('soir');

  document.getElementById('cdpSubmit').onclick = async () => {
    const name = document.getElementById('cdpName').value.trim();
    const phone = document.getElementById('cdpPhone').value.trim();
    const email = document.getElementById('cdpEmail').value.trim();
    const notes = document.getElementById('cdpNotes').value.trim();
    const err = document.getElementById('cdpError');
    const btn = document.getElementById('cdpSubmit');

    err.style.display = 'none';
    if (!name || !phone) {
      err.textContent = 'Nom et téléphone obligatoires.';
      err.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Envoi...';

    const payload = {
      customer_name: name, customer_phone: phone, customer_email: email || null,
      guests_count: state.guests, reservation_date: state.date.toISOString().split('T')[0],
      service_type: state.service, reservation_time: state.time, notes: notes || null,
      status: 'pending'
    };

    try {
      const resp = await fetch(`${CONFIG.url}/rest/v1/reservations`, {
        method: 'POST',
        headers: {
          'apikey': CONFIG.key,
          'Authorization': `Bearer ${CONFIG.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('API Error');
      setStep(5);
    } catch(e) {
      err.textContent = 'Erreur lors de la réservation. Veuillez téléphoner au restaurant.';
      err.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Confirmer la réservation';
    }
  };

  // Expose global controller
  window.CafeDeLaPlace = {
    open: openWidget,
    close: closeWidget
  };
})();
