#! /bin/bash

gulp build

forever stopall
./scripts/copy-certs.sh

NODE_ENV=production forever start ./dist/server/Server.js

forever logs 0