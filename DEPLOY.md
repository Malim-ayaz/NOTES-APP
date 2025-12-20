# GitHub Deployment Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `notes-app` (or any name you prefer)
3. Description: "Full-stack Notes Application with authentication and CRUD operations"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these instead (already configured):

```bash
cd /Users/mragangjain/notes-app

# Add the remote repository (replace YOUR_USERNAME with Malim-ayaz and REPO_NAME with your repo name)
git remote add origin https://github.com/Malim-ayaz/notes-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
git remote add origin git@github.com:Malim-ayaz/notes-app.git
git branch -M main
git push -u origin main
```

## Authentication

When you push, GitHub will prompt for credentials:
- Username: `Malim-ayaz`
- Password: Use a **Personal Access Token** (not your GitHub password)

### Creating a Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "notes-app-deployment"
4. Select scopes: Check `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token and use it as your password when pushing

---

**Note:** The repository is already initialized and committed locally. You just need to create it on GitHub and push!

