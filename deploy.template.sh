#!/bin/bash

# Usage: ./deploy.sh

# Variables
MESSAGE="Automated deployment"
USER=""
HOST_=""
DIRECTORY=""
COMMAND=""

# Local Git Commands
git add .
git commit -m "$MESSAGE"
git push

# Pause
sleep 2

# Remote SSH Deployment Commands
ssh "$USER@$HOST_" 'bash -c "
cd '"$DIRECTORY"' &&
git fetch origin &&
git reset --hard origin/main &&
git pull &&
npm install &&
npm audit fix --force &&
npm run build &&
sudo systemctl daemon-reload &&
sudo systemctl restart '"$COMMAND"' &&
sudo systemctl status '"$COMMAND"' --no-pager
"'