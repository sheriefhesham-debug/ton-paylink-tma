import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// This is YOUR permanent, external passport URL
const manifestUrl = 'https://gist.githubusercontent.com/sheriefhesham-debug/60eab68ed3261502799d8694cc5a1555/raw/fcda0caf57129d63ebd0e2d8ab11c0e90eaae287/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider 
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/TonPayLinkProBot' // This is YOUR bot's username
      }}
      // This is the new, complete, and correct wallet list configuration
      walletsListConfiguration={{
            includeWallets: [
              {
                appName: "tonkeeper",
                name: "Tonkeeper",
                // This is the new, correct, and official URL from the source code
                imageUrl: "https://tonkeeper.com/assets/tonconnect-icon.png", 
                aboutUrl: "https://tonkeeper.com",
                universalLink: "https://app.tonkeeper.com/ton-connect",
                bridgeUrl: "https://bridge.tonapi.io/bridge",
                platforms: ["ios", "android", "chrome", "firefox", "safari", "windows", "macos", "linux"]
              },
              {
                appName: "mytonwallet",
                name: "MyTonWallet",
                imageUrl: "https://mytonwallet.io/icon-256.png",
                aboutUrl: "https://mytonwallet.io",
                universalLink: "https://app.mytonwallet.io/ton-connect",
                bridgeUrl: "https://bridge.mytonwallet.io/bridge",
                platforms: ["chrome", "windows", "macos", "linux", "ios", "android"]
              }
            ]
          }}
    >
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
);