import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  data: T[];
  status: 'success' | 'error';
  message?: string;
}

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse<User>>('/api/users');
        
        if (response.data.status === 'success') {
          setUsers(response.data.data);
          setError(null);
        } else {
          throw new Error(response.data.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserToggle = (userId: number): void => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      )
    );
  };

  const activeUserCount = users.filter(user => user.isActive).length;
  const totalUsers = users.length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="stats">
          <span className="stat">
            Active: {activeUserCount}
          </span>
          <span className="stat">
            Total: {totalUsers}
          </span>
        </div>
      </header>

      <div className="user-grid">
        {users.map(user => (
          <div 
            key={user.id} 
            className={`user-card ${user.isActive ? 'active' : 'inactive'}`}
          >
            <div className="user-info">
              <h3>{user.name}</h3>
              <p className="email">{user.email}</p>
              <span className={`status ${user.isActive ? 'online' : 'offline'}`}>
                {user.isActive ? '● Online' : '○ Offline'}
              </span>
            </div>
            <button 
              className="toggle-btn"
              onClick={() => handleUserToggle(user.id)}
              aria-label={`Toggle ${user.name}'s status`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="empty-state">
          <h2>No users found</h2>
          <p>There are currently no users in the system.</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
