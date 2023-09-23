import I18n from "I18n";
import { h } from "virtual-dom";
import { emojiUnescape } from "discourse/lib/text";
import RawHtml from "discourse/widgets/raw-html";
import { createWidget } from "discourse/widgets/widget";

import PGNV from "../lib/dist";

createWidget("pgnviewer-widget", {
  tagName: "div.pgn",
  buildKey: (attrs) => `dice-result-${attrs.postId}-${attrs.rollId}`,

  html(attrs) {
  	var pgnv = new PGNV;
    var pgnwidget = pgnv.pgnView('board', {
      pgn: game,
      pieceStyle: 'merida'
    });

  	/*
    let errors = attrs.errors;
    if (errors && errors.length > 0) {
      const warningEmojiHtml = emojiUnescape(":warning:");
      return errors.map(e => {
        const i18nAttrs = {
          input: attrs.rawInput,
        };
        if (e === "dice.excessive.quantity") {
          i18nAttrs.count = settings.max_dice;
        }
        return h("div.dice-err-input", [
          new RawHtml({html: warningEmojiHtml}),
          " ",
          h("span.dice-err-msg", {}, I18n.t(themePrefix(e), i18nAttrs)),
        ]);
      });
    }

    const dieEmojiHtml = emojiUnescape(":game_die:");
    if (attrs.rawResults) {
      return [
        h("div.dice-input-explain", [
          new RawHtml({html: dieEmojiHtml}),
          " ",
          h("span.dice-input", renderDiceInput(attrs)),
        ]),
        renderDiceResults(attrs),
      ];
    } else {
      return [
        h("div.dice-input-explain", [
          new RawHtml({html: dieEmojiHtml}),
          " ",
          h("span.dice-input", renderDiceInput(attrs)),
        ]),
      ];
    };*/
  },
});