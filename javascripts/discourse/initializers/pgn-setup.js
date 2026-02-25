import { later } from "@ember/runloop";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import "../lib/dist";

function dashToCamel(str) {
  if (!str) return "";
  return str.split('-').map((part, index) => {
    if (index === 0) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
}

function isFenString(str) {
  const fenRegex = new RegExp("([^/]+\\/){5}.+");
  return fenRegex.test(str);
}

function parseConfig(configString) {
  if (typeof configString === 'undefined' || !configString) return {};
  let config = {};
  configString.split(';').forEach((entry) => {
    try {
      const [key, value] = entry.split(':');
      if (key && value) {
        config[dashToCamel(key.trim())] = value.trim();
      }
    } catch (error) {
      console.log("Ignoring malformed entry: ", entry);
    }
  });
  return config;
}

// Questa funzione ora si concentra sulla preparazione dei dati e sulla sostituzione del nodo
function prepareAndReplace(element, dataId) {
  const pgnBlocks = element.querySelectorAll("pre[data-code-wrap=pgn]");
  let count = 0;

  pgnBlocks.forEach((pre) => {
    const pgnData = pre.querySelector("code")?.textContent || "";
    const configData = pre.dataset.codeConfig || "";
    const id = `board-${dataId}-${count++}`;

    const pgnDiv = document.createElement("div");
    pgnDiv.id = id;
    pgnDiv.className = "pgn";
    pgnDiv.textContent = pgnData;
    pgnDiv.dataset.config = configData;

    // Sostituisce l'intero blocco <pre> con il nostro <div>
    pre.replaceWith(pgnDiv);
  });
}

function renderPgn(elem) {
  // Cattura il contenuto prima di schedulare, per sicurezza contro mutazioni DOM
  const content = elem.textContent;
  const configData = elem.dataset.config;

  elem.dataset.rendered = "true";

  later(() => {
    // Verifica che l'elemento sia ancora nel DOM
    if (!document.getElementById(elem.id)) return;

    let boardOnly = false;
    const config = parseConfig(configData);
    let args = {};

    if (isFenString(content)) {
      args.position = content;
      boardOnly = true;
    } else {
      args.pgn = content;
    }

    args.pieceStyle = config.pieceStyle || settings.piece_style;
    args.theme = config.theme || settings.theme;
    args.locale = config.locale || settings.locale;
    if (typeof config.orientation !== 'undefined') {
      args.orientation = config.orientation;
    }
    args.coordsInner = (typeof config.innerCoords !== 'undefined') ? true : settings.inner_coords;
    if (settings.marker) {
      args.colorMarker = "circle";
    }

    if (boardOnly) {
      PGNV.pgnBoard(elem.id, args);
    } else {
      PGNV.pgnView(elem.id, args);
    }
  });
}

function initialize(api) {
  api.decorateCookedElement((element, decoratorHelper) => {
    if (!decoratorHelper) return;

    // Nuova Glimmer API: il post è in decoratorHelper.post
    // Fallback Widget API: decoratorHelper.widget.attrs
    const post = decoratorHelper.post;
    const dataId = post?.id
      || decoratorHelper.widget?.attrs?.id;
    if (!dataId) return;

    // 1. Trasforma i blocchi <pre> in <div class="pgn">
    prepareAndReplace(element, dataId);

    // 2. Renderizza solo i div non ancora processati
    const nodes = element.querySelectorAll('div.pgn:not([data-rendered])');
    nodes.forEach(renderPgn);
  }, { id: "discourse-pgn-component", onlyStream: true });
}

export default {
  name: "discourse-pgn",
  initialize() {
    // Usiamo una versione API più recente per sicurezza
    withPluginApi("1.0.0", initialize);
  },
};