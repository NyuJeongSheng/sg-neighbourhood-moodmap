import { useState } from 'react';
import SingaporeMap from './components/SingaporeMap/SingaporeMap';
import ChatBot from './components/ChatBot/ChatBot';
import { useBackendStatus } from './hooks/pingBackendStatus';
import ServerStartupOverlay from './components/ServerStartupOverlay/ServerStartupOverlay';

function App() {
  const [loading, setLoading] = useState(false);

  // Check if backend is reachable
  const isBackendUp = useBackendStatus();

  return (
    <>
      {/* Show backend wake-up overlay if backend is down */}
      {!isBackendUp && <ServerStartupOverlay />}

      {/* Main app content */}
      <SingaporeMap setLoading={setLoading} />
      <ChatBot />

      {/* Loading overlay when map data is updating */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            zIndex: 9999,
          }}
        >
          Updating map data...
        </div>
      )}
    </>
  );
}

export default App;
