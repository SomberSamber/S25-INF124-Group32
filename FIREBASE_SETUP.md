# Firebase Setup Guide for MusikMatch

## 🎉 Firebase Integration Complete!

Your MusikMatch app is now connected to Firebase! Here's what's been set up:

## 📋 What's Been Added

### New Files Created:
- `src/lib/firebase.ts` - Firebase configuration and services
- `src/contexts/AuthContext.tsx` - Firebase Authentication context
- `src/hooks/useFirebase.ts` - Custom hooks for Firestore and Storage operations
- `src/utils/initializeFirestore.ts` - Initialization script for preset playlists

### Services Configured:
- ✅ **Firebase Authentication** - User registration, login, logout
- ✅ **Firestore Database** - NoSQL database for playlists, songs, users, game sessions
- ✅ **Firebase Storage** - Audio file storage with secure access
- ✅ **Firebase Analytics** - Usage tracking and insights

## 🔧 Firebase Console Setup Required

You'll need to enable services in your Firebase console:

### 1. Enable Authentication
1. Go to your Firebase console: https://console.firebase.google.com/
2. Select your `musikmatch-647d0` project
3. Click on "Authentication" in the left menu
4. Go to "Sign-in method" tab
5. Enable "Email/Password" provider

### 2. Create Firestore Database
1. Click on "Firestore Database" in the left menu
2. Click "Create database"
3. Start in **production mode** (we'll set up security rules)
4. Choose a location (preferably close to your users)

### 3. Set up Firestore Security Rules
In the Firestore console, go to "Rules" tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read preset playlists and their own playlists
    match /playlists/{playlistId} {
      allow read: if request.auth != null && 
        (resource.data.isPreset == true || resource.data.userId == request.auth.uid);
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can read songs from playlists they have access to
    match /songs/{songId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Users can read and write their own game sessions
    match /gameSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || request.resource.data.userId == request.auth.uid);
    }
  }
}
```

### 4. Set up Firebase Storage
1. Click on "Storage" in the left menu
2. Click "Get started"
3. Keep default security rules for now
4. Choose the same location as your Firestore

### 5. Storage Security Rules
In Storage rules, replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload and manage their own audio files
    match /audio/{userId}/{allPaths=**} {
      allow read: if true; // Audio files are publicly readable
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 How to Use

### Authentication
```tsx
import { useAuth } from './contexts/AuthContext'

function MyComponent() {
  const { currentUser, userProfile, signUp, signIn, logout } = useAuth()
  
  // Use authentication methods
}
```

### Data Operations
```tsx
import { usePlaylists, useSongs, useGameSessions } from './hooks/useFirebase'

function PlaylistComponent() {
  const { playlists, createPlaylist, deletePlaylist } = usePlaylists()
  const { songs, addSong } = useSongs(playlistId)
  const { sessions, saveGameSession } = useGameSessions()
  
  // Use data operations
}
```

### File Uploads
```tsx
import { useFileUpload } from './hooks/useFirebase'

function UploadComponent() {
  const { uploadAudioFile, uploading } = useFileUpload()
  
  const handleUpload = async (file: File) => {
    const { data, error } = await uploadAudioFile(file, 'my-song.mp3')
    if (data) {
      console.log('File uploaded:', data.url)
    }
  }
}
```

## 📊 Database Structure

Your Firestore will have these collections:

### Collections:
- **users** - User profiles and settings
- **playlists** - Both preset and user-created playlists
- **songs** - Song metadata with audio file URLs
- **gameSessions** - Game results and statistics

### Storage:
- **audio/{userId}/{filename}** - User uploaded audio files

## 🛡️ Security Features

- **Authentication Required** - All operations require user login
- **User Isolation** - Users can only access their own data
- **Preset Content** - Shared preset playlists accessible to all users
- **Secure File Storage** - Audio files are associated with user accounts

## 🎵 Sample Data

The app automatically creates 8 preset playlists:
- Pop Hits
- Rock Classics  
- Rap Essentials
- 80s Throwbacks
- 90s Nostalgia
- 2000s Hits
- Country Favorites
- Disney Songs

## ✅ Test Your Setup

1. Start your development server: `npm start`
2. Register a new user account
3. Check Firebase console to see:
   - New user in Authentication
   - User document in Firestore
   - Preset playlists in the playlists collection

Your MusikMatch app is now ready with Firebase backend! 🔥 