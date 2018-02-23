#!/usr/bin/env bash

ssh root@ivanchub.com << EOF
    source ~/.bashrc
    \. "/root/.nvm/nvm.sh"
    cd personal2
    ssh-agent bash -c 'ssh-add ~/.ssh/github-ivanchub-com; git pull git@github.com:ichub/personal2'
    ./scripts/start.sh
EOF