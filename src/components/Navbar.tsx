"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, User, LogOut, Menu, Bell, FileCheck, Zap, LayoutDashboard, Upload, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { PaymentDialog } from "./PaymentDialog";
import { usePayment } from "@/context/PaymentContext";

import { SmartSearch } from "./SmartSearch";

export default function Navbar() {
  const { user, role, signOut, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { isSubscribed } = usePayment();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const userIsSubscribed = user ? isSubscribed(user.id) : false;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white hidden sm:block">
              Padyantra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && ( // Always true now for UI
              <>
                <Link
                  href="/dashboard"
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resources"
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Resources
                </Link>
                <Link
                  href="/upload"
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Upload
                </Link>
                <Link
                  href="/books"
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  Books
                </Link>
                <Link
                  href="/my-uploads"
                  className="text-white/90 hover:text-white font-medium transition-colors"
                >
                  My Uploads
                </Link>
                {["admin", "super_admin"].includes(user?.role || "") && (
                  <Link
                    href="/admin/dashboard" // Assuming an admin dashboard path
                    className="text-white/90 hover:text-white font-medium transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {["super_admin", "admin", "mentor"].includes(user?.role || "") && (
                  <Link
                    href="/review"
                    className="text-white/90 hover:text-white font-medium transition-colors flex items-center gap-1"
                  >
                    <FileCheck className="h-4 w-4" />
                    Review
                  </Link>
                )}
                {["student", "mentor"].includes(user?.role || "") && (
                  <Link
                    href="/earnings" // Assuming an earnings page path
                    className="text-white/90 hover:text-white font-medium transition-colors"
                  >
                    Earnings
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {!userIsSubscribed && (
                  <Button
                    onClick={() => setSubscriptionDialogOpen(true)}
                    variant="secondary"
                    size="sm"
                    className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold border-none"
                  >
                    <Zap className="h-4 w-4 mr-1 fill-amber-950" />
                    Go Premium
                  </Button>
                )}

                {/* Notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-2 border-primary"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-primary/5" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-primary rounded-full mt-1"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-snug">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-2">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-sm text-white font-medium bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all border-none">
                      <User className="h-4 w-4" />
                      <span>{user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{user?.user_metadata?.name || 'User'}</span>
                        <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center w-full cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-uploads" className="flex items-center w-full cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>My Uploads</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600 focus:text-red-600 cursor-pointer" 
                      onSelect={(e) => {
                        e.preventDefault();
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => router.push("/login")} variant="secondary" size="sm">
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            {isAuthenticated && ( // Always true now for UI
              <div className="flex flex-col gap-1 mb-4">
                {!userIsSubscribed && ( // Mock subscribed is true
                  <Button
                    onClick={() => {
                      setSubscriptionDialogOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    variant="secondary"
                    className="mx-3 mb-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold"
                  >
                    <Zap className="h-4 w-4 mr-2 fill-amber-950" />
                    Go Premium
                  </Button>
                )}
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/resources"
                  className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>
                <Link
                  href="/upload"
                  className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link
                  href="/books"
                  className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Books
                </Link>
                <Link
                  href="/my-uploads"
                  className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Uploads
                </Link>
                {["admin", "super_admin"].includes(user?.role || "") && (
                  <Link
                    href="/admin/dashboard"
                    className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {["super_admin", "admin", "mentor"].includes(user?.role || "") && (
                  <Link
                    href="/review"
                    className="px-3 py-2 text-white/90 hover:bg-white/10 rounded flex items-center gap-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Review
                  </Link>
                )}
                {["student", "mentor"].includes(user?.role || "") && (
                  <Link
                    href="/earnings"
                    className="px-3 py-2 text-white/90 hover:bg-white/10 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Earnings
                  </Link>
                )}
              </div>
            )}
            <div className="px-3">
              {isAuthenticated ? ( // Always true now for UI
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full text-white border-white/20 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button onClick={() => router.push("/login")} size="sm" variant="secondary" className="w-full">
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <PaymentDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        mode="subscription"
      />
    </nav>
  );
}
