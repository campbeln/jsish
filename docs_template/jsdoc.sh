#!/bin/bash
cp -r ./core/docs_template/* ./node_modules/docdash/
jsdoc ./core/ish*.js -c ./node_modules/docdash/jsdoc.json
rm -R ./core/docs/*
cp -r ./out/* ./core/docs/
rm -R ./out
