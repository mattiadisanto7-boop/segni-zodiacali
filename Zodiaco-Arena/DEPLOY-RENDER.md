# Pubblicare Zodiaco Arena 6.2 su GitHub e Render

## 1. Controlla la radice del repository

Estrai lo ZIP. Carica su GitHub **i file che si trovano al suo interno**, non lo ZIP e non una cartella contenitrice aggiuntiva.

Aprendo il ramo `main` su GitHub devi vedere subito:

- `package.json`
- `package-lock.json`
- `server.mjs`
- `render.yaml`
- la cartella `src`

Se `render.yaml` si trova dentro `Zodiaco-Arena/...`, Render non può trovarlo.

## 2. Se usi un Web Service già creato

Nelle impostazioni del servizio usa:

| Impostazione | Valore |
| --- | --- |
| Runtime | Node |
| Branch | `main` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Salva, quindi avvia un nuovo deploy dell'ultimo commit. Se Render continua a mostrare una versione precedente, esegui un deploy cancellando la cache di build.

## 3. Se vuoi usare un Blueprint

Il file `render.yaml` è già pronto. Da Render scegli **New > Blueprint**, collega il repository e applica la configurazione.

## 4. Verifica inequivocabile

Apri:

```text
https://IL-TUO-SERVIZIO.onrender.com/api/health
```

La risposta della versione corretta contiene:

```json
{"ok":true,"version":"6.2.0","roundSeconds":60,"progressiveRevealSeconds":30}
```

Inoltre, nella barra superiore del gioco deve comparire `v6.2.0`. Se uno dei due controlli mostra altro, Render sta ancora distribuendo un vecchio commit o una vecchia cache.

## 5. Controlli locali facoltativi

Con Node.js 20 o successivo:

```bash
npm ci
npm test
npm run build
npm start
```

Poi apri `http://localhost:10000`.
