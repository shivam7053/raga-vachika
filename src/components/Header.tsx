"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Settings, Sun, Moon, Bell, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { useAuth } from "@/context/AuthContexts";
import { useTheme } from "next-themes";
import { AppNotification } from "@/types/masterclass";
import NotificationCard from "./NotificationCard"; // ⭐ Import NotificationCard

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const { user, userProfile, signOut, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setMounted(true);

    if (!user?.uid) {
      setNotifications([]);
      return;
    }

    // Listen for real-time notifications (only latest 5 for dropdown)
    const q = query(
      collection(db, `user_profiles/${user.uid}/notifications`), 
      orderBy("createdAt", "desc"),
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notifs = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as AppNotification));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!user?.uid) return;
    try {
      const notifRef = doc(db, `user_profiles/${user.uid}/notifications`, id);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDismiss = async (id: string) => {
    if (!user?.uid) return;
    try {
      const notifRef = doc(db, `user_profiles/${user.uid}/notifications`, id);
      await updateDoc(notifRef, { dismissed: true });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error dismissing:", error);
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setNotificationOpen(false);
    if (notification.ctaLink) {
      router.push(notification.ctaLink);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? "bg-transparent text-white"
          : "bg-gradient-to-r from-sky-50/90 via-white/90 to-orange-50/90 dark:from-blue-950/90 dark:to-blue-900/90 backdrop-blur-md shadow-md border-b border-orange-100 dark:border-blue-900 text-gray-800 dark:text-gray-100"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "circOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:rotate-1"
          >
            <img
              src={
                "/logo.png"
              }
              alt="Ragavachika"
              className="h-20 w-auto rounded-xl object-contain"
            />
          </Link>

          {/* Navigation */}
          <nav
            className={`hidden md:flex items-center space-x-1 rounded-full px-2 py-1 transition-all ${
              transparent ? "bg-white/10 backdrop-blur-sm" : "bg-transparent"
            }`}
          >
            {[
              { path: "/", label: "Home" },
              { path: "/contact", label: "Contact Us" },
              { path: "/about", label: "About Us" },
              { path: "/masterclasses", label: "Master Classes" },
            ].map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="relative px-4 py-2 text-sm font-medium transition-colors group"
              >
                {isActive(link.path) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-1 left-0 right-0 h-0.5 bg-orange-500 dark:bg-sky-400"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`${
                  isActive(link.path) 
                    ? "text-orange-600 dark:text-sky-300 font-semibold" 
                    : transparent 
                      ? "text-white hover:text-sky-200" 
                      : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-sky-400"
                }`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(prev => !prev)}
                  className={`p-2.5 rounded-full border transition-all hover:bg-sky-50 dark:hover:bg-blue-900/50 ${
                    transparent
                      ? "border-white text-white hover:bg-white/10"
                      : "border-orange-200 dark:border-blue-800 text-gray-600 dark:text-gray-300"
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                <AnimatePresence>
                  {isNotificationOpen && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationOpen(false)}
                      />
                      
                      {/* Panel */}
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-14 right-0 w-96 bg-white dark:bg-blue-950 rounded-xl shadow-2xl border border-sky-100 dark:border-blue-900 z-50 overflow-hidden ring-1 ring-black/5"
                      >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-sky-100 dark:border-blue-900 bg-gradient-to-r from-sky-50 to-white dark:from-blue-900/50 dark:to-blue-950">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                            {unreadCount > 0 && (
                              <p className="text-xs text-sky-600 dark:text-sky-400">
                                {unreadCount} unread
                              </p>
                            )}
                          </div>
                          <button 
                            onClick={() => setNotificationOpen(false)} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[32rem] overflow-y-auto">
                          {notifications.length > 0 ? (
                            <div className="divide-y divide-sky-50 dark:divide-blue-900">
                              {notifications.map(notification => (
                                <div key={notification.id} className="hover:bg-sky-50/50 dark:hover:bg-blue-900/30 transition-colors">
                                  <NotificationCard
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onDismiss={handleDismiss}
                                    onClick={() => handleNotificationClick(notification)}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-sky-200 dark:text-blue-800 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-blue-300">
                                No notifications yet
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-gray-50 dark:bg-blue-950 text-center border-t border-sky-100 dark:border-blue-900">
                          <Link 
                            href="/notifications" 
                            onClick={() => setNotificationOpen(false)}
                            className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline"
                          >
                            View all notifications
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`p-2.5 rounded-full border transition-all hover:bg-sky-50 dark:hover:bg-blue-900/50 ${
                transparent
                  ? "border-white text-white hover:bg-white/10"
                  : "border-orange-200 dark:border-blue-800 text-gray-600 dark:text-gray-300"
              }`}
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "light" ? (
                    <Moon className="w-5 h-5 text-sky-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-gray-200 h-10 w-20 rounded-full"></div>
                <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
              </div>
            ) : user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-red-600 transition-all shadow-sm hover:shadow-md"
                  >
                    Admin
                  </Link>
                )}

                <Link
                  href="/profile"
                  className={`flex items-center space-x-2 transition-all px-4 py-2 border rounded-full text-sm font-medium hover:shadow-md ${
                    transparent
                      ? "border-white text-white hover:bg-white/10"
                      : "border-orange-200 dark:border-blue-800 text-gray-700 dark:text-gray-200 hover:border-orange-300 dark:hover:border-blue-700 bg-white/50 dark:bg-blue-900/20"
                  }`}
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-sky-100 dark:ring-blue-800"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>{userProfile?.full_name || "Profile"}</span>
                  <Settings className="w-4 h-4 text-gray-400" />
                </Link>

                <button
                  onClick={handleSignOut}
                  className={`transition-all px-5 py-2.5 border rounded-full text-sm font-medium hover:shadow-md ${
                    transparent
                      ? "border-white text-white hover:bg-white/10"
                      : "border-orange-200 dark:border-blue-800 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-blue-900/50"
                  }`}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className={`transition-all px-6 py-2.5 border rounded-full text-sm font-medium hover:shadow-md ${
                    transparent
                      ? "border-white text-white hover:bg-white/10"
                      : "border-orange-200 dark:border-blue-800 text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-blue-900/50"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    transparent
                      ? "bg-white text-black hover:bg-gray-100"
                      : "bg-orange-500 text-white hover:bg-orange-600 dark:bg-sky-600 dark:hover:bg-sky-500"
                  }`}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
