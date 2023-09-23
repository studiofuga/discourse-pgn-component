#!/bin/sh

OUTDIR="$1"

if [ "z$OUTDIR" = "z" ] ; then
	OUTDIR="."
fi

ZIP="$OUTDIR/discourse-pgn-component.zip"

if [ -r "$ZIP" ] ; then
	rm "$ZIP"
fi

zip -r "$ZIP" --exclude=.git/* --exclude=pack.sh .

