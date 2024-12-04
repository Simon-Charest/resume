#!/bin/bash

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
git pull &&
npm install &&
sudo systemctl daemon-reload &&
sudo systemctl restart $COMMAND"
