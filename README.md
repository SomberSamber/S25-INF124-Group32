# MusikMatch 🎵

A dynamic music guessing game built with React and TypeScript that challenges players to identify songs from YouTube audio clips. Features both solo and multiplayer modes with real-time gameplay and comprehensive scoring systems.

## 🎮 Features

### Game Modes
- **Solo Mode**: Individual gameplay with customizable timer settings (30s or 60s per game)
- **Multiplayer Mode**: Buzzer based  gameplay with up to 4 players
  - Assigned key bindings for each player to buzz in
  - Live scoreboard with real-time updates
  - Round based gameplay with configurable rounds

### Gameplay Features
- **YouTube Audio Integration**: Seamless audio playback from YouTube videos
- **Smart Autocomplete**: Intelligent song suggestion dropdown that searches:
  - Song titles
  - Artist names
  - Combined song and artist matches
  - Keyboard navigation support (arrow keys, Enter, Escape)
- **Real-time Timer**: Visual countdown timer with color-coded alerts
  - Green: >30 seconds remaining
  - Yellow: 11-30 seconds remaining  
  - Red: ≤10 seconds with pulse animation
- **Banner Feedback System**: Animated feedback for correct/incorrect answers
  - Green banner with checkmark for correct answers
  - Red banner with X for incorrect answers
  - Auto-hide after 3 seconds

### Results & Analytics
- **Comprehensive End Screen**: Detailed game results showing:
  - Song by song breakdown with correct/incorrect status
  - Player's actual guesses vs. correct answers
- **Multiplayer Rankings**: Final standings with winner detection and tie handling

### User Management
- **Firebase Authentication**: Secure user registration and login
- **User Profiles**: Individual user accounts and settings

### Music Library Management
- **Playlist Integration**: Custom playlist creation and management
- **Library Page**: Browse and organize music collections
- **Playlist Import**: Import playlists from various sources
- **Admin Panel**: Administrative controls for playlist and user management

### Settings & Customization
- **User Settings**: Account management (username, email, password)
- **Game Preferences**: Customizable game options
- **Display Settings**: UI and theme customization options


## 🚀 Getting Started



## 1. DEPLOYMENT [NO INSTALLATION]
1. Webapp deployed at. To access it go to this link: \
   https://musikmatch.vercel.app/ \
   https://musikmatch.vercel.app/ \
   https://musikmatch.vercel.app/ \
   https://musikmatch.vercel.app/ \
   https://musikmatch.vercel.app/ 
   

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SomberSamber/S25-INF124-Group32
cd musikmatch
```

2. Install dependencies:
```bash
npm install
```

3. Build Tailwind CSS:
```bash
npm run tailwind:build
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

### Available Scripts

- `npm start` - Runs the app in development mode with Tailwind CSS build
- `npm run build` - Builds the app for production with optimized Tailwind CSS
- `npm test` - Launches the test runner
- `npm run tailwind:build` - Builds Tailwind CSS manually

## 🎯 How to Play

### Solo Mode
1. Navigate to the game section and select "Solo Play"
2. Choose your preferred game duration (30s or 60s)
3. Listen to the audio clip and type your guess
4. Use the autocomplete dropdown for quick song selection
5. Submit answers before the timer runs out
6. View your detailed results at the end

### Multiplayer Mode
1. Set up a multiplayer game and configure the number of rounds
2. Assign keys to each player for buzzing in
3. When a song plays, be the first to buzz in using your assigned key
4. If you buzz in first, you get to answer
5. Wrong answers pass to the next player who buzzed in
6. Points are awarded for correct answers
7. View final rankings when all rounds are complete

## API 
 1. Youtube API was used to be able import playlists into the firebase

## 10 Features
 1. Sign Up
 2. Log In
 3. Solo Mode
 4. Multiplayer Mode
 5. Playlist Selection
 6. Library Page
 7. Importing Playlists
 8. Previewing Playlists
 9. Settings Page
10. Admin Page

