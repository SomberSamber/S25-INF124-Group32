import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Handle registration logic here
    console.log('Registration with:', email, username, password);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4 py-8 mx-auto">
      <h1 className="mb-8 text-4xl font-bold text-white text-center">Create an Account</h1>
      
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
          className="w-full px-4 py-2 mt-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-space-purple-600 focus:ring-opacity-50"
        >
          Register
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