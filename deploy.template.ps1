# Usage: .\deploy.ps1

# Variables
[string] $MESSAGE = "Automated deployment"
[string] $REMOTE = "origin"
[string] $BRANCH = "main"
[string] $USER = ""
[string] $HOST_ = ""
[string] $DIRECTORY = ""
[string] $COMMAND = ""

# Local Git Commands
git add .
git commit -m "$MESSAGE"
git push

# Pause
$Attempt = 0

do {
    Start-Sleep -Seconds $DelaySeconds
    $RemoteCommitLine = git ls-remote $REMOTE "refs/heads/$BRANCH"
    $RemoteCommit = $RemoteCommitLine.Split("`t")[0]
    $Attempt++
    Write-Host "Tentative $Attempt/$MaxAttempts → Commit distant : $RemoteCommit"

    if ($RemoteCommit -eq $LocalCommit) {
        break
    }

} while ($Attempt -lt $MaxAttempts)

# Remote SSH Deployment Commands
ssh "$USER@$HOST_" @"
cd $DIRECTORY &&
git fetch origin &&
git reset --hard origin/main &&
git pull &&
npm install &&
npm audit fix --force &&
npm run build &&
sudo systemctl daemon-reload &&
sudo systemctl restart $COMMAND
"@
