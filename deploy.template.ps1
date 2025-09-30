# Usage: .\deploy.ps1

# Variables
[string] $MESSAGE = "Automated deployment"
[int] $MAX_ATTEMPT = 10
[int] $SECONDS = 1
[string] $REMOTE = "origin"
[string] $BRANCH = "main"
[string] $USER = ""
[string] $HOST_ = "www.slcti.ca"
[string] $DIRECTORY = "~/source/resume"
[string] $PASSWORD = ""
[string] $COMMAND = "resume.service"

# Local Git Commands
git add .
git commit -m "$MESSAGE"
git push

# Pause
[int] $Attempt = 0

do {
    Start-Sleep -Seconds $SECONDS
    $RemoteCommitLine = git ls-remote $REMOTE "refs/heads/$BRANCH"
    $RemoteCommit = $RemoteCommitLine.Split("`t")[0]
    $Attempt ++

    if ($RemoteCommit -eq $LocalCommit) {
        break
    }

} while ($Attempt -lt $MAX_ATTEMPT)

# Remote SSH Deployment Commands
ssh "$USER@$HOST_" @"
cd $DIRECTORY &&
git fetch origin &&
git reset --hard origin/main &&
git pull &&
npm install &&
npm audit fix --force &&
rm -rf .next .cache dist tmp 2>/dev/null || true &&
echo \"$PASSWORD\" | sudo -S systemctl daemon-reload &&
echo \"$PASSWORD\" | sudo -S systemctl restart \"$COMMAND\" &&
echo \"$PASSWORD\" | sudo -S systemctl status \"$COMMAND\" --no-pager
"@
