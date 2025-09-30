import { useState } from "react";
import { useRouter } from "next/router";
import useSwr from "swr";
import {
  Plus,
  Settings,
  CreditCard,
  Bell,
  User,
  LogOut,
  Scan,
} from "lucide-react";
import fetcher from "../utils/fetcher";

interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  session: string;
  iat: number;
  exp: number;
}

interface HeaderProps {
  onAddSubscription?: () => void;
}

const Header = ({ onAddSubscription }: HeaderProps) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch user data
  const { data: user } = useSwr<User | null>(
    `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/me`,
    fetcher
  );

  // Don't render header if user is not authenticated
  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      // Call the logout API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/api/sessions`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for session validation
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear any client-side storage if needed
        localStorage.clear();
        sessionStorage.clear();

        // Redirect to landing page
        window.location.href = '/';
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if the API call fails, clear storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const handleAddSubscription = () => {
    if (onAddSubscription) {
      onAddSubscription();
    } else {
      router.push('/dashboard');
    }
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo and Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div className="logo-section">
              <div className="logo-icon">
                <CreditCard size={20} />
              </div>
              <span className="logo-text">Wardn</span>
            </div>

            {/* Navigation Menu */}
            <nav className="nav">
              <a
                href="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/dashboard");
                }}
              >
                Dashboard
              </a>
              <a
                href="/subscriptions"
                className={`nav-link ${isActive("/subscriptions") ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/subscriptions");
                }}
              >
                Subscriptions
              </a>
              <a
                href="/analytics"
                className={`nav-link ${isActive("/analytics") ? "active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/analytics");
                }}
              >
                Analytics
              </a>
            </nav>
          </div>

          {/* Actions */}
          <div className="actions">
            <button
              className="btn btn-outline hidden"
              onClick={() => router.push("/ocr")}
            >
              <Scan size={16} />
              Scan Receipt
            </button>
            <button
              className="btn btn-primary"
              onClick={handleAddSubscription}
            >
              <Plus size={16} />
              Add Subscription
            </button>
            <button
              className="btn btn-outline"
              onClick={() => router.push("/subscriptions")}
            >
              <Settings size={16} />
              Manage
            </button>

            {/* User Menu */}
            <div className="user-menu">
              <button
                className="user-avatar"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user.name.split(' ').map(n => n[0]).join('')}
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 40
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>

                    <a
                      href="/profile"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/profile");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <User size={16} />
                      Profile
                    </a>

                    <a
                      href="/settings"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/settings");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Settings size={16} />
                      Settings
                    </a>

                    <a
                      href="/notifications"
                      className="dropdown-item"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/notifications");
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Bell size={16} />
                      Notifications
                    </a>

                    <button
                      className="dropdown-item danger"
                      onClick={() => {
                        handleSignOut();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;