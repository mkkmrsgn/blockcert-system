import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Shield,
  Link as ChainIcon,
  Globe,
  Phone,
  UserPlus,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function SiteNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, [location.pathname]);

  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = storedUser?.role || "";

  const isActive = (path) => {
    if (path === "/verify") return location.pathname.startsWith("/verify");
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const dashboardPath =
    userRole === "admin" || userRole === "issuer" ? "/issuer" : "/user";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap');

        .site-navbar {
          width: 100%;
          min-height: 76px;
          background: rgba(12, 28, 73, 0.95);
          border-bottom: 3px solid #dc2626;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
          backdrop-filter: blur(8px);
        }

        .site-nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #fff;
          min-width: fit-content;
        }

        .site-gov-logo {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: linear-gradient(145deg, #1e3a8a, #0d1b3e);
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        }

        .site-gov-logo-inner {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #f59e0b;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.6);
        }

        .site-nav-brand-text-group {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }

        .site-nav-brand-text {
          font-weight: 800;
          font-size: 22px;
          letter-spacing: 0.12em;
          font-family: 'Barlow Condensed', sans-serif;
        }

        .site-nav-brand-sub {
          font-size: 11px;
          opacity: 0.78;
          letter-spacing: 0.07em;
          font-family: 'Barlow', sans-serif;
        }

        .site-nav-links {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .site-nav-link,
        .site-nav-button {
          color: #fff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s ease, color 0.2s ease;
          white-space: nowrap;
          font-family: 'Barlow', sans-serif;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .site-nav-link:hover,
        .site-nav-button:hover {
          background-color: rgba(255,255,255,0.15);
        }

        .site-nav-link.active {
          border-bottom: 2px solid #fff;
          padding-bottom: 4px;
        }

        .site-nav-link.register-link {
          background-color: #dc2626;
        }

        .site-nav-link.register-link:hover {
          background-color: #b91c1c;
        }

        .site-nav-link.login-link,
        .site-nav-button.logout-link,
        .site-nav-link.dashboard-link {
          border: 1.5px solid rgba(255,255,255,0.5);
        }

        .site-nav-link.login-link:hover,
        .site-nav-button.logout-link:hover,
        .site-nav-link.dashboard-link:hover {
          background-color: rgba(255,255,255,0.1);
          border-color: #fff;
        }

        .site-nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.3);
          margin: 0 4px;
        }

        @media (max-width: 1100px) {
          .site-nav-links {
            gap: 8px !important;
            flex-wrap: wrap;
            justify-content: flex-end;
          }
        }

        @media (max-width: 900px) {
          .site-navbar {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px;
            padding: 14px 20px;
          }

          .site-nav-links {
            width: 100%;
            justify-content: flex-start !important;
          }
        }

        @media (max-width: 480px) {
          .site-nav-link,
          .site-nav-button {
            font-size: 12px;
            padding: 6px 10px;
          }
        }
      `}</style>

      <nav className="site-navbar">
                <Link
        to="/"
        className="site-nav-brand"
        onClick={() => {
            // DO NOTHING → just navigate without clearing session
        }}
        >
          <div className="site-gov-logo">
            <Shield size={34} color="#ffffff" strokeWidth={1.5} />
            <div className="site-gov-logo-inner">
              <ChainIcon size={14} color="#ffffff" />
            </div>
          </div>

          <div className="site-nav-brand-text-group">
            <span className="site-nav-brand-text">BLOCKCERT</span>
            <span className="site-nav-brand-sub">Blockchain Certificate Platform</span>
          </div>
        </Link>

        <div className="site-nav-links">
            {!isLoggedIn && (
            <>
                <Link to="/" className={`site-nav-link${isActive("/") ? " active" : ""}`}>
                <Globe size={14} /> BLOCKCERT OFFICIAL
                </Link>

                <div className="site-nav-divider" />
            </>
            )}

          <Link
            to="/schools"
            className={`site-nav-link${isActive("/schools") ? " active" : ""}`}
          >
            DRIVING SCHOOLS
          </Link>

          {!isLoggedIn && (
            <Link
              to="/verify"
              className={`site-nav-link${isActive("/verify") ? " active" : ""}`}
            >
              <Phone size={13} /> VERIFIER
            </Link>
          )}

          <div className="site-nav-divider" />

          {isLoggedIn ? (
            <>
              <Link to={dashboardPath} className="site-nav-link dashboard-link">
                <LayoutDashboard size={14} /> DASHBOARD
              </Link>

              <button
                type="button"
                className="site-nav-button logout-link"
                onClick={handleLogout}
              >
                <LogOut size={14} /> LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="site-nav-link register-link">
                <UserPlus size={14} /> REGISTER
              </Link>

              <Link to="/login" className="site-nav-link login-link">
                <LogIn size={14} /> LOGIN
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}