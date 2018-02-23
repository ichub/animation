#!/usr/bin/env bash

letsencrypt certonly --webroot -w ./static -d ivanchub.com
