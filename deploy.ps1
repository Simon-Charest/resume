<#
Prerequisites:

# Generate key
ssh-keygen -t rsa -b 4096 -C "scharest"

# Add key to agent
ssh-add C:\Users\simon\.ssh\id_rsa

# Append key to the authorized_keys
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh scharest@slcti.8bit.ca "cat >> ~/.ssh/authorized_keys"

# Connect to web server
ssh scharest@slcti.8bit.ca

# Grant permissions
chmod 700 ~/.ssh 
chmod 600 ~/.ssh/authorized_keys

# Grant the user permission to run the specified systemctl commands without needing to enter their password
sudo visudo
scharest ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload, /bin/systemctl restart resume.service

# Disconnect from web server
exit

Usage: .\deploy.ps1
#>

git add *
git commit -m "Automated deployment"
git push
ssh scharest@slcti.8bit.ca "cd ~/source/resume && git pull && sudo systemctl daemon-reload && sudo systemctl restart resume.service"
