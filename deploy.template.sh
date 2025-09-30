#!/bin/bash

# Usage: ./deploy.sh

# Variables
MESSAGE="Automated deployment"
REMOTE="origin"
BRANCH="main"
USER=""
HOST_=""
DIRECTORY=""
COMMAND=""

# Local Git Commands
git add .
git commit -m "$MESSAGE"
git push

# Sleep
LATEST_COMMIT=$(git rev-parse HEAD)

for i in {1..10}; do
    REMOTE_COMMIT=$(git ls-remote $REMOTE refs/heads/$BRANCH | cut -f1)

    if [ "$LATEST_COMMIT" == "$REMOTE_COMMIT" ]; then
        break
    fi

    sleep 1
done

# Remote SSH Deployment Commands
ssh "$USER@$HOST_" 'bash -c "
cd '"$DIRECTORY"' &&
git fetch origin &&
git reset --hard origin/main &&
git pull &&
npm install &&
npm audit fix --force &&
rm -rf .next .cache dist tmp 2>/dev/null || true &&
echo \"$SUDO_PASSWORD\" | sudo -S systemctl daemon-reload &&
echo \"$SUDO_PASSWORD\" | sudo -S systemctl restart \"$COMMAND\" &&
echo \"$SUDO_PASSWORD\" | sudo -S systemctl status \"$COMMAND\" --no-pager
"'
