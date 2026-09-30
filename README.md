# ☕ Café de la Place — Système de réservation

Système de réservation de tables autonome et réactif pour le restaurant **Café de la Place** (Saint-Légier, Suisse).

## 🚀 Fonctionnalités

- **Widget Client (`client-widget.html`)**:
  - Sélecteur de couverts (1 à 8 pers., modal dédiée pour 8+).
  - Calendrier interactif avec fermeture automatique le lundi et le dimanche.
  - Sélection des créneaux par service (Midi & Soir).
  - Formulaire de coordonnées avec allergies / remarques.
  - Écran de confirmation avec remerciement.

- **Dashboard Personnel (`staff-dashboard.html`)**:
  - Interface optimisée pour iPad / tablette à la réception.
  - Vue par date (7 jours glissants) et filtre par service (Midi / Soir).
  - Synchronisation en temps réel via Supabase Realtime (WebSocket).
  - Notification sonore discrète (Web Audio API) à l'arrivée d'une nouvelle réservation.
  - Changement de statut en un clic : *Confirmer*, *Installer*, *Annuler*.
  - Formulaire d'ajout manuel de réservation (réservations téléphoniques).

## 🛠️ Stack technique

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES6+).
- **Backend & Base de données**: Supabase (PostgreSQL, Realtime, RLS).
- **Serveur local**: `node server.js` (port 3000).

## 📦 Lancement rapide

```bash
# Lancer le serveur local
node server.js
```

- Client : http://localhost:3000/client-widget.html
- Personnel : http://localhost:3000/staff-dashboard.html
