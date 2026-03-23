# GitHub Setup Instructions

## Step 1: Configure Git Identity

Run these commands to set your git name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `polymatch`
3. Description: "Tinder for Polymarket bets - Swipe YES/NO on trending markets"
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 3: Push to GitHub

```bash
cd /Users/sergey/Documents/crypto/polymatch

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/polymatch.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Create Pull Request

Since this is the initial commit, the PR is essentially the main branch itself. However, if you want to create a PR for future development:

1. Go to your repo on GitHub
2. Click "Branches" 
3. Click "New branch" from main
4. Make changes on that branch
5. Click "Pull requests" → "New pull request"

## For This Initial Code Review

You can create a draft PR to track the initial development:

1. Create a branch: `git checkout -b feature/initial-api-layer`
2. Push it: `git push -u origin feature/initial-api-layer`
3. Go to GitHub and create a PR from that branch to main

## Verify Files

After pushing, verify these files are on GitHub:

- [ ] `src/api/polymarket.ts` - Polymarket API client
- [ ] `src/api/tron.ts` - Tron wallet API client  
- [ ] `src/api/gameLogic.ts` - Game state management
- [ ] `src/types/index.ts` - TypeScript types
- [ ] `__tests__/gameLogic.test.ts` - Game logic tests
- [ ] `__tests__/tron.test.ts` - Tron API tests
- [ ] `__tests__/polymarket.test.ts` - Polymarket API tests
- [ ] `docs/API.md` - API documentation
- [ ] `docs/UML.md` - UML diagrams
- [ ] `README.md` - Project readme

## Next Steps After PR Acceptance

Once you've reviewed and accepted the initial API layer:

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Start dev server: `npm start`
4. Continue with UI development
