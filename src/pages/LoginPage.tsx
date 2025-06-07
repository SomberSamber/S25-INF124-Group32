import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting to sign in with:', email);
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error);
        console.error('Login error:', error);
      } else {
        console.log('Login successful! Redirecting to home...');
        navigate('/home');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-white text-center">Login to MusikMatch</h1>
      
      {error && (
        <div className="w-full p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-space-purple-600 focus:border-transparent"
            placeholder="Email"
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-space-purple-600 focus:border-transparent"
            placeholder="Password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-space-purple-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : 'Login'}
        </button>
      </form>
      
      <p className="mt-4 text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage; 