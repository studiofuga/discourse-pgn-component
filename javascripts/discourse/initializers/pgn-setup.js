import { later } from "@ember/runloop";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import WidgetGlue from "discourse/widgets/glue";
import { debounce } from "@ember/runloop";
import "../lib/dist";

function dashToCamel(str) {
  let parts = str.split("-");

  for (let i = 1; i < parts.length; i++) {
    parts[i] = parts[i][0].toUpperCase() + parts[i].slice(1);
  }
  return parts.join("");
}

function isFenString(str) {
  const fenRegex = new RegExp("([^/]+\\/){5}.+");

  return fenRegex.test(str);
}

function parseConfig(configString) {
  if (typeof configString === 'undefined')
    return {};

  let entries = configString.split(';');
  let config = {};
  entries.forEach((entry) => {
    try {
      let kv = entry.split(':');
      config[dashToCamel(kv[0])] = kv[1];
    } catch (error) {
      console.log("Ignoring malformed entry: ", entry);
    }
  });
  return config;
}

function parseParameters(element) {
    const game = element.textContent;

    return {
      game: game,
      config: element.dataset.codeConfig
    };
}

function populateNode(elem, attrs) {
  //console.log("Container: ", elem.innerHTML);

  elem.innerHTML = "";
  const pgndiv = document.createElement("div");
  pgndiv.id = attrs.id;
  pgndiv.className = "pgn";
  pgndiv.innerHTML = attrs.game;
  pgndiv.config = attrs.config;

  elem.appendChild(pgndiv); 
  
  //console.log("Populated node: " + elem.innerHTML);
}

async function renderPgn(elem) {

  later(() => {
    let boardOnly = false;

    //console.log("renderPgn: ", elem.id, " pgn: ", elem.innerHTML, " config: ", elem.config);

    const config = parseConfig(elem.config);

    //console.log("Config: ", elem.config, "Parsed:", config);
    //console.log("Settings: ", settings);

    let args = { };

    if (isFenString(elem.innerHTML)) {
      args.position = elem.innerHTML;
      boardOnly = true;
    } else {
      args.pgn = elem.innerHTML;
    }

    args.pieceStyle = (config.pieceStyle || settings.piece_style);
    args.theme = (config.theme || settings.theme);
    args.locale = (config.locale || settings.locale);

    if (typeof config.orientation !== 'undefined')
      args.orientation = config.orientation;

    let innerCoords = settings.inner_coords;

    if (typeof config.innerCoords !== 'undefined') {
      args.coordsInner = true;
    } else {
      args.coordsInner = settings.inner_coords;
    }

    if (settings.marker) {
      args.colorMarker = "circle";
    }

    console.log("attrs: ", args);

    let pgnwidget = boardOnly ? PGNV.pgnBoard(elem.id, args) : PGNV.pgnView(elem.id, args);
  });
}

function generateBaseName(id, count) {
  return "board-" + id + "-" + count;
}

function prepareWrap(element, helper, dataId) {
    const nodes = element.querySelectorAll(
      "div[data-wrap=discourse-pgn]"
    );

    if (nodes.length == 0) return [];

    nodes.forEach((elem)=> {
      let id = generateBaseName(dataId);

      var attrs = parseParameters(elem);
      attrs.id = id;
      populateNode(elem, attrs);
    });

    return nodes;
}

function prepareCode(element,helper, dataId) {
    const nodes = element.querySelectorAll("pre[data-code-wrap=pgn]");
    if (nodes.length == 0) {
      return [];
    }

    nodes.forEach((elem)=> {
      let id = generateBaseName(dataId);

      var attrs = parseParameters(elem);
      attrs.id = id;
      populateNode(elem, attrs);
    });

    return nodes;    
}

function initialize(api) {

  api.decorateCookedElement((element, helper) => {
    let dataId = 0;
    if (helper && helper.widget && helper.attrs) {
      const postattr = helper.widget.attrs;
      dataId = postattr.id;
      console.log("post id: ", dataId);
    } else {
      return;
    }

    const wrapNodes = prepareWrap(element, helper, dataId);
    const codeNodes = prepareCode(element, helper, dataId);
  }, { id: "discourse-pgn-populate"});

  api.decorateCookedElement((element, helper) => {
    const nodes = element.querySelectorAll(
      "div.pgn"
    );

    if (nodes.length == 0) {
      return;
    }

    nodes.forEach((elem) => {
      renderPgn(elem);
    });

  }, { id: "discourse-pgn-render", afterAdopt: true });
}

export default {
  name: "discourse-pgn",

  initialize() {
    withPluginApi("0.8.28", initialize);
  },
};
