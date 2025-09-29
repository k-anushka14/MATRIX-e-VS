import { Link, useLocation } from 'react-router-dom';
import { useVotingFlow } from '@/hooks/useVotingFlow';
import { useAdmin } from '@/contexts/AdminContext';

export const Navigation = () => {
  const location = useLocation();
  const { votingState } = useVotingFlow();
  const { isAuthenticated } = useAdmin();

  // Remove wallet functionality as it's not needed for this system
  // The system tracks voting progress through local state instead

  const navigation = [
    { name: 'Register', path: '/register', enabled: true },
    { name: 'Vote', path: '/vote', enabled: votingState.isRegistered },
    { name: 'Verify', path: '/verify', enabled: votingState.canVerify }
  ];

  const handleNavClick = (item: any, e: React.MouseEvent) => {
    if (!item.enabled) {
      e.preventDefault();
    }
  };

  return (
    <nav className="matrix-terminal p-4 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-2xl font-bold matrix-text">
            <span className="animate-matrix-glow">&gt;</span>
            <span className="typing-animation">e-VS</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={(e) => handleNavClick(item, e)}
              className={`matrix-text px-3 py-2 rounded transition-all duration-300 ${
                location.pathname === item.path
                  ? 'bg-primary/20 text-matrix-bright shadow-lg shadow-primary/20'
                  : item.enabled 
                    ? 'hover:bg-primary/10 hover:text-matrix-neon'
                    : 'opacity-50 cursor-not-allowed hover:text-matrix-glow'
              }`}
            >
              &gt; {item.name}
            </Link>
          ))}
        </div>

        {/* System Status and Admin Access */}
        <div className="flex items-center space-x-4">
          <div className="matrix-text text-sm">
            <span className="text-matrix-glow">Status:</span>
            <span className="ml-2 font-mono text-matrix-neon">
              {votingState.canVerify ? 'VOTED' : votingState.isRegistered ? 'REGISTERED' : 'READY'}
            </span>
          </div>
          
          {/* Admin Access */}
          {isAuthenticated ? (
            <Link
              to="/admin/dashboard"
              className="matrix-text px-3 py-2 rounded transition-all duration-300 hover:bg-primary/10 hover:text-matrix-neon"
            >
              &gt; Admin Dashboard
            </Link>
          ) : (
            <Link
              to="/admin/login"
              className="matrix-text px-3 py-2 rounded transition-all duration-300 hover:bg-primary/10 hover:text-matrix-neon"
            >
              &gt; Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};