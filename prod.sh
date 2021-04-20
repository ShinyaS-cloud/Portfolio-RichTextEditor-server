#!/usr/bin/bash
rm ormconfig.json && cp ../ormconfig.json ormconfig.json && rm -rf src/config && cp -r ../config src/config
