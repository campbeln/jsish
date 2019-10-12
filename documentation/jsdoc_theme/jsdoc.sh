#!/bin/bash
rm -R ./out
jsdoc core/ish.js -c node_modules/docdash/jsdoc.json
