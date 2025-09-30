import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

const OAuthError = () => {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error('OAuth authentication failed');
  }, []);

  const handleRetry = () => {
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1rem',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <AlertTriangle size={40} color="white" />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#2d3748',
          marginBottom: '1rem'
        }}>
          Authentication Failed
        </h1>

        <p style={{
          color: '#64748b',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          There was an issue with Google OAuth authentication. This might be due to:
        </p>

        <ul style={{
          textAlign: 'left',
          color: '#64748b',
          marginBottom: '2rem',
          paddingLeft: '1rem'
        }}>
          <li style={{ marginBottom: '0.5rem' }}>• Database connection issues</li>
          <li style={{ marginBottom: '0.5rem' }}>• Network connectivity problems</li>
          <li style={{ marginBottom: '0.5rem' }}>• Temporary server issues</li>
        </ul>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'transparent',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#667eea';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#667eea';
            }}
          >
            <ArrowLeft size={16} />
            Go Home
          </button>
        </div>

        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          marginTop: '2rem'
        }}>
          If the problem persists, please contact support or try again later.
        </p>
      </div>
    </div>
  );
};

export default OAuthError;