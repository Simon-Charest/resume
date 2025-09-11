# Usage: .\deploy.ps1

[string] $MESSAGE = "Automated deployment"
[string] $USER = ""
[string] $HOST_ = ""
[string] $DIRECTORY = ""
[string] $COMMAND = ""

# Local Git Commands
git add *
git commit -m $MESSAGE
git push

# Remote SSH Deployment Commands
ssh $USER@$HOST_ "
cd $DIRECTORY &&
git reset --hard origin/main &&
npm install &&
npm audit fix &&
sudo systemctl daemon-reload &&
sudo systemctl restart $COMMAND"
