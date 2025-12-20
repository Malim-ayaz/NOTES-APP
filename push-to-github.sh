#!/bin/bash

# Script to push notes-app to GitHub
# Make sure you've created the repository on GitHub first!

REPO_NAME="notes-app"
USERNAME="Malim-ayaz"

echo "🚀 Preparing to push to GitHub..."
echo ""
echo "Repository: https://github.com/${USERNAME}/${REPO_NAME}"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "Remote 'origin' already exists. Updating..."
    git remote set-url origin https://github.com/${USERNAME}/${REPO_NAME}.git
else
    echo "Adding remote 'origin'..."
    git remote add origin https://github.com/${USERNAME}/${REPO_NAME}.git
fi

# Ensure we're on main branch
git branch -M main

echo ""
echo "📤 Pushing to GitHub..."
echo "You'll be prompted for credentials:"
echo "  Username: ${USERNAME}"
echo "  Password: Use a Personal Access Token (not your GitHub password)"
echo ""
echo "To create a token: https://github.com/settings/tokens"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository URL: https://github.com/${USERNAME}/${REPO_NAME}"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Repository exists on GitHub: https://github.com/${USERNAME}/${REPO_NAME}"
    echo "2. You're using a Personal Access Token (not password)"
    echo "3. Token has 'repo' permissions"
fi

