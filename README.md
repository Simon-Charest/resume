# Resume
A corporate website, including a resume, created from scratch using Node.js.

## Usage
1. Install and configure prerequisites ([Node.js](https://nodejs.org/en/download)):
```bash
sudo apt install nodejs npm
npm install package.json
npm audit fix --force
sudo ufw allow 3000
sudo ufw enable
```
```powershell
. "C:\Program Files\nodejs\npm" install package.json
. "C:\Program Files\nodejs\npm" audit fix --force
. "C:\Program Files\nodejs\node" src/server.js
```
2. Run Node.js solution:
```bash
node src/server.js
```
```powershell
. "C:\Program Files\nodejs\node" src/server.js
```
3. Open solution: [https://localhost:3000/](https://localhost:3000/).

## Documentation
### Prerequisites

#### Generate key
```bash
ssh-keygen -t rsa -b 4096 -C "USERNAME"
```

#### Add key to agent
```bash
ssh-add $env:USERPROFILE\.ssh\id_rsa
```

#### Append key to the authorized_keys
```bash
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh USERNAME@HOST "cat >> ~/.ssh/authorized_keys"
```

#### Connect to web server
```bash
ssh USERNAME@HOST
```

#### Grant permissions
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### Grant the user permission to run the specified systemctl commands without needing to enter their password
```bash
sudo visudo
USERNAME ALL=(ALL) NOPASSWD: /bin/chmod
USERNAME ALL=(ALL) NOPASSWD: /bin/chown
USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload, /bin/systemctl restart resume.service
```

#### Change user permissions on solution directory structure
```bash
sudo chown -R ${$USER}:$USER $DIRECTORY &&
sudo chmod -R 755 $DIRECTORY &&
```

#### Enable VPN
```bash
sudo openvpn --config /etc/openvpn/ca.protonvpn.udp.ovpn --auth-user-pass /etc/openvpn/ca.protonvpn.udp.txt
```

#### Disabled VPN
```bash
sudo systemctl stop openvpn@client
```

#### Request a certificate from Let's Encrypt
```bash
sudo certbot certonly --webroot -w ~/source/resume/public -d DOMAIN
```

#### Set permissions for certificates
```bash
sudo usermod -aG ssl-cert LOGIN
sudo chgrp ssl-cert /etc/letsencrypt/archive/DOMAIN/*.pem
sudo chmod 640 /etc/letsencrypt/archive/DOMAIN/privkey1.pem
sudo chmod 755 /etc/letsencrypt/archive/DOMAIN/cert1.pem /etc/letsencrypt/archive/DOMAIN/chain1.pem /etc/letsencrypt/archive/DOMAIN/fullchain1.pem
```

#### Set up automatic renewal
```bash
echo "0 0,12 * * * root /opt/certbot/bin/python -c 'import random; import time; time.sleep(random.random() * 3600)' && sudo certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
```

#### Disconnect from web server
```bash
exit
```

## Contact
### SLCIT
- Simon Charest, Founder and CEO :
    - [Website](https://www.slcti.ca/);
    - [LinkedIn](https://www.linkedin.com/in/simoncharest/);
    - [Gmail](mailto:simoncharest@gmail.com);
    - [GitHub](https://github.com/Simon-Charest/).

## Acknowledgments
- [ChatGPT](https://chat.openai.com/).
