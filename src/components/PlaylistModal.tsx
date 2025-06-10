import React, { useState, useEffect, useRef } from 'react';
import { PresetPlaylist, PresetSong, getPresetPlaylistSongs } from '../lib/presetPlaylists';
import { UserPlaylist, UserSong, getUserPlaylistSongs } from '../lib/userPlaylists';

// Union type for both playlist types
type AnyPlaylist = PresetPlaylist | UserPlaylist;
type AnySong = PresetSong | UserSong;

interface PlaylistModalProps {
  playlist: AnyPlaylist | null;
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // Needed for user playlists
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlist, isOpen, onClose, userId = 'user123' }) => {
  const [songs, setSongs] = useState<AnySong[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  // Audio ref for controlling playback
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper function to check if it's a preset playlist
  const isPresetPlaylist = (playlist: AnyPlaylist): playlist is PresetPlaylist => {
    return 'genre' in playlist && 'isPreset' in playlist;
  };

  // Helper function to check if it's a user playlist
  const isUserPlaylist = (playlist: AnyPlaylist): playlist is UserPlaylist => {
    return 'source' in playlist && 'userId' in playlist;
  };

  // Load songs when playlist changes
  useEffect(() => {
    if (playlist && isOpen) {
      loadPlaylistSongs();
    }
  }, [playlist, isOpen]);

  // Cleanup audio when modal closes
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setCurrentPlaying(null);
    }
  }, [isOpen]);

  const loadPlaylistSongs = async () => {
    if (!playlist) return;
    
    try {
      setLoading(true);
      setError('');
      
      let fetchedSongs: AnySong[];
      
      if (isPresetPlaylist(playlist)) {
        fetchedSongs = await getPresetPlaylistSongs(playlist.id);
      } else if (isUserPlaylist(playlist)) {
        fetchedSongs = await getUserPlaylistSongs(userId, playlist.id);
      } else {
        throw new Error('Unknown playlist type');
      }
      
      setSongs(fetchedSongs);
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  // Convert YouTube URL to embed URL for audio
  const getYouTubeEmbedUrl = (youtubeUrl: string): string => {
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
    }
    return youtubeUrl;
  };

  // Handle play/pause for YouTube videos
  const handlePlayPause = (song: AnySong) => {
    if (currentPlaying === song.id) {
      // Stop current song
      setCurrentPlaying(null);
    } else {
      // Start new song
      setCurrentPlaying(song.id);
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get display genre
  const getDisplayGenre = (playlist: AnyPlaylist): string => {
    if (isPresetPlaylist(playlist)) {
      return playlist.genre;
    } else if (isUserPlaylist(playlist)) {
      return playlist.source === 'spotify' ? 'Spotify Import' : 
             playlist.source === 'youtube' ? 'YouTube Import' : 'Custom';
    }
    return '';
  };

  // Get cover image URL
  const getCoverImageUrl = (playlist: AnyPlaylist): string | undefined => {
    if (isPresetPlaylist(playlist)) {
      return playlist.coverImageUrl;
    } else if (isUserPlaylist(playlist)) {
      return playlist.coverImageUrl;
    }
    return undefined;
  };

  // Get description
  const getDescription = (playlist: AnyPlaylist): string => {
    if (isPresetPlaylist(playlist)) {
      return playlist.description || '';
    } else if (isUserPlaylist(playlist)) {
      return playlist.description || '';
    }
    return '';
  };

  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75">
      <div className="bg-gray-800 rounded-lg shadow-xl w-4/5 max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            {getCoverImageUrl(playlist) && (
              <img
                src={getCoverImageUrl(playlist)}
                alt={playlist.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{playlist.name}</h2>
              <p className="text-gray-400">{getDescription(playlist)}</p>
              <p className="text-sm text-gray-500">{songs.length} songs • {getDisplayGenre(playlist)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-400">Loading songs...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadPlaylistSongs}
                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : songs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No songs found in this playlist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Songs List */}
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                    currentPlaying === song.id ? 'bg-gray-700 ring-2 ring-purple-500' : ''
                  }`}
                >
                  {/* Track Number */}
                  <div className="w-8 text-center">
                    <span className="text-gray-400 text-sm font-mono">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Album Art */}
                  {song.albumArt && (
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{song.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                  </div>

                  {/* Duration */}
                  {song.duration && (
                    <div className="text-gray-400 text-sm font-mono">
                      {formatDuration(song.duration)}
                    </div>
                  )}

                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayPause(song)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    {currentPlaying === song.id ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  {/* YouTube Link */}
                  <a
                    href={song.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                    title="Open in YouTube"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              ))}

              {/* YouTube Embed for Current Playing Song */}
              {currentPlaying && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-medium mb-3">Now Playing</h3>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={getYouTubeEmbedUrl(songs.find(s => s.id === currentPlaying)?.audioUrl || '')}
                      title="Now Playing"
                      className="absolute inset-0 w-full h-full rounded"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal; 