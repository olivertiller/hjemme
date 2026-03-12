# Hjemme 🏠

En enkel «er jeg hjemme?»-app som lar venner og familie sjekke om du er tilgjengelig for besøk.

## Hvordan det fungerer

- **Venner** åpner appen i nettleseren (eller installerer den som PWA) og ser umiddelbart om du er hjemme.
- **Du** logger inn på `/admin` og flipper en bryter for å oppdatere statusen din.
- Statusen oppdateres automatisk hos alle besøkende hvert 30. sekund.

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Sett admin-token (valgfritt, men anbefalt)

```bash
export ADMIN_TOKEN="ditt-hemmelige-passord"
```

Standardverdien er `endre-dette-til-noe-hemmelig` — bytt denne ut før du deler appen!

### 3. Start serveren

```bash
npm start
```

Serveren kjører på `http://localhost:3000`.

## Sider

| URL      | Beskrivelse                              |
|----------|------------------------------------------|
| `/`      | Besøkssiden — del denne med venner       |
| `/admin` | Admin-bryteren — kun for deg             |

## Deploy

Appen er klar for deploy til enhver Node.js-host:

### Railway / Render / Fly.io

1. Push repoet til GitHub
2. Koble til Railway/Render/Fly
3. Sett environment variables:
   - `ADMIN_TOKEN` — ditt hemmelige admin-passord
   - `PORT` — settes normalt automatisk
4. Deploy

### VPS (f.eks. DigitalOcean)

```bash
git clone <repo-url>
cd hjemme
npm install
ADMIN_TOKEN="ditt-passord" PORT=3000 node server.js
```

Bruk `pm2` eller `systemd` for å holde prosessen i live.

## PWA-installasjon (for venner)

Venner kan legge til appen på hjemskjermen:
- **iOS**: Safari → Del-knapp → «Legg til på Hjem-skjerm»
- **Android**: Chrome → Meny → «Legg til på startskjermen»

> **Merk:** For PWA-ikoner, erstatt SVG-filene i `public/icons/` med PNG-filer (192×192 og 512×512 px).

## API

### `GET /api/status`
Returnerer nåværende status.
```json
{ "home": true, "updatedAt": "2026-03-13T14:22:00.000Z" }
```

### `POST /api/status`
Oppdaterer status. Krever `X-Admin-Token`-header.
```bash
curl -X POST http://localhost:3000/api/status \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: ditt-token" \
  -d '{"home": true}'
```

## Veien videre

- [ ] Fysisk bryter (ESP32) som kaller API-et
- [ ] Push-notifikasjoner når status endres
- [ ] Flere brukere / husholdninger
- [ ] «Stikk innom snart»-knapp for venner
