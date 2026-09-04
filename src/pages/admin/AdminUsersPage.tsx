import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { adminClient } from '../../services/adminClient';
import { UserProfile } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminClient.getUsers();
      setUsers(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registered customers from MongoDB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUser = async (userId: string) => {
    setTogglingId(userId);
    try {
      const updated = await adminClient.toggleUserActive(userId);
      setUsers((prev) =>
        prev.map((u) => {
          const uId = u.id || (u as any)._id;
          if (uId === userId) {
            return { ...u, isActive: (updated as any).isActive } as any;
          }
          return u;
        })
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-stone-950 dark:text-white uppercase">
              Client Accounts
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 rounded-full">
              {users.length} Users in MongoDB
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Registered customer profiles, contact info, and account activity stored in MongoDB Atlas.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs uppercase tracking-[0.15em] font-medium bg-white dark:bg-zinc-800 border border-stone-300 dark:border-white/10 rounded-md hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs text-red-800 dark:text-red-300 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchUsers} className="underline uppercase tracking-wider font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/10 rounded text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#141414] border border-stone-200 dark:border-white/10 rounded-lg shadow-xs overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-400" />
            <p className="text-xs uppercase tracking-wider text-stone-500">Loading user profiles from MongoDB...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500 space-y-2">
            <Users className="w-8 h-8 mx-auto opacity-40 mb-2" />
            <p className="font-semibold text-stone-700 dark:text-stone-300">No client accounts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/80 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-white/10 text-[10px] uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone Number</th>
                  <th className="py-3 px-3">Registered Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                {filteredUsers.map((user) => {
                  const userId = user.id || (user as any)._id || '';
                  const isActive = (user as any).isActive !== false;
                  const dateStr = user.createdAt || user.memberSince || 'Recent';

                  return (
                    <tr
                      key={userId}
                      className={`hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors ${
                        !isActive ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-white flex items-center justify-center font-bold text-xs uppercase font-mono">
                            {user.name ? user.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-stone-950 dark:text-white">{user.name || 'Anonymous'}</p>
                            <p className="text-[10px] text-stone-400 font-mono">ID: {userId.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3 text-stone-700 dark:text-stone-300 font-mono">
                        {user.email}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400 font-mono">
                        {user.phone || '—'}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-stone-600 dark:text-stone-400">
                        {dateStr.includes('T') ? new Date(dateStr).toLocaleDateString() : dateStr}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded border ${
                            isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-stone-200 dark:bg-zinc-800 text-stone-600 dark:text-stone-400 border-stone-300'
                          }`}
                        >
                          {isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          disabled={togglingId === userId}
                          onClick={() => handleToggleUser(userId)}
                          className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border border-stone-300 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                          {isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
