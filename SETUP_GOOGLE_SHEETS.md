# Guida: Integrazione RSVP → Google Sheets

Questa guida ti porta dall'apertura di un foglio Google fino alla
ricezione automatica di ogni risposta RSVP in tempo reale.

---

## Prerequisiti

- Un account Google (lo stesso che usi per Drive e Gmail)
- Il sito wedding già pubblicato (o in esecuzione in locale per i test)
- Il pannello Admin del sito accessibile (`/admin`)

Tempo stimato: **10-15 minuti**.

---

## Passo 1 — Crea il Google Sheet

1. Vai su **[sheets.google.com](https://sheets.google.com)** e clicca
   **"+ Crea un nuovo foglio di calcolo"**.

2. Rinomina il file: clicca su *"Foglio di calcolo senza titolo"* in alto
   a sinistra e scrivi ad es. **`RSVP Matrimonio MC & F`**.

3. Il nome del primo **tab** (linguetta in basso) non ha importanza:
   lo script creerà automaticamente un tab chiamato **`RSVP`** con le
   intestazioni corrette al primo invio.
   
   > Lascia il foglio aperto — ti servirà fra poco.

---

## Passo 2 — Apri Apps Script

1. Con il Google Sheet aperto, clicca nel menu:
   **Estensioni → Apps Script**

2. Si apre una nuova scheda con l'editor Apps Script.
   Se c'è del codice di esempio (`function myFunction() {}`), 
   **cancellalo tutto**.

---

## Passo 3 — Incolla il codice

1. Apri il file **`google_apps_script.gs`** che trovi nella root del
   progetto (stessa cartella di `package.json`).

2. Copia **tutto** il contenuto del file.

3. Incollalo nell'editor Apps Script (la finestra bianca a destra).

4. Clicca il pulsante **💾 Salva** (icona floppy disk) oppure usa
   `Ctrl+S` / `Cmd+S`.

5. Nella tendina in alto accanto al tasto "Esegui", assicurati che sia
   selezionata la funzione **`doPost`** (per i test manuali).

---

## Passo 4 — Test manuale opzionale *(consigliato)*

Prima di pubblicare, verifica che lo script scriva correttamente nel foglio:

1. Nella tendina delle funzioni seleziona **`testInvioManuale`**.
2. Clicca **▶ Esegui**.
3. La prima volta chiederà le autorizzazioni:
   - Clicca **"Esamina le autorizzazioni"**
   - Scegli il tuo account Google
   - Clicca **"Avanzate"** → **"Vai a RSVP Matrimonio (non sicuro)"**
   - Clicca **"Consenti"**
4. Torna al Google Sheet: dovresti vedere un tab **`RSVP`** creato
   automaticamente con una riga di prova *(Maria Verdi)*.

---

## Passo 5 — Pubblica come App Web

> ⚠️ Questo passaggio è fondamentale: senza la pubblicazione, il sito
> non può inviare dati allo script.

1. In Apps Script clicca **"Distribuisci"** → **"Nuova distribuzione"**.

2. Clicca l'icona ⚙️ accanto a "Tipo" e scegli **"App web"**.

3. Compila il modulo:
   | Campo | Valore |
   |-------|--------|
   | **Descrizione** | `RSVP Matrimonio v1` |
   | **Esegui come** | **Io** *(il tuo account)* |
   | **Chi può accedere** | **Chiunque** |

   > "Chiunque" significa chiunque conosca l'URL — non è indicizzato
   > e non è accessibile pubblicamente senza il link esatto.

4. Clicca **"Distribuisci"**.

5. Copia l'**URL dell'app web** che appare (inizia con
   `https://script.google.com/macros/s/...`).
   
   > Tienilo al sicuro: chi ha questo URL può scrivere nel tuo foglio.

---

## Passo 6 — Incolla l'URL nel pannello Admin

1. Apri il sito e vai su **`/admin`** (login: `admin` / `matrimonio2026`).

2. Nel menu laterale clicca **"⚙️ Impostazioni"**.

3. Nella sezione **"🔧 Integrazione Google Sheets"** incolla l'URL
   copiato nel campo **"URL Webhook"**.

4. Clicca **"Salva Webhook"**.

---

## Passo 7 — Test end-to-end

1. Vai sulla pagina **RSVP** del tuo sito.
2. Compila e invia una risposta di prova (usa un nome fittizio come
   "Test Prova").
3. Apri il Google Sheet: entro pochi secondi dovresti vedere la nuova
   riga nella tab **`RSVP`**.

Se la riga non appare, vedi la sezione **Risoluzione problemi** qui sotto.

---

## Struttura delle colonne

| Colonna | Contenuto | Esempio |
|---------|-----------|---------|
| **Timestamp** | Data e ora dell'invio | `01/06/2026 14:32:11` |
| **Nome** | Nome dell'ospite | `Maria` |
| **Cognome** | Cognome | `Rossi` |
| **Presenza** | Sì / No | `Sì` |
| **N_Ospiti** | Numero totale di persone | `3` |
| **Note_Ospite_Principale** | Note menu dell'ospite | `Senza cipolla` |
| **Accompagnatori_JSON** | Dati accompagnatori in JSON | `[{"nome":"Luca"...}]` |
| **Allergie** | Lista allergie (tutte le persone) | `glutine, lattosio` |
| **Messaggio** | Messaggio agli sposi | `Non vediamo l'ora!` |

---

## Aggiornare lo script in futuro

Se modifichi `google_apps_script.gs`, devi **ripubblicare**:

1. Vai in Apps Script → **"Distribuisci"** → **"Gestisci distribuzioni"**.
2. Clicca la matita ✏️ sulla distribuzione esistente.
3. In "Versione" scegli **"Nuova versione"**.
4. Clicca **"Distribuisci"**.

> L'URL rimane lo stesso — non serve aggiornarlo nell'Admin.

---

## Risoluzione problemi

### La riga non appare nel foglio

**Causa più comune:** hai bisogno di una nuova distribuzione dopo aver
modificato il codice (vedi sezione precedente).

**Verifica rapida:** incolla l'URL del webhook nel browser. Dovresti vedere:
```json
{"status":"ok","message":"RSVP webhook attivo"}
```
Se invece vedi un errore, lo script non è pubblicato correttamente.

---

### Errore "Invio non riuscito" sul sito

Il messaggio compare quando `fetch()` solleva un'eccezione di rete
(nessuna connessione internet, URL errato, ecc.).

Controlla:
- Che l'URL nel pannello Admin sia corretto e completo
- Che il sito sia connesso a internet al momento dell'invio
- Che la distribuzione Apps Script sia ancora attiva

> In ogni caso la risposta è **sempre salvata localmente** nel browser,
> quindi nessun dato viene perso. Puoi recuperarla dall'Admin → Risposte RSVP.

---

### Permessi / "Chiunque" non disponibile

Se sei in un account Google Workspace (aziendale o scolastico), 
l'amministratore potrebbe aver ristretto i permessi. In questo caso:
- Usa un account Google personale (@gmail.com)
- Oppure chiedi all'amministratore di abilitare le app web pubbliche

---

### Doppio invio nel foglio

Se l'ospite ha inviato due volte (es. dopo un errore di rete), vedrai
due righe. Puoi semplicemente eliminare il duplicato dal foglio senza
conseguenze.

---

*Generato automaticamente — Matrimonio MC & F, 2 Ottobre 2026*
