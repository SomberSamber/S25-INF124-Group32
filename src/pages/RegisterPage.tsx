import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      console.log('Attempting to register with:', email, username);
      const { error } = await signUp(email, password, username);
      
      if (error) {
        setError(error);
        console.error('Registration error:', error);
      } else {
        console.log('Registration successful! Navigating to home...');
        navigate('/home');
      }
    } catch (err) {
      console.error('Unexpected error during registration:', err);
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-white text-center">Create an Account</h1>
      
      {error && (
        <div className="w-full p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
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
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-space-purple-600 focus:border-transparent"
            placeholder="Username"
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
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-space-purple-600 focus:border-transparent"
            placeholder="Confirm Password"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 mt-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-space-purple-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <p className="mt-4 text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage; 