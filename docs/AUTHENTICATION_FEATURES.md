# Authentication & History Features

This document describes the new authentication and navigation history features integrated into the Kirby-Manchester Navigation frontend.

## Overview

The frontend now supports:
1. **User Authentication** - Register and login to create an account
2. **Navigation History** - Automatically save and view past routes (for logged-in users)
3. **Estimated Travel Time** - See how long each route will take

## Features

### 1. User Authentication

#### Registration
- Click **"Login / Register"** button in the header
- Toggle to **"Register"** mode
- Enter a username and password
- Click **"Register"** to create your account
- You'll be automatically logged in

#### Login
- Click **"Login / Register"** button in the header
- Enter your username and password
- Click **"Login"** to sign in
- Your session will persist for 7 days (JWT token)

#### Logout
- When logged in, click the **"Logout"** button in the header
- This will clear your authentication token

### 2. Navigation History

#### Automatic Saving
- When you're logged in, all routes you generate are automatically saved to your history
- No action needed - it happens in the background

#### Viewing History
- Click the **"📜 History"** button in the header (only visible when logged in)
- View all your past navigation routes
- See details like:
  - Origin and destination
  - Distance traveled
  - Estimated time
  - Preference used (stairs/elevator)
  - When you made the search

#### Reusing Past Routes
- Click on any history item to quickly reload that route
- The start location, destination, and preference will be automatically filled in
- Generate the route again to see the navigation

### 3. Estimated Travel Time

All route results now include an estimated travel time based on:
- **Walking speed**: ~250 feet per minute in hallways
- **Stairs**: ~15 seconds per floor change
- **Elevator**: ~20 seconds per floor change (includes wait time)

The estimated time appears in the directions panel alongside the distance.

## Technical Details

### Authentication Flow

1. **Token Storage**: JWT tokens are stored in `localStorage` with key `auth_token`
2. **User Info**: Username is stored in `localStorage` with key `auth_user`
3. **Token Expiry**: Tokens are valid for 7 days
4. **Auto-Logout**: If the token expires (401 response), the user is automatically logged out

### API Integration

#### Authentication Endpoints

**Register:**
```
POST /api/auth/register
Body: { username: string, password: string }
Response: { access_token: string, username: string }
```

**Login:**
```
POST /api/auth/login
Body: { username: string, password: string }
Response: { access_token: string, username: string }
```

#### History Endpoint

**Get History:**
```
GET /api/history?limit=20&offset=0
Headers: { Authorization: "Bearer <token>" }
Response: [
  {
    origin: string,
    destination: string,
    distance: number,
    preference: string,
    timestamp: string,
    estimated_time: {
      total_seconds: number,
      display: string
    }
  }
]
```

#### Route Endpoint (Updated)

The `/api/route` endpoint now includes `estimated_time` in the response:

```json
{
  "path": [...],
  "distance": 450.5,
  "directions": [...],
  "floors": {...},
  "estimated_time": {
    "total_seconds": 354,
    "display": "About 6 minutes"
  }
}
```

### New Components

1. **AuthModal** (`src/components/Auth/AuthModal.jsx`)
   - Handles login and registration UI
   - Switches between login/register modes
   - Form validation

2. **HistoryPanel** (`src/components/History/HistoryPanel.jsx`)
   - Displays navigation history
   - Allows reusing past routes
   - Shows relative timestamps (e.g., "2 hours ago")

3. **Updated Header** (`src/components/Layout/Header.jsx`)
   - Shows login button when not authenticated
   - Shows user info, history, and logout when authenticated

### New Services

1. **authService.js** (`src/services/authService.js`)
   - `login(username, password)` - Login user
   - `register(username, password)` - Register new user
   - `logout()` - Clear authentication
   - `getToken()` - Get stored JWT token
   - `getUser()` - Get stored user info
   - `isAuthenticated()` - Check if user is logged in
   - `getHistory(limit, offset)` - Fetch navigation history

2. **Updated api.js** (`src/services/api.js`)
   - Added request interceptor to automatically include JWT token
   - Added 401 handling for expired tokens

## Usage Examples

### For Regular Users (No Login)
- Use the app normally
- Routes work without authentication
- History is not saved

### For Authenticated Users
1. Register/Login once
2. Generate routes as usual
3. Routes are automatically saved
4. View history anytime by clicking "📜 History"
5. Click any history item to reload that route

## Security Notes

- Passwords are hashed with bcrypt on the backend
- JWT tokens are signed and verified
- Tokens expire after 7 days
- Session is cleared on logout or token expiry
- Users can only see their own history

## Troubleshooting

**"Session expired. Please login again"**
- Your token has expired (7 days)
- Simply login again to continue

**Can't see history button**
- You need to be logged in first
- Click "Login / Register" to sign in

**History is empty**
- Generate some routes while logged in
- History only saves routes for authenticated users

## Future Enhancements

Possible improvements:
- Password reset functionality
- Profile management
- Export history as CSV
- Route favorites/bookmarks
- Share routes with other users
- Route statistics and analytics
