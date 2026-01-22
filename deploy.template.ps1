$ErrorActionPreference = "Stop"

# -------- Variables --------
$MESSAGE      = "Automated deployment"
$MAX_ATTEMPTS = 10
$SECONDS      = 1

$REMOTE = "origin"
$BRANCH = "main"

$USER    = ""
$HOST_    = "www.slcti.ca"
$APP_DIR = "~/source/resume"

$SERVICE = "resume.service"

# -------- Local Git --------
Write-Host "Committing changes..."

git add .

if (git status --porcelain) {
    git commit -m $MESSAGE
} else {
    Write-Host "No changes to commit"
}

git push $REMOTE $BRANCH

$LocalCommit = git rev-parse HEAD

# -------- Wait for Remote --------
Write-Host "Waiting for remote update..."

$Attempt = 0
do {
    Start-Sleep -Seconds $SECONDS
    $RemoteCommit = (git ls-remote $REMOTE "refs/heads/$BRANCH").Split("`t")[0]
    $Attempt++
} while ($RemoteCommit -ne $LocalCommit -and $Attempt -lt $MAX_ATTEMPTS)

if ($RemoteCommit -ne $LocalCommit) {
    throw "Remote did not update"
}

Write-Host "Remote updated"

# -------- Remote Deploy --------
Write-Host "Deploying on server..."

ssh "$USER@$HOST_" @'
cd ~/source/resume || exit 1

echo "Updating code..."
git fetch origin
git reset --hard origin/main

echo "Installing dependencies..."
npm install

echo "Cleaning build artifacts..."
rm -rf .next .cache dist tmp || true

echo "Restarting service..."
systemctl daemon-reload
systemctl restart resume.service
systemctl status resume.service --no-pager
'@

Write-Host "Deployment complete"
