import React, { useState, useEffect } from 'react';
import { importYouTubePlaylist } from '../lib/userPlaylists';
import { 
  extractSpotifyTokenFromUrl, 
  clearSpotifyHashFromUrl, 
  storeSpotifyToken, 
  getStoredSpotifyToken,
  clearStoredSpotifyToken,
  isSpotifyCallback,
  extractSpotifyCodeFromUrl,
  exchangeCodeForToken,
  clearSpotifyCodeFromUrl
} from '../lib/spotifyAuth';

interface PlaylistImporterProps {
  userId: string;
  onImportComplete: (playlistId: string) => void;
  onClose: () => void;
}

const PlaylistImporter: React.FC<PlaylistImporterProps> = ({
  userId,
  onImportComplete,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'spotify' | 'youtube'>('spotify');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  // These would normally come from environment variables or user settings
  const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY || '';


  const handleYouTubeImport = async () => {
    console.log('=== YOUTUBE IMPORT DEBUG START ===');
    console.log('YouTube API Key:', YOUTUBE_API_KEY ? 'PRESENT' : 'MISSING');
    console.log('Playlist URL:', playlistUrl);
    console.log('User ID:', userId);
    
    if (!YOUTUBE_API_KEY) {
      console.log('❌ YouTube API key not configured');
      setError('YouTube API key not configured');
      return;
    }

    if (!playlistUrl.includes('youtube.com/playlist') && !playlistUrl.includes('youtu.be/playlist')) {
      console.log('❌ Invalid YouTube playlist URL format');
      setError('Please enter a valid YouTube playlist URL');
      return;
    }

    // Extract playlist ID for logging
    const extractedPlaylistId = playlistUrl.split('list=')[1]?.split('&')[0];
    console.log('Extracted Playlist ID:', extractedPlaylistId);

    try {
      setIsImporting(true);
      setError('');
      setImportStatus('Importing YouTube playlist...');
      console.log('🚀 Starting import process...');

      const playlistId = await importYouTubePlaylist(
        userId,
        playlistUrl,
        YOUTUBE_API_KEY
      );

      console.log('✅ Import successful! Created playlist ID:', playlistId);
      setImportStatus('Playlist imported successfully!');
      onImportComplete(playlistId);
      
      // Reset form
      setPlaylistUrl('');
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('❌ YouTube import error:', error);
      console.log('Error type:', typeof error);
      console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      console.log('=== YOUTUBE IMPORT DEBUG END ===');
    }
  };

  // Generate code verifier and challenge for PKCE
  const generateCodeVerifier = () => {
    const array = new Uint32Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  };

  const generateCodeChallenge = async (codeVerifier: string) => {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleSpotifyAuth = async () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    
    console.log('=== SPOTIFY AUTH DEBUG START ===');
    console.log('Raw Client ID from env:', process.env.REACT_APP_SPOTIFY_CLIENT_ID);
    console.log('Client ID length:', clientId?.length);
    console.log('Client ID first 10 chars:', clientId?.substring(0, 10));
    
    if (!clientId || clientId.trim() === '') {
      console.error('❌ Spotify Client ID not configured');
      setError('Spotify Client ID not configured. Please add REACT_APP_SPOTIFY_CLIENT_ID to your .env file.');
      return;
    }
    
    // Validate Client ID format (should be 32 characters)
    if (clientId.length !== 32) {
      console.error('❌ Invalid Spotify Client ID length. Expected 32 characters, got:', clientId.length);
      setError('Invalid Spotify Client ID. Please check your REACT_APP_SPOTIFY_CLIENT_ID in the .env file.');
      return;
    }
    
    try {
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier for later use
      sessionStorage.setItem('spotify_code_verifier', codeVerifier);
      
      // Use current origin (works with both localhost and 127.0.0.1)
      const redirectUri = window.location.origin + '/';
      
      console.log('Using redirect URI:', redirectUri);
      const scopes = 'playlist-read-private playlist-read-collaborative';
      
      // Construct URL for Authorization Code flow with PKCE
      const baseUrl = 'https://accounts.spotify.com/authorize';
      const params = new URLSearchParams({
        'client_id': clientId,
        'response_type': 'code',
        'redirect_uri': redirectUri,
        'scope': scopes,
        'code_challenge_method': 'S256',
        'code_challenge': codeChallenge,
        'show_dialog': 'true'
      });
      
      const authUrl = `${baseUrl}?${params.toString()}`;
      
      console.log('=== SPOTIFY AUTH PARAMETERS ===');
      console.log('Client ID:', clientId);
      console.log('Redirect URI:', redirectUri);
      console.log('Scopes:', scopes);
      console.log('Code Challenge:', codeChallenge.substring(0, 20) + '...');
      console.log('Full Auth URL:', authUrl);
      
      // Validate the URL before redirecting
      try {
        new URL(authUrl);
        console.log('✅ URL is valid');
      } catch (error) {
        console.error('❌ Invalid URL:', error);
        setError('Failed to construct valid Spotify auth URL');
        return;
      }
      
      // Open in same window for easier token handling
      console.log('🚀 Redirecting to Spotify...');
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('❌ Error generating PKCE parameters:', error);
      setError('Failed to generate authentication parameters');
    }
  };

  const handleImport = () => {
      handleYouTubeImport();
    
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
      <div className="bg-gray-800 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-purple-400">Import Playlist</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-r-md transition-colors ${
                activeTab === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>📺</span>
                <span>YouTube</span>
              </div>
            </button>
          </div>

         
          {/* YouTube Tab */}
          {/*activeTab === 'youtube' && (*/}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube Playlist URL
                </label>
                <input
                  type="url"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  disabled={isImporting}
                />
              </div>
              <p className="text-xs text-gray-400">
                Make sure the playlist is public or unlisted
              </p>
            </div>
          

          {/* Status Messages */}
          {importStatus && (
            <div className="mt-4 p-3 rounded-md bg-green-100 text-green-700">
              {importStatus}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-100 text-red-700">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              disabled={isImporting}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || !playlistUrl}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
              } text-white disabled:cursor-not-allowed`}
            >
              {isImporting ? 'Importing...' : 'Import Playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistImporter;