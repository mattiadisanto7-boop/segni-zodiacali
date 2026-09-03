# Zodiaco Arena 6.0

Quiz zodiacale in italiano con modalità singolo e sfide online private per due giocatori.

## Funzioni

- 11 modalità in singolo di livello avanzato:
  - **Indovina Chi: interrogatorio**: scegli vere domande sì/no e gestisci manualmente ogni sospetto. Il gioco non elimina mai un segno al posto tuo; puoi capovolgere e riaprire liberamente le tessere.
  - **Profilo Vivente**: ricostruisci il segno osservando una persona in scene concrete di vita quotidiana, relazioni, pressione e motivazioni profonde. Contiene 144 scene originali combinabili in 972 profili.
  - **Rivelazione**: indizi relazionali in ordine variabile; ogni errore sblocca il successivo e riduce i punti. Non usa il numero della casa.
  - **Osservatorio J2000**: coordinate, luminosità e campo stellare reali; l'ottica ruota e può specchiare la figura a ogni prova.
  - **Codice Astrale**: un Mastermind zodiacale con 11.880 codici ordinati possibili, feedback su segni esatti e fuori posizione.
  - **Duello delle Tessere contro la CPU**: dodici carte, cinque categorie e una mano che passa soltanto quando l'attaccante perde.
  - **Dossier astrale**: completa sei variabili, incluse le proprietà dei segni precedente e successivo.
  - **Archivio vero/falso**: seleziona tutte le affermazioni vere senza sapere quante siano; il numero cambia a ogni turno.
  - **Deduzione astrale**: risolvi indizi che incrociano polarità, modalità, elementi, governatori, assi opposti e segni vicini.
  - **Maestro dello Zodiaco**: percorso misto per esperti, senza simboli trasparenti che possano suggerire la soluzione.
  - **Blitz estremo**: più risposte possibili in 60 secondi scegliendo fra molte alternative.
- I generatori combinano bersaglio, formulazione, relazioni e varianti visive; le domande recenti vengono ricordate nel browser per ridurre le ripetizioni anche tra partite diverse.
- **Campionato Astrale online** da 16 prove e quattro fasi:
  - **Dito più caldo**: la prima risposta corretta vale più della seconda.
  - **Scommessa**: prima di vedere la domanda entrambi rischiano 50, 100, 200 o 350 punti; una risposta sbagliata sottrae la puntata.
  - **Domanda progressiva**: il testo appare parola per parola e la prima risposta corretta chiude la manche.
  - **Ruba i punti**: la prima risposta corretta trasferisce punti dall'avversario; il bottino diminuisce con il tempo.
- **Duello delle Tessere online**: chi attacca sceglie la categoria vedendo soltanto i nomi delle due difese disponibili; chi difende sceglie la tessera. Il vincitore raccoglie entrambe le carte e chi conquista tutti i dodici segni vince.
- Restano disponibili anche quiz online classici da 5, 10 o 15 domande.
- Domande sincronizzate, timer lato server, punteggi autoritativi e informazioni nascoste diverse per i due giocatori. Nella fase progressiva il browser riceve soltanto le parole già sbloccate: il testo completo resta sul server fino alla rivelazione.
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

Il file `render.yaml` configura già tutto se usi **New > Blueprint**. Deve trovarsi nella radice del ramo `main`, non dentro una sottocartella.

1. Accedi a Render e scegli **New > Blueprint**.
2. Collega il repository GitHub appena creato.
3. Seleziona il repository e conferma **Apply**.
4. Al termine usa l'indirizzo fornito da Render.

Render eseguirà automaticamente:

- build: `npm ci && npm run build`
- avvio: `npm start`
- controllo: `/api/health`

Ogni nuovo push sul ramo `main` aggiornerà l'app automaticamente.

Se hai già creato un normale **Web Service**, non serve ricrearlo. Imposta:

- Runtime: `Node`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Branch: `main`

La guida operativa completa, compreso il controllo contro vecchie build in cache, è in [`DEPLOY-RENDER.md`](DEPLOY-RENDER.md).

Per verificare senza dubbi cosa sta servendo Render apri `https://IL-TUO-SERVIZIO.onrender.com/api/health`: la release corrente restituisce `"version":"6.0.0"`. La stessa versione compare nella barra superiore del gioco.

## Dati astronomici

La geometria delle figure, le posizioni stellari e le magnitudini dell'Osservatorio sono adattate dal progetto open source [d3-celestial](https://github.com/ofrohn/d3-celestial), licenza BSD-3-Clause, con dati XHIP in epoca J2000. La IAU definisce confini e abbreviazioni delle costellazioni ma non impone un unico disegno lineare: le linee mostrate sono quindi una convenzione cartografica, mentre coordinate e luminosità non sono disegnate a mano.

## Nota sulle stanze online

Le stanze rimangono in memoria per 30 minuti e sono pensate per partite private e immediate. Con il piano gratuito di Render il primo caricamento dopo un periodo di inattività può richiedere alcuni secondi. Per mantenere le partite attive usare una sola istanza del servizio.

## Struttura

- `src/App.jsx`: interfaccia e logica del gioco.
- `src/advancedGames.jsx`: Profilo Vivente e duelli di tessere contro CPU/online.
- `src/personalityData.js`: banca delle 144 scene comportamentali.
- `src/competitiveData.js`: fasi del campionato, punteggi e valori delle tessere.
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
