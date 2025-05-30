#!/bin/bash

# Usage: ./deploy.sh https://github.com/yourusername/yourrepo.git

if [ -z "$1" ]; then
  echo "Please provide your GitHub repo URL."
  exit 1
fi

git init
git add .
git commit -m "Initial commit - automated deploy"
git remote add origin "$1"
git branch -M main
git push -u origin main

echo "Code pushed to $1"
echo "Now, login to Vercel and import your repo."
