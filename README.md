## discourse-pgn theme component

Adds an interactive chessboard that can displays PGN files.

It's based on [<!--PgnViewer-->](https://github.com/mliebelt/pgn-viewer), a JavaScript component that can display PGNs on webpages.

### Installation

This is a theme component, so you just need to upload it in the administration page of your Discourse and activate it on your theme.

At the moment, due to a limitation of the JS component, you must add `'unsafe-eval'` (note the apexes) on "content_security_policy_script_src" setting from your Administration settings page. It has not yet been fixed, and if you are confortable with this security setting, please do not use this component.

### Usage

This component can be used on post by adding a code block with the `pgn` language setting. A single configuration string can be added to modify the appearance and behaviour of the component.

For example:

    ```pgn config=theme:green;piece-style=maya
    1. e4 e5 2. Nf3 Nc6
    ```

### Block parameters

The component can be configured on a per-block bases. A single parameter `config` can be specified in the pgn code block, with a strict format.

The config string is a set of key/value pairs separated by ";". Key and Values are separated by ":".

The following keys are recognized:

- `theme`: the theme for chessboard to use. It can be one on the following list: green, zeit, informator, sportverlag, beyer, falken, blue

- `piece-style`: The style for the pieces. It can be one between: merida, case, wikipedia, alpha, uscf, condal, maya, leipzig

- `locale`: the locale for the moves, translated by the component.

- `orientation`: to rotate the board and set the black pieces on the bottom, set it to `black`, or `white` to have non rotated board.

See the PgnViewer site for further information.

