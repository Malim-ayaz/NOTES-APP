#!/bin/bash

# This script creates a GitHub repository using the GitHub API
# You'll need a Personal Access Token with 'repo' scope

USERNAME="Malim-ayaz"
REPO_NAME="notes-app"
DESCRIPTION="Full-stack Notes Application with authentication and CRUD operations"

echo "🔐 GitHub Repository Creator"
echo ""
echo "To create the repository, you need a Personal Access Token."
echo ""
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Name it: 'notes-app-repo-creator'"
echo "4. Select scope: 'repo' (full control)"
echo "5. Click 'Generate token'"
echo "6. Copy the token"
echo ""
read -sp "Enter your Personal Access Token: " TOKEN
echo ""

if [ -z "$TOKEN" ]; then
    echo "❌ Token is required. Exiting."
    exit 1
fi

echo "📦 Creating repository on GitHub..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $TOKEN" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"$DESCRIPTION\",\"private\":false}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Repository created successfully!"
    echo "🌐 Repository URL: https://github.com/$USERNAME/$REPO_NAME"
    echo ""
    echo "📤 Now pushing code..."
    
    # Add remote and push
    if git remote get-url origin &>/dev/null; then
        git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git
    else
        git remote add origin https://github.com/$USERNAME/$REPO_NAME.git
    fi
    
    git branch -M main
    
    # Use token for push
    git push -u https://$TOKEN@github.com/$USERNAME/$REPO_NAME.git main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 View your repository: https://github.com/$USERNAME/$REPO_NAME"
    else
        echo ""
        echo "⚠️  Push failed. You can push manually using:"
        echo "   git push -u origin main"
    fi
elif [ "$HTTP_CODE" = "422" ]; then
    echo "⚠️  Repository might already exist. Trying to push anyway..."
    if git remote get-url origin &>/dev/null; then
        git remote set-url origin https://github.com/$USERNAME/$REPO_NAME.git
    else
        git remote add origin https://github.com/$USERNAME/$REPO_NAME.git
    fi
    git branch -M main
    git push -u https://$TOKEN@github.com/$USERNAME/$REPO_NAME.git main
else
    echo "❌ Failed to create repository. HTTP Code: $HTTP_CODE"
    echo "Response: $BODY"
    echo ""
    echo "Please create the repository manually at: https://github.com/new"
    echo "Then run: ./push-to-github.sh"
fi
