# Usage: .\deploy.ps1

# Variables
[string] $MESSAGE = "Automated deployment"
[string] $USER = ""
[string] $HOST_ = ""
[string] $DIRECTORY = ""
[string] $COMMAND = ""

# Local Git Commands
git add .
git commit -m "$MESSAGE"
git push

# Pause
Start-Sleep -Seconds 2

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
