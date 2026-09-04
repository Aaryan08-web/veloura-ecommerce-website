import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, LogOut, MapPin, Shield, Edit3, Check } from 'lucide-react';
import { useAuthentication } from '../hooks/useAuthentication';
import { useWishlist } from '../hooks/useWishlist';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, orders: authOrders, updateAddress } = useAuthentication();
  const { itemCount: wishlistCount } = useWishlist();

  const orders = authOrders || user?.orders || [];

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [street, setStreet] = useState(user?.address?.street || '124 Fifth Avenue, Suite 8A');
  const [city, setCity] = useState(user?.address?.city || 'New York');
  const [state, setState] = useState(user?.address?.state || 'NY');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '10011');
  const [country, setCountry] = useState(user?.address?.country || 'United States');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <h2 className="font-serif-luxury text-3xl text-stone-900 dark:text-white">Client Portal</h2>
        <p className="text-sm text-stone-500">Sign in to access your personal measurements, saved garments, and bespoke order logs.</p>
        <Link
          to="/login"
          className="inline-block py-3 px-8 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs uppercase tracking-widest font-semibold"
        >
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    updateAddress({
      street,
      city,
      state,
      zipCode,
      country,
    });
    setIsEditingAddress(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Client greeting header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 dark:border-stone-800 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-medium text-stone-500 dark:text-stone-400 block mb-1">
            Veloura Circle Client Portal
          </span>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl text-stone-950 dark:text-white font-normal">
            Welcome, {user.name}
          </h1>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded text-xs uppercase tracking-wider font-semibold hover:opacity-90 transition-opacity"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Portal</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/home');
            }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Membership Tier</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-serif text-2xl font-light text-stone-950 dark:text-white">Circle Gold</p>
          <p className="text-[11px] text-stone-500 mt-1">Complimentary tailoring & personal styling</p>
        </div>

        <Link
          to="/account/orders"
          className="p-6 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs shadow-xl hover:border-stone-400 dark:hover:border-white/25 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Total Acquisitions</span>
            <Package className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          </div>
          <p className="font-serif text-2xl font-light text-stone-950 dark:text-white">{orders.length}</p>
          <p className="text-[11px] text-stone-500 mt-1">Click to view active tracking</p>
        </Link>

        <Link
          to="/wishlist"
          className="p-6 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs shadow-xl hover:border-stone-400 dark:hover:border-white/25 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Saved Wishlist</span>
            <Heart className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          </div>
          <p className="font-serif text-2xl font-light text-stone-950 dark:text-white">{wishlistCount}</p>
          <p className="text-[11px] text-stone-500 mt-1">View personal ensemble shortlist</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Client Profile & Address on File */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
              <h3 className="font-serif text-xl text-stone-950 dark:text-white font-light">
                Client Profile
              </h3>
              <User className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-white/5">
                <span className="text-stone-500 dark:text-stone-400">Full Name</span>
                <span className="font-medium text-stone-950 dark:text-white">{user.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-white/5">
                <span className="text-stone-500 dark:text-stone-400">Email Address</span>
                <span className="font-medium text-stone-950 dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500 dark:text-stone-400">Circle Member Since</span>
                <span className="font-medium text-stone-950 dark:text-white">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address Box */}
          <div className="bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                <h3 className="font-serif text-xl text-stone-950 dark:text-white font-light">
                  Primary Delivery Atelier
                </h3>
              </div>
              {!isEditingAddress && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-xs uppercase tracking-wider text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 rounded-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Delivery address updated successfully.</span>
              </div>
            )}

            {!isEditingAddress ? (
              <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 space-y-1">
                <p className="font-medium text-stone-950 dark:text-white">{street}</p>
                <p>{city}, {state} {zipCode}</p>
                <p>{country}</p>
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-1">Street</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-900 dark:text-white text-xs rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs cursor-pointer shadow-md"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="py-2.5 px-4 border border-stone-300 dark:border-white/15 text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white text-[10px] uppercase tracking-[0.2em] rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right: Recent Orders Preview */}
        <div className="lg:col-span-6 bg-white dark:bg-[#121212] border border-stone-200 dark:border-white/10 rounded-xs p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-white/10 pb-3">
            <h3 className="font-serif text-xl text-stone-950 dark:text-white font-light">
              Recent Acquisitions
            </h3>
            <Link
              to="/account/orders"
              className="text-[11px] uppercase tracking-wider text-stone-500 hover:text-stone-950 dark:text-stone-400 dark:hover:text-white underline transition-colors"
            >
              View All ({orders.length})
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-stone-500 dark:text-stone-400 text-xs space-y-3">
              <Package className="w-8 h-8 mx-auto text-stone-400 dark:text-stone-500" />
              <p>No orders recorded under this account yet.</p>
              <Link
                to="/shop"
                className="inline-block text-xs uppercase tracking-widest text-stone-950 dark:text-white font-semibold underline"
              >
                Explore The Atelier Collection →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-stone-200 dark:divide-white/10">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-sm font-normal text-stone-950 dark:text-white">
                        {order.id}
                      </span>
                      <span className="text-xs text-stone-500 block">{formatDate(order.date || order.createdAt)}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-medium bg-stone-100 dark:bg-zinc-900 border border-stone-300 dark:border-white/15 text-stone-700 dark:text-stone-300">
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span>{(order.items || []).length} garments</span>
                    <span className="font-medium text-stone-950 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
