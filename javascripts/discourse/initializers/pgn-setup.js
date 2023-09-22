import loadScript from "discourse/lib/load-script";
import { withPluginApi } from "discourse/lib/plugin-api";

{/* <script src="../../pgn-viewer/lib/dist.js" type="text/discourse-plugin" version="0.8" ></script> */}
// babel: { compact: true }

/**
 #### place here the import of the actual viewer?
 #### import TinyTOTP from "../vendor/tiny-totp";


 ##What I want
 [wrap=discourse-pgn locale='it' pieceStyle='wikipedia']
 1. f4 e6 2. g4 Qh4#
 [/wrap]
 **/
function Parser(element) {
    //## alternative for default values?
    //const PgnBaseDefaults = { locale: 'fr', width: '400px', pieceStyle: 'merida' };

    //## read element dataset
    const game = element.textContent;

    // new feature!
    const gameClean = cleanup_pgnv(game);

    // NOTE: create all params with default
    const id         = (element.dataset.id || 'board');
    const pieceStyle = (element.dataset.pieceStyle || 'merida');

    // alternative to have default + reading input
    let locale = 'fr'
    if ("locale" in element.dataset) {
      // data attribute exist
      locale = element.dataset.locale;
    }

    //...

    //## do the print of read value param - OK!
    // element.innerHTML = `<div><p><strong> element.textContent + ' ' + ${param} <\strong><\p></div>`;

    //## do the print of dafault value id/locale/pieceStyle - OK!
    //element.innerHTML = `<div><p><strong> ${game} + ' ' + ${pieceStyle} + ' ' + ${id} + ' ' + ${locale} + ${gameClean}<\strong><\p></div>`;
    // <div> ${game} + ' ' + ${pieceStyle} + ' ' + ${id} + ' ' + ${locale} + ${gameClean}</div>;

    // ## Now is missing the part reading inside the wrap tag and assign the values to game variable - OK!
    // # game = element.textContent    ## ??


    // NOTE: will add then pgnBoard, pgnPrint, pgnEdit. Each bbcode will invoke different mode.
    // var mode = 'pgnView'

    // final (1st try)?

    // this should be result of configString()
    // const parms = { "pgn": gameClean,
    //                 "pieceStyle": pieceStyle
    //               }
    // const renderer = new PGNV.pgnView(id, parms);
    // element.innerHTML = `<div class='pgn-code'>${renderer}</div>`;

    // final (alt.)?
    // element.innerHTML = `<div class='pgn-code'>PGNV.${mode}(${id}, {pgn: ${gameClean}, pieceStyle: ${pieceStyle}})</div>`;
    // element.innerHTML = `<div class='pgn-code'>PGNV.pgnView(${id}, {pgn: ${gameClean}, pieceStyle: ${pieceStyle}})</div>`;

    element.innerHTML = `<script type='text/javascript' id='pgn-code-board'>var game='${gameClean}'; PGNV.pgnView('board',{pgn: game, pieceStyle: 'merida'});</script><div id="board" style="width: 400px"></div>`;

    /**
    ## example of final string:
    ## var game = "1. f4 e6 2. g4 Qh4#";
    ## PGNV.pgnView('board', {pgn: game, pieceStyle: 'merida'});


    ## missing the div reference to external script? or just do import PGNV and invoke that here?
    # PGNV.pgnView(${id}, {pgn: ${game}, .... });


    ## NOTE: in the future different warp for different functions, e.g PGNV.pgnEdit and so on.
    ##       then a single function will parse the correct code and invoke correct functions.
    ## NOTE2: one of the next stps will be creation of BBcode that will do the wrapping by itself


    ## dataset shall write HTML code like this:
    # <div id="board" style="width: 400px"></div>



    ## Note, the parameters can be either placed in <div xxx > or can be forwarded to pgnViewer directly
    ## example:
    ## let pgn = "1. e4 e5 2. Nf3 (2. f4 d5 3. exd5 e4) 2... Nc6 3. Bc4 Nf6";
    ## const PgnBaseDefaults = { locale: 'fr', width: '400px', pieceStyle: 'alpha' }
    ## PGNV.pgnView('board1', { pgn: pgn});
    ## PGNV.pgnView('board2', {pgn: pgn, locale: 'de'});
    ## PGNV.pgnView('board3', {pgn: pgn, locale: 'en', pieceStyle: 'merida'});
    ## PGNV.pgnView('board4', {pgn: pgn, width: '300px'});
    ##
    ## to create this HTML code:
    ## <div id="board1"></div><div id="board2"></div><div id="board3"></div><div id="board4"></div>

    ## NOTE: add the locales too (basic ones at least BUT NOT the gz!!!!)

    **/
}

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

async function attachPgn(elem, helper) {
  await loadScript(settings.theme_uploads_local.pgnviewer_js);
  elem.querySelectorAll("div[data-wrap=discourse-pgn]").forEach(Parser);
}

function initialize(api) {
  api.decorateCookedElement(attachPgn, { id: "discourse-pgn" });
}

export default {
  name: "discourse-pgn",

  initialize() {
    withPluginApi("0.8.28", initialize);
  },
};
