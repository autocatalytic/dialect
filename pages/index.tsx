import { Cluster, Connection, clusterApiUrl } from '@solana/web3.js';
import Wallet from '@project-serum/sol-wallet-adapter';
import React from 'react';
import Navbar from '../components/Navbar';
import Landing from '../components/Landing';
import useDarkMode, { DarkModeContextProvider } from '../utils/DarkModeContext';

export default function HomeContextWrapper(props: any): JSX.Element {
  return (
    <DarkModeContextProvider>
      <Home {...props} />
    </DarkModeContextProvider>
  );
}

function Home(): JSX.Element {
  const { darkMode } = useDarkMode();
  const [selectedWallet, setSelectedWallet] = React.useState<
    Wallet | undefined | null
  >(undefined);
  const [urlWallet, setUrlWallet] = React.useState<Wallet | null>(null);
  const [networkName, setNetworkName] = React.useState<Cluster | 'localnet'>(
    'localnet'
  );
  const network: string = React.useMemo(() => {
    if (networkName === 'localnet') {
      return 'http://127.0.0.1:8899';
    }
    return clusterApiUrl(networkName);
  }, [networkName]);
  const [providerUrl] = React.useState<string>('https://www.sollet.io');
  const connection = React.useMemo(() => new Connection(network), [network]);
  React.useEffect(() => {
    const w = new Wallet(providerUrl, network);
    console.log('providerUrl', providerUrl);
    console.log('network', network);
    console.log('wallet', w);
    setUrlWallet(w);
  }, [providerUrl, network]);

  const [, setConnected] = React.useState(false);
  React.useEffect(() => {
    if (selectedWallet) {
      selectedWallet.on('connect', () => {
        setConnected(true);
        console.log(
          `Connected to wallet ${selectedWallet.publicKey?.toBase58() ?? '--'}`
        );
      });
      selectedWallet.on('disconnect', () => {
        setConnected(false);
        console.log('Disconnected from wallet');
      });
      void selectedWallet.connect();
      return () => {
        void selectedWallet.disconnect();
      };
    }
  }, [selectedWallet]);
  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navbar
        wallet={selectedWallet}
        onWalletDisconnect={() => setSelectedWallet(null)}
        onWalletConnect={() => setSelectedWallet(urlWallet)}
        networkName={networkName}
        setNetworkName={(networkName) => setNetworkName(networkName)}
      />
      <Landing />
    </div>
  );
}
