#!/bin/bash
mkdir ./node_modules/docdash/
cp -r ./jsish/docs_template/* ./node_modules/docdash/
cp -r ./jsish/ish*.js ./jsish/docs_template/static/scripts/ish/
jsdoc ./jsish/ish*.js -c ./node_modules/docdash/jsdoc.json
rm -R ./jsish/docs/*
cp -r ./out/* ./jsish/docs/
rm -R ./out
