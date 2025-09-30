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
    echo "✅ Commit trouvé sur le serveur distant."
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
npm run build &&
sudo systemctl daemon-reload &&
sudo systemctl restart '"$COMMAND"' &&
sudo systemctl status '"$COMMAND"' --no-pager
"'
