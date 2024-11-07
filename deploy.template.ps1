#!/bin/bash

<#
Prerequisites:

# Generate key
ssh-keygen -t rsa -b 4096 -C "USERNAME"

# Add key to agent
ssh-add $env:USERPROFILE\.ssh\id_rsa

# Append key to the authorized_keys
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh USERNAME@HOST "cat >> ~/.ssh/authorized_keys"

# Connect to web server
ssh USERNAME@HOST

# Grant permissions
chmod 700 ~/.ssh 
chmod 600 ~/.ssh/authorized_keys

# Grant the user permission to run the specified systemctl commands without needing to enter their password
sudo visudo
USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload, /bin/systemctl restart resume.service

# Disconnect from web server
exit

Usage: .\deploy.ps1
#>

[string] $USER=""
[string] $HOST_=""
[string] $DIRECTORY=""

# Local Git Commands
git add *
git commit -m "Automated deployment"
git push

# Remote SSH Deployment Commands
ssh $USER@$HOST_ "
cd ~/source/resume &&
git pull &&
npm install &&
sudo chown -R ${$USER}:$USER $DIRECTORY &&
sudo chmod -R 755 $DIRECTORY &&
sudo systemctl daemon-reload &&
sudo systemctl restart resume.service"
