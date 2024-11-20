#!/bin/bash
command="resume.service"
sudo systemctl daemon-reload
sudo systemctl stop $command
sudo systemctl start $command
