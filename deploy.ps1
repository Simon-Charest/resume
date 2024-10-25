git add *
git commit -m "Dev"
git push
ssh simonchares@slcti.8bit.ca "cd ~/source/resume && git pull && sudo systemctl daemon-reload && sudo systemctl restart resume.service"
