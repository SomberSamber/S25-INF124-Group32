import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPresetPlaylists, PresetPlaylist } from '../lib/presetPlaylists';
import { getUserPlaylists, UserPlaylist } from '../lib/userPlaylists';
import PlaylistModal from '../components/PlaylistModal';
import PlaylistImporter from '../components/PlaylistImporter';

const LibraryPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  // State for modal visibility and content type
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'genre' | 'user'>('genre');
  
  // State for playlist modal
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PresetPlaylist | UserPlaylist | null>(null);
  
  // State for import modal
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  
  // Real data from Firebase
  const [presetPlaylists, setPresetPlaylists] = useState<PresetPlaylist[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  // Load preset playlists from Firebase
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setLoading(true);
        const fetchedPlaylists = await getPresetPlaylists();
        setPresetPlaylists(fetchedPlaylists);
      } catch (error) {
        console.error('Error loading playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  // Load user playlists from Firebase
  useEffect(() => {
    const loadUserPlaylists = async () => {
      if (!currentUser?.uid) {
        setUserLoading(false);
        return;
      }
      
      try {
        setUserLoading(true);
        const fetchedUserPlaylists = await getUserPlaylists(currentUser.uid);
        setUserPlaylists(fetchedUserPlaylists);
      } catch (error) {
        console.error('Error loading user playlists:', error);
      } finally {
        setUserLoading(false);
      }
    };

    loadUserPlaylists();
  }, [currentUser?.uid]);

  // Function to open modal with the specified type
  const openModal = (type: 'genre' | 'user') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to open playlist modal
  const openPlaylistModal = (playlist: PresetPlaylist | UserPlaylist) => {
    setSelectedPlaylist(playlist);
    setIsPlaylistModalOpen(true);
  };

  // Function to close playlist modal
  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
    setSelectedPlaylist(null);
  };

  // Get current playlist data based on modal type
  const getCurrentPlaylists = () => {
    return modalType === 'genre' ? presetPlaylists : userPlaylists;
  };

  // Modal title based on type
  const getModalTitle = () => {
    return modalType === 'genre' ? 'Genre Playlists' : 'Your Playlists';
  };

  // Function to handle adding a new playlist
  const handleAddPlaylist = () => {
    setIsImporterOpen(true);
  };

  // Function to handle import completion
  const handleImportComplete = async (playlistId: string) => {
    // Refresh user playlists
    if (!currentUser?.uid) return;
    
    try {
      const fetchedUserPlaylists = await getUserPlaylists(currentUser.uid);
      setUserPlaylists(fetchedUserPlaylists);
    } catch (error) {
      console.error('Error refreshing user playlists:', error);
    }
  };

  // Rendering a playlist tile (used in both carousel and grid)
  const renderPlaylistTile = (playlist: PresetPlaylist | UserPlaylist, size: 'small' | 'large' = 'large') => {
    const tileClasses = size === 'large' 
      ? "flex-shrink-0 w-48 h-64 rounded-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105" 
      : "w-36 h-52 rounded-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105";
    
    const iconSize = size === 'large' ? "h-16 w-16" : "h-12 w-12";
    const imgHeight = size === 'large' ? "h-48" : "h-36";
    
    // Get gradient colors based on genre or source
    const getGradientColors = (playlist: PresetPlaylist | UserPlaylist) => {
      if ('genre' in playlist) {
        // PresetPlaylist
        switch (playlist.genre.toLowerCase()) {
          case 'pop': return 'from-pink-500 to-purple-500';
          case 'rock': return 'from-red-500 to-orange-500';
          case 'rap':
          case 'hip hop': return 'from-yellow-500 to-green-500';
          case '90s': return 'from-indigo-500 to-purple-600';
          case '2000s': return 'from-cyan-500 to-blue-600';
          case 'disney': return 'from-pink-400 to-rose-500';
          case 'country': return 'from-amber-500 to-orange-600';
          case 'electronic': return 'from-blue-500 to-indigo-500';
          default: return 'from-purple-500 to-indigo-500';
        }
      } else {
        // UserPlaylist
        switch (playlist.source) {
          case 'spotify': return 'from-green-500 to-emerald-500';
          case 'youtube': return 'from-red-500 to-pink-500';
          default: return 'from-gray-500 to-slate-500';
        }
      }
    };
    
    const getDisplayGenre = (playlist: PresetPlaylist | UserPlaylist) => {
      if ('genre' in playlist) {
        return playlist.genre;
      } else {
        return playlist.source === 'spotify' ? 'Spotify' : 
               playlist.source === 'youtube' ? 'YouTube' : 'Custom';
      }
    };
    
    return (
      <div 
        key={playlist.id} 
        className={tileClasses}
        onClick={() => openPlaylistModal(playlist)}
      >
        <div className={`w-full ${imgHeight} bg-gradient-to-br ${getGradientColors(playlist)} flex items-center justify-center relative`}>
          {/* If cover image exists, display it */}
          {playlist.coverImageUrl && (
            <img 
              src={playlist.coverImageUrl} 
              alt={playlist.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, remove the src to show the fallback
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          {/* Fallback to gradient with music icon */}
          <svg 
            className={`${iconSize} text-white opacity-75 z-10`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div className="p-3 bg-gray-800">
          <h3 className="font-medium text-sm">{playlist.name}</h3>
          <p className="text-xs text-gray-400">{getDisplayGenre(playlist)}</p>
        </div>
      </div>
    );
  };

  // Render add playlist tile
  const renderAddPlaylistTile = (size: 'small' | 'large' = 'large') => {
    const tileClasses = size === 'large'
      ? "flex-shrink-0 w-48 h-64 rounded-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105 border-2 border-dashed border-gray-600 bg-gray-800 bg-opacity-50"
      : "w-36 h-52 rounded-lg overflow-hidden cursor-pointer transition-transform transform hover:scale-105 border-2 border-dashed border-gray-600 bg-gray-800 bg-opacity-50";
    
    const iconSize = size === 'large' ? "h-16 w-16" : "h-12 w-12";
    const textSize = size === 'large' ? "text-base" : "text-sm";
    
    return (
      <div 
        className={tileClasses}
        onClick={handleAddPlaylist}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-400 hover:text-purple-400">
            <img 
              src="/assets/icons/add-playlist.svg" 
              alt="Add Playlist"
              className={iconSize}
            />
            <span className={`mt-2 font-medium ${textSize}`}>Add Playlist</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Webkit browsers (Chrome, Safari) */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a78bfa, #818cf8);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #8b5cf6, #6366f1);
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 rgba(31, 41, 55, 0.5);
        }
      `}} />

      {/* Header navigation */}
      <header className="relative z-10 w-full flex justify-between items-center p-4">
        <div className="flex items-center">
          <Link to="/">
            <div className="text-purple-400 font-bold text-2xl">
              MusikMatch
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/home" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/library" className="text-gray-300 hover:text-white font-bold border-b-2 border-purple-500">Library</Link>
          <Link to="/settings" className="text-gray-300 hover:text-white">Settings</Link>
          <Link to="/" className="text-gray-300 hover:text-white">Logout</Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Your Music Library
        </h1>
        
       
        {/* Genre Playlists Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Genre Playlists</h2>
            <button 
              className="text-purple-400 hover:text-purple-300"
              onClick={() => openModal('genre')}
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-48 h-64 rounded-lg overflow-hidden bg-gray-800 animate-pulse">
                    <div className="w-full h-48 bg-gray-700"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : presetPlaylists.length === 0 ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="text-center">
                    <p className="text-gray-400 mb-2">No playlists available</p>
                    <p className="text-gray-500 text-sm">Upload some playlists in the admin panel</p>
                  </div>
                </div>
              ) : (
                presetPlaylists.map(playlist => renderPlaylistTile(playlist))
              )}
            </div>
          </div>
        </section>
        
        {/* User Playlists Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Playlists</h2>
            <button 
              className="text-purple-400 hover:text-purple-300"
              onClick={() => openModal('user')}
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
              {/* Add New Playlist Tile */}
              {renderAddPlaylistTile('large')}
                       
              {/* User playlists will be mapped here when available */}
              {userPlaylists.map(playlist => renderPlaylistTile(playlist))}
            </div>
          </div>
        </section>
      </main>

      {/* Modal for "View All" */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="bg-gray-800 rounded-lg shadow-xl w-2/5 max-h-[70vh] overflow-hidden">
            {/* Modal header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-purple-400">{getModalTitle()}</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-6 overflow-y-auto max-h-[calc(70vh-80px)] custom-scrollbar">
              {/* Grid of playlists */}
              <div className="grid grid-cols-3 gap-6">
                {/* Add New Playlist tile only for user playlists */}
                {modalType === 'user' && renderAddPlaylistTile('small')}
                
                {/* Empty state message for user playlists */}
                {modalType === 'user' && userPlaylists.length === 0 && (
                  <div className="col-span-3 flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-gray-400 mb-2">No playlists yet</p>
                      <p className="text-gray-500 text-sm">Connect to your favorite music services<br />to import your playlists</p>
                    </div>
                  </div>
                )}
                
                {/* Render all playlists */}
                {getCurrentPlaylists().map(playlist => renderPlaylistTile(playlist, 'small'))}
              </div>
            </div>
          </div>
                  </div>
        )}

        {/* Playlist Modal */}
        <PlaylistModal
          playlist={selectedPlaylist}
          isOpen={isPlaylistModalOpen}
          onClose={closePlaylistModal}
          userId={currentUser?.uid || ''}
        />

        {/* Playlist Importer */}
        {isImporterOpen && currentUser?.uid && (
          <PlaylistImporter
            userId={currentUser.uid}
            onImportComplete={handleImportComplete}
            onClose={() => setIsImporterOpen(false)}
          />
        )}
      </div>
    );
  };

export default LibraryPage; 