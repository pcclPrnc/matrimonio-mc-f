/**
 * Wedding RSVP → Google Sheets Integration
 * ==========================================
 * Incolla questo codice intero in script.google.com
 * (vedi SETUP_GOOGLE_SHEETS.md per le istruzioni complete)
 *
 * Il foglio viene creato automaticamente al primo invio.
 * Colonne: Timestamp | Nome | Cognome | Presenza | N_Ospiti |
 *          Accompagnatori_JSON | Allergie | Messaggio
 */

var SHEET_NAME = "RSVP"; // Puoi rinominare il tab come preferisci

/* ─────────────────────────────────────────────────────────────
   doPost — riceve il JSON dal form RSVP e scrive una riga
   ───────────────────────────────────────────────────────────── */
function doPost(e) {
  try {
    var sheet = getOrCreateSheet_();
    var data  = JSON.parse(e.postData.contents);

    /* Raccoglie allergie da tutte le persone del gruppo */
    var allergie = (data.persone || [])
      .flatMap(function(p) { return p.allergie || []; })
      .filter(function(v, i, arr) { return arr.indexOf(v) === i; }) // unique
      .join(", ");

    /* Accompagnatori (persone 2…N) in JSON compatto */
    var accompagnatori = (data.persone || []).slice(1).map(function(p) {
      return { nome: p.nome || "", note: p.note || "", allergie: p.allergie || [] };
    });

    /* Nota per ospite principale */
    var noteOspitePrincipale = data.persone && data.persone[0]
      ? data.persone[0].note || ""
      : "";

    var timestamp = data.timestamp
      ? new Date(data.timestamp)
      : new Date();

    var row = [
      Utilities.formatDate(timestamp, "Europe/Rome", "dd/MM/yyyy HH:mm:ss"),
      data.nome        || "",
      data.cognome     || "",
      data.presenza    ? "Sì" : "No",
      data.nPersone    || 0,
      noteOspitePrincipale,
      JSON.stringify(accompagnatori),
      allergie,
      data.messaggio   || "",
    ];

    sheet.appendRow(row);

    /* Auto-resize colonne ogni 10 righe (ottimizzazione performance) */
    var lastRow = sheet.getLastRow();
    if (lastRow % 10 === 0) {
      sheet.autoResizeColumns(1, sheet.getLastColumn());
    }

    return buildResponse_({ success: true, row: lastRow });

  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return buildResponse_({ success: false, error: err.message });
  }
}

/* ─────────────────────────────────────────────────────────────
   doOptions — gestisce il CORS preflight (metodo OPTIONS)
   ───────────────────────────────────────────────────────────── */
function doOptions(e) {
  return buildResponse_({ ok: true });
}

/* ─────────────────────────────────────────────────────────────
   doGet — health-check: apri l'URL nel browser per verificare
   ───────────────────────────────────────────────────────────── */
function doGet(e) {
  return buildResponse_({ status: "ok", message: "RSVP webhook attivo" });
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

/**
 * Restituisce il foglio RSVP, creandolo con le intestazioni
 * se non esiste ancora.
 */
function getOrCreateSheet_() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);

    var headers = [
      "Timestamp",
      "Nome",
      "Cognome",
      "Presenza",
      "N_Ospiti",
      "Note_Ospite_Principale",
      "Accompagnatori_JSON",
      "Allergie",
      "Messaggio",
    ];
    sheet.appendRow(headers);

    /* Stile intestazione */
    var hRange = sheet.getRange(1, 1, 1, headers.length);
    hRange.setFontWeight("bold");
    hRange.setBackground("#3D5A3E");
    hRange.setFontColor("#FFFFFF");
    hRange.setFontSize(11);

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);

    /* Larghezza minima per le colonne testuali */
    sheet.setColumnWidth(1, 160); // Timestamp
    sheet.setColumnWidth(7, 220); // Accompagnatori_JSON
    sheet.setColumnWidth(9, 260); // Messaggio
  }

  return sheet;
}

/**
 * Costruisce una risposta JSON con le intestazioni CORS
 * necessarie perché il browser possa leggere la risposta.
 */
function buildResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─────────────────────────────────────────────────────────────
   UTILITY — esegui manualmente da Apps Script per testare
   senza dover aprire il sito
   ───────────────────────────────────────────────────────────── */
function testInvioManuale() {
  var fakePayload = {
    timestamp: new Date().toISOString(),
    nome:      "Maria",
    cognome:   "Verdi",
    presenza:  true,
    nPersone:  2,
    persone: [
      { nome: "", note: "Senza cipolla", allergie: ["glutine"] },
      { nome: "Luca Verdi", note: "",    allergie: [] },
    ],
    messaggio: "Non vediamo l'ora! ♡",
  };

  var fakeEvent = {
    postData: {
      contents: JSON.stringify(fakePayload),
    },
  };

  var result = doPost(fakeEvent);
  Logger.log(result.getContent());
}
