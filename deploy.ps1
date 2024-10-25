$sudoPassword = "sC941gsv#"

git add *
git commit -m "Dev"
git push

ssh scharest@slcti.8bit.ca "cd ~/source/resume && git pull && echo $sudoPassword | sudo -S systemctl daemon-reload && echo $sudoPassword | sudo -S systemctl restart resume.service"
