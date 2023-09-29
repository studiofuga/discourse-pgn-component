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
    const config = parseConfig(element.dataset.codeConfig);

    const pieceStyle = (config.pieceStyle || settings.piece_style);
    const theme = (config.theme || settings.theme);

    console.log("Game: ", game);
    console.log("Theme: ", theme);

    return {
      game: game,
      pieceStyle: pieceStyle,
      theme: theme
    };
}

function populateNode(elem, attrs) {
  console.log("Container: ", elem.innerHTML);

  elem.innerHTML = "";
  const pgndiv = document.createElement("div");
  pgndiv.id = attrs.id;
  pgndiv.className = "pgn";
  pgndiv.innerHTML = attrs.game;

  pgndiv.pieceStyle = (attrs.pieceStyle || "uscf");
  pgndiv.theme = (attrs.theme || "beier");

  elem.appendChild(pgndiv); 
  
  console.log("Populated node: " + elem.innerHTML);
}

async function renderPgn(elem) {

  later(() => {
    console.log("renderPgn: ", elem.id, " pgn: ", elem.innerHTML, " theme: ", elem.theme);

    let args = { pgn: elem.innerHTML};
    args.pieceStyle = elem.pieceStyle;
    args.theme = elem.theme;

    let pgnwidget = PGNV.pgnView(elem.id, args);
  });
}

function generateBaseName(id, count) {
  return "board-" + id + "-" + count;
}

function prepareWrap(element, helper, dataId, wcount) {
    const nodes = element.querySelectorAll(
      "div[data-wrap=discourse-pgn]"
    );

    if (nodes.length == 0) return [];

    nodes.forEach((elem)=> {
      let id = generateBaseName(dataId, wcount);
      //console.log("Generate: ", dataId , " ", wcount , " -> ", id);
      ++wcount;      

      var attrs = parseParameters(elem);
      attrs.id = id;
      populateNode(elem, attrs);
    });

    return nodes;
}

function prepareCode(element,helper, dataId, wcount) {
    const nodes = element.querySelectorAll("pre[data-code-wrap=pgn]");
    if (nodes.length == 0) {
      return [];
    }

    nodes.forEach((elem)=> {
      let id = generateBaseName(dataId, wcount);
      //console.log("Generate: ", dataId , " ", wcount , " -> ", id);
      ++wcount;      

      var attrs = parseParameters(elem);
      attrs.id = id;
      populateNode(elem, attrs);
    });

    return nodes;    
}

function initialize(api) {

  api.decorateCookedElement((element, helper) => {
    let dataId = 0;
    if (helper) {
      const postattr = helper.widget.attrs;
      dataId = postattr.id;
      console.log("post id: ", dataId);
    };

    let wcount = 1;
    const wrapNodes = prepareWrap(element, helper, dataId, wcount);
    const codeNodes = prepareCode(element, helper, dataId, wcount);
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
