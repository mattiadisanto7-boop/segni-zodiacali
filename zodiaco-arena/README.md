# Zodiaco Arena

Quiz zodiacale in italiano con modalità singolo e sfide online private per due giocatori.

## Funzioni

- 9 modalità in singolo: Identikit, Calendario, Elementi, Vero o falso, Intruso, Simboli, Pianeti, Percorso misto e Blitz 60 secondi.
- Partite online da 5, 10 o 15 domande tramite codice stanza.
- Domande sincronizzate, limite di 20 secondi e bonus velocità.
- Classifica finale, rivincita e riconnessione automatica.
- Record personali salvati nel browser.
- Design responsive per smartphone, tablet e computer.
- Manifest PWA per aggiungere il gioco alla schermata Home.
- Nessun database o servizio esterno necessario.

## Avvio sul computer

Richiede Node.js 20 o successivo.

```bash
npm install
npm run build
npm start
```

Apri `http://localhost:10000`.

Durante lo sviluppo si possono usare due terminali:

```bash
npm run dev
```

```bash
npm start
```

Il primo comando apre il frontend su `http://localhost:5173` e inoltra le API al server sulla porta 10000.

## Caricamento su GitHub

1. Crea un repository vuoto su GitHub, per esempio `zodiaco-arena`.
2. Apri il terminale dentro questa cartella.
3. Esegui:

```bash
git init
git add .
git commit -m "Prima versione di Zodiaco Arena"
git branch -M main
git remote add origin https://github.com/TUO-USERNAME/zodiaco-arena.git
git push -u origin main
```

Sostituisci `TUO-USERNAME` con il tuo nome utente GitHub.

## Pubblicazione su Render

Il file `render.yaml` configura già tutto.

1. Accedi a Render e scegli **New > Blueprint**.
2. Collega il repository GitHub appena creato.
3. Seleziona il repository e conferma **Apply**.
4. Al termine usa l'indirizzo fornito da Render.

Render eseguirà automaticamente:

- build: `npm ci && npm run build`
- avvio: `npm start`
- controllo: `/api/health`

Ogni nuovo push sul ramo `main` aggiornerà l'app automaticamente.

## Nota sulle stanze online

Le stanze rimangono in memoria per 30 minuti e sono pensate per partite private e immediate. Con il piano gratuito di Render il primo caricamento dopo un periodo di inattività può richiedere alcuni secondi. Per mantenere le partite attive usare una sola istanza del servizio.

## Struttura

- `src/App.jsx`: interfaccia e logica del gioco.
- `src/gameData.js`: segni, modalità e generazione delle domande.
- `server.mjs`: server HTTP, stanze e sincronizzazione in tempo reale tramite SSE.
- `render.yaml`: configurazione automatica per Render.
- `tests/`: controlli sulla generazione delle domande.

## Comandi

```bash
npm run dev     # frontend di sviluppo
npm run build   # crea la versione ottimizzata
npm start       # avvia il server completo
npm test        # esegue i controlli automatici
```
