import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserStatus: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();

  if (loading) {
    return <div className="text-sm text-gray-400">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="text-sm text-gray-400">Not logged in</div>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-white rounded  transition-colors"
    >
      Logout
    </button>
  );
};

export default UserStatus; 