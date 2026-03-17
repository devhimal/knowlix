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
import { BookOpen, User, LogOut, Menu, Bell, FileCheck } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              Academic Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-secondary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resources"
                  className="text-foreground hover:text-secondary transition-colors"
                >
                  Resources
                </Link>
                <Link
                  href="/upload"
                  className="text-foreground hover:text-secondary transition-colors"
                >
                  Upload
                </Link>
                <Link
                  href="/mentors"
                  className="text-foreground hover:text-secondary transition-colors"
                >
                  Mentors
                </Link>
                <Link
                  href="/books"
                  className="text-foreground hover:text-secondary transition-colors"
                >
                  Books
                </Link>
                {["senior", "mentor", "admin"].includes(user?.role || "") && (
                  <Link
                    href="/review"
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <FileCheck className="h-4 w-4" />
                    Review
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          variant="destructive"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-foreground">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-primary/10 cursor-pointer ${
                              !notification.read ? "bg-primary/10" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-foreground">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-primary rounded-full mt-1"></div>
                              )}
                            </div>
                            <p className="text-sm text-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="h-5 w-5" />
                  <span>{user?.name}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {user?.role}
                  </Badge>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push("/login")} size="sm">
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {isAuthenticated && (
              <div className="flex flex-col gap-2 mb-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resources"
                  className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                >
                  Resources
                </Link>
                <Link
                  href="/upload"
                  className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                >
                  Upload
                </Link>
                <Link
                  href="/mentors"
                  className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                >
                  Mentors
                </Link>
                <Link
                  href="/books"
                  className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                >
                  Books
                </Link>
                {["senior", "mentor", "admin"].includes(user?.role || "") && (
                  <Link
                    href="/review"
                    className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                  >
                    Review Queue
                  </Link>
                )}
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 text-foreground hover:bg-primary/10 rounded"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
            <div className="px-3">
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-foreground mb-2">
                    {user?.name}
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/login")}
                  size="sm"
                  className="w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
