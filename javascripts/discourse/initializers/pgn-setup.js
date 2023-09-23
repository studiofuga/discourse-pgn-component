import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";
import { getRegister } from "discourse-common/lib/get-owner";
import WidgetGlue from "discourse/widgets/glue";

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

function parseParameters(element, boardname) {
    //## alternative for default values?
    //const PgnBaseDefaults = { locale: 'fr', width: '400px', pieceStyle: 'merida' };

    //## read element dataset
    const game = element.textContent;

    // new feature!
    const gameClean = cleanup_pgnv(game);

    // NOTE: create all params with default
    const id         = (element.dataset.id || boardname);
    const pieceStyle = (element.dataset.pieceStyle || 'merida');

    console.log("Attrs: boardname = ", boardname);
    console.log("Game: ", game);
    console.log("GameClean: ", gameClean);

    // TODO fill attrs with parameters found above.
    // Use the parseParameters above?
    return {
      game: gameClean
    };
}

function createContainer(elem, boardname) {
  elem.innerHTML = "";
  const placeholder = document.createElement("div");
  placeholder.id = boardname;
  elem.appendChild(placeholder);

  console.log("Placeholder: " + placeholder.innerHTML);

  return placeholder;
  //element.innerHTML = `<div id="board" style="width: 400px"></div>`;
}


function initialize(api) {
  let _glued = [];

  function cleanUp() {
    _glued.forEach(g => g.cleanUp());
    _glued = [];
  }

  const register = getRegister(api);
  function attachWidget(container, attrs) {
    const glue = new WidgetGlue(
      "pgnviewer-widget",
      register,
      attrs
    );
    glue.appendTo(container);
    _glued.push(glue);
  }

  api.decorateCooked(($cooked, postWidget) => {
    const nodes = $cooked[0].querySelectorAll(
      "div[data-wrap=discourse-pgn]"
    );


    let dataId = 0;
    if (postWidget) {
      const postAttrs = postWidget.widget.attrs;
      dataId = postAttrs.id;
      console.log("postWidget.id: ", dataId);
    };

    let wcount = 1;

    function generateBaseName(id) {
      ++wcount;      
      return "board-" + dataId + "-" + wcount;
    }

    nodes.forEach((elem, dataId, wcount) => {
      let boardname = generateBaseName(dataId);
      console.log("BoardName: " + boardname);
      var attrs = parseParameters(elem, boardname);
      var container = createContainer(elem, boardname);
      attrs.boardname = boardname;
      attachWidget(container, attrs);
    });

  }, { id: "discourse-pgn" });

  api.cleanupStream(cleanUp);
}

export default {
  name: "discourse-pgn",

  initialize() {
    withPluginApi("0.8.28", initialize);
  },
};
