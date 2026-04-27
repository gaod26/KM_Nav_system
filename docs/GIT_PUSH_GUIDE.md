# How to Commit and Push Frontend Changes to GitHub

## Quick Commands

```bash
# Navigate to your project
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE

# Check what files have changed
git status

# Add all changed files
git add .

# Commit with a descriptive message
git commit -m "Add multi-floor navigation support with enhanced UI features"

# Push to GitHub
git push origin main
```

## Detailed Steps

### Step 1: Check Current Status
```bash
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE
git status
```
This shows which files have been modified.

### Step 2: Review Changes (Optional)
```bash
git diff
```
This shows the actual changes made to files.

### Step 3: Add Files to Staging
```bash
# Add all files
git add .

# OR add specific files
git add src/data/floor1.nodes.json
git add src/data/floor1.edges.json
git add src/services/graphStore.js
git add src/routes/route.js
git add gabi_code/src/components/FloorMap/FloorMap.jsx
git add gabi_code/src/components/RouteDisplay/DirectionsList.jsx
git add gabi_code/src/components/Controls/FloorSwitcher.jsx
git add gabi_code/src/components/RouteDisplay/DirectionsList.css
git add gabi_code/src/components/Controls/FloorSwitcher.css
git add MULTI_FLOOR_UPDATE.md
git add START_INSTRUCTIONS.md
git add GIT_PUSH_GUIDE.md
```

### Step 4: Commit Changes
```bash
git commit -m "Add multi-floor navigation support

- Replace floor1 data files with combined multi-floor data (115+ nodes, 767 edges)
- Update graphStore.js to support unified graph for cross-floor routing
- Enable cross-floor routing in route.js endpoint
- Add visual indicators for floor transitions (purple theme)
- Implement multi-floor route badge in FloorSwitcher
- Add floor transition highlighting in directions (🔄 icon)
- Update FloorMap to display per-floor route segments
- Add transition node highlighting (purple dashed circles)
- Include comprehensive documentation (MULTI_FLOOR_UPDATE.md)
- Add startup instructions (START_INSTRUCTIONS.md)"
```

### Step 5: Push to GitHub
```bash
git push origin main
```

If you're on a different branch:
```bash
# Check current branch
git branch

# Push to your branch
git push origin your-branch-name
```

## If You Haven't Set Up Git Yet

### First Time Setup
```bash
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE

# Configure Git (if not done already)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository (if not already initialized)
git init

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/kirby-manchester-frontend.git

# Check remote
git remote -v
```

### If Repository Already Exists
```bash
# Pull latest changes first (recommended)
git pull origin main

# Then add, commit, and push as shown above
```

## Common Issues

### Authentication Error
If you get a password/authentication error:
```bash
# Use Personal Access Token instead of password
# Or set up SSH keys (recommended)
git remote set-url origin git@github.com:yourusername/kirby-manchester-frontend.git
```

### Merge Conflicts
If there are conflicts:
```bash
# Pull and merge
git pull origin main

# Resolve conflicts in files
# Then commit and push
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Branch Issues
If you need to create/switch branches:
```bash
# Create new branch
git checkout -b feature/multi-floor-navigation

# Switch to existing branch
git checkout main

# Push new branch
git push -u origin feature/multi-floor-navigation
```

## Files Changed in This Update

### Backend:
- `src/data/floor1.nodes.json` (Combined multi-floor data)
- `src/data/floor1.edges.json` (Combined multi-floor edges)
- `src/services/graphStore.js` (Unified graph support)
- `src/routes/route.js` (Cross-floor routing enabled)

### Frontend:
- `gabi_code/src/components/FloorMap/FloorMap.jsx`
- `gabi_code/src/components/RouteDisplay/DirectionsList.jsx`
- `gabi_code/src/components/RouteDisplay/DirectionsList.css`
- `gabi_code/src/components/Controls/FloorSwitcher.jsx`
- `gabi_code/src/components/Controls/FloorSwitcher.css`

### Documentation:
- `MULTI_FLOOR_UPDATE.md` (Technical documentation)
- `START_INSTRUCTIONS.md` (How to run the system)
- `GIT_PUSH_GUIDE.md` (This file)

## Summary Command
```bash
cd /Users/gabi/Documents/kirby-manchester-frontend/CSC631-AG-SE && \
git add . && \
git commit -m "Add multi-floor navigation support with enhanced UI features" && \
git push origin main
```

This combines all steps into one command!
