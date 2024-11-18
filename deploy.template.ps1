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
USERNAME ALL=(ALL) NOPASSWD: /bin/chmod
USERNAME ALL=(ALL) NOPASSWD: /bin/chown
USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload, /bin/systemctl restart resume.service

# Change user permissions on solution directory structure
sudo chown -R ${$USER}:$USER $DIRECTORY &&
sudo chmod -R 755 $DIRECTORY &&

# Enable VPN
sudo openvpn --config /etc/openvpn/ca.protonvpn.udp.ovpn --auth-user-pass /etc/openvpn/ca.protonvpn.udp.txt

# Disabled VPN
sudo systemctl stop openvpn@client

# Request a certificate from Let's Encrypt
sudo certbot certonly --webroot -w ~/source/resume/public -d DOMAIN

# Set up automatic renewal
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null

# Disconnect from web server
exit

Usage: .\deploy.ps1
#>

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
git pull &&
npm install &&
sudo systemctl daemon-reload &&
sudo systemctl restart $COMMAND"
