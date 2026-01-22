# ==========================
# Automated Deployment Script
# Usage: .\deploy.ps1
# ==========================

$ErrorActionPreference = "Stop"

# -------- Variables --------
$MESSAGE      = "Automated deployment"
$MAX_ATTEMPTS = 10
$SECONDS      = 1

$REMOTE   = "origin"
$BRANCH   = "main"

$USER     = ""
$HOST     = "www.slcti.ca"
$APP_DIR  = "~/source/resume"

$SERVICE  = "resume.service"

# -------- Local Git --------
Write-Host "📦 Committing changes..."

git add .

if (-not (git status --porcelain)) {
    Write-Host "✔ No changes to commit"
}

else {
    git commit -m $MESSAGE
}

git push $REMOTE $BRANCH

$LocalCommit = git rev-parse HEAD

# -------- Wait for Remote --------
Write-Host "⏳ Waiting for remote to update..."

$Attempt = 0
do {
    Start-Sleep -Seconds $SECONDS
    $RemoteCommit = (git ls-remote $REMOTE "refs/heads/$BRANCH").Split("`t")[0]
    $Attempt++
} while ($RemoteCommit -ne $LocalCommit -and $Attempt -lt $MAX_ATTEMPTS)

if ($RemoteCommit -ne $LocalCommit) {
    throw "❌ Remote did not update after $MAX_ATTEMPTS attempts"
}

Write-Host "✔ Remote updated"

# -------- Remote Deploy --------
Write-Host "🚀 Deploying on server..."

ssh "$USER@$HOST" @"
set -e

cd $APP_DIR

echo "📥 Updating code..."
git fetch origin
git reset --hard origin/$BRANCH

echo "📦 Installing dependencies..."
npm install

echo "🧹 Cleaning build artifacts..."
rm -rf .next .cache dist tmp || true

echo "🔄 Restarting service..."
sudo systemctl daemon-reload
sudo systemctl restart $SERVICE
sudo systemctl status $SERVICE --no-pager
"@

Write-Host "✅ Deployment complete!"
