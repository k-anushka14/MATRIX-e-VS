import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center matrix-terminal p-12 max-w-md">
        <h1 className="mb-4 text-6xl font-bold matrix-text animate-glitch">404</h1>
        <p className="mb-6 text-xl text-matrix-glow">Oops! Page not found in the Matrix</p>
        <p className="mb-8 text-matrix-glow/80 text-sm">
          The page you're looking for doesn't exist in this reality.
        </p>
        <a 
          href="/" 
          className="matrix-text hover:text-matrix-bright transition-colors underline font-mono"
        >
          &gt; Return to Main Terminal
        </a>
      </div>
    </div>
  );
};

export default NotFound;
