import { later } from "@ember/runloop";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import WidgetGlue from "discourse/widgets/glue";
import { debounce } from "@ember/runloop";
import "../lib/dist";

// babel: { compact: true }

// Cleanup the content, so it will not have any errors. Known are
// * line breaks ==> Spaces
// * Pattern: ... ==> ..
function cleanup_pgnv(string)
{
    var tmp;
    const correction = { "...": '&#8222;',
                         "...": '&#8220;',
                         "...": '&#8221;',
                         '"': "&#8230;",
                         '"': "...",
                         '"': "â€¦"};
    Object.keys(correction).forEach((key) => {
    tmp = string.replaceAll(key, correction[key]);
    });
    const correction2 = ["\r\n","\n","\r","<br />","<br>","<p>","</p>","&nbsp;"]
    correction2.forEach((key) => {
    tmp = tmp.replaceAll(key, ' ');
    });
    tmp = tmp.trim();
    tmp = tmp.replace('~\\xc2\\xa0~', ' ');
    return tmp.replace('/\\s+/', ' ');
}
// end of Cleanup the content

function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function isEmpty(fen) {
  var undef, i, len;
  var emptyValues = [undef, null, false, 0, '', ' ', '0'];
  for (i = 0, len = emptyValues.length; i < len; i++)
  {
      if (fen === emptyValues[i])
      {
        return true;
      }
  }
  return false;
}

function configString (element) {
    const locale         = (element.dataset.locale || 'it_IT').trim();
    const id             = (element.dataset.id || 'board').trim();
    const fen            = (element.dataset.fen || null).trim();
    const position       = (element.dataset.position || 'start').trim();
    const pieceStyle     = (element.dataset.pieceStyle || 'merida').trim(); // 'wikipedia', 'alpha', 'uscf' (all from chessboardjs), 'case', 'condal', 'maya', 'merida' (my favorite), 'leipzig' (all from ChessTempoViewer), and 'beyer' (from German chess books).
    const orientat       = (element.dataset.orientation || 'white').trim();
    const theme          = (element.dataset.theme || 'zeit').trim();
    const boardsize      = (element.dataset.boardsize || null).trim();
    const size           = (element.dataset.size || null).trim();
    const showcoords     = (Boolean(element.dataset.showcoords) || true).trim();
    const layout         = (element.dataset.layout || null).trim();
    const movesheight    = (element.dataset.movesheight || null).trim();
    const colormarker    = (element.dataset.colormarker || null).trim();
    const showresult     = (element.dataset.showresult || false).trim();
    const coordsinner    = (element.dataset.coordsinner || true).trim();
    const coordsfactor   = (element.dataset.coordsfactor || 1).trim();
    const startplay      = (element.dataset.startplay || null).trim();
    const headers        = (element.dataset.headers || true).trim();
    const notation       = (element.dataset.notation || null).trim();
    const notationlayout = (element.dataset.notationlayout || null).trim();
    const showfen        = (element.dataset.showfen || false).trim();
    const coordsfontsize = (element.dataset.coordsfontsize || null).trim();
    const timertime      = (element.dataset.timertime || null).trim();
    const width          = (element.dataset.width || '200px').trim();
    const hidemovesbefore= (element.dataset.hidemovesbefore || null).trim();


  const config = {"locale":locale,"pieceStyle":pieceStyle,"orientation":orientat,"theme":theme,"boardSize":boardsize,"width":size,"position":position,"fen":fen,"showCoords":showcoords,"layout":layout,"movesHeight":movesheight,"colorMarker":colormarker,"showResult":showresult,"coordsInner":coordsinner,"coordsFactor":coordsfactor,"startPlay":startplay,"headers":headers,"showResult":showresult,"notation":notation,"notationLayout":notationlayout,"showFen":showfen,"coordsFontSize":coordsfontsize,"timerTime":timertime,"width":width,"hideMovesBefore":hidemovesbefore};
  const non_string = {0:"headers",1:"showCoords",2:"coordsInner",3:"showFen",4:"hideMovesBefore",5:"showResult",6:"coordsFactor",7:"timerTime",8:"coordsFontSize"};
  var config_string = "";
  for(var key in config) {
    // instead of removeEmptyValues
    if (isEmpty(key)) {
      continue;
    }
    value = config[key];
    config_string += ", "+key+": ";
    if (inArray(key, non_string)) {
        config_string += value;
    } else {
        config_string += "'"+value+"'";
    }
  }
  return config_string;
}


// ****** //

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

    const pieceStyle = (config.pieceStyle || 'merida');
    const theme = (config.theme || 'falken');

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
