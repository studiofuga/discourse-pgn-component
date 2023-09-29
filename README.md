## discourse-pgn theme component

Adds an interactive chessboard that can displays PGN files.

It's based on [PgnViewerJS](https://mliebelt.github.io/PgnViewerJS/), a JavaScript component that can display PGNs on webpages.

### Installation

This is a theme component, so you just need to upload it in the administration page of your Discourse and activate it on your theme.

At the moment, due to a limitation of the JS component, you must add `'unsafe-eval'` (note the apexes) on "content_security_policy_script_src" setting from your Administration settings page. It has not yet been fixed, and if you are confortable with this security setting, please do not use this component.

### Usage

This component can be used on post by adding a code block with the `pgn` language setting. A single configuration string can be added to modify the appearance and behaviour of the component.

For example:

    ```pgn config=theme:green;piece-style=maya
    1. e4 e5 2. Nf3 Nc6
    ```

