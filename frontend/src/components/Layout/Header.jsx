import './Header.css'

function Header({ user, onLoginClick, onLogout, onHistoryClick }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-branding">
          <h1 className="header-title">Kirby-Manchester Navigation</h1>
          <p className="header-subtitle">Indoor Navigation System</p>
        </div>
        <div className="header-actions">
          <span className="header-badge">Wake Forest University</span>
          
          {user ? (
            <div className="auth-controls">
              <button 
                className="header-btn history-btn"
                onClick={onHistoryClick}
                title="View navigation history"
              >
                📜 History
              </button>
              <span className="user-info">
                👤 {user.username}
              </span>
              <button 
                className="header-btn logout-btn"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="header-btn login-btn"
              onClick={onLoginClick}
            >
              Login / Register
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
