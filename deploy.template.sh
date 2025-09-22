#!/bin/bash

# Usage: ./deploy.sh

# Variables
MESSAGE="Automated deployment"
USER=""
HOST_=""
DIRECTORY=""
COMMAND=""

# Local Git Commands
git add *
git commit -m "$MESSAGE"
git push

# Remote SSH Deployment Commands
ssh "$USER@$HOST_" "
cd $DIRECTORY &&
git reset --hard origin/main &&
git pull &&
npm install &&
npm audit fix &&
sudo systemctl daemon-reload &&
sudo systemctl restart $COMMAND"
