import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const beforeInstall = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
    };
  }, []);
  return (
    <>
      {!online && (
        <div className="status-banner" role="status">
          You’re offline. You can still explore the demo; live sessions need a connection.
        </div>
      )}
      {install && (
        <button
          className="install-button"
          onClick={async () => {
            await install.prompt();
            await install.userChoice;
            setInstall(null);
          }}
        >
          Install ShieldQuest
        </button>
      )}
      {needRefresh && (
        <div className="status-banner" role="status">
          An update is ready. Reloading resets this demo.{' '}
          <button onClick={() => void updateServiceWorker(true)}>Update now</button>
          <button onClick={() => setNeedRefresh(false)}>Later</button>
        </div>
      )}
    </>
  );
}
