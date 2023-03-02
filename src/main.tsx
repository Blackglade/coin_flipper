import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { WalletUIProvider } from "@algoscan/use-wallet-ui"
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css'
import './flip.css'

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    staleTime: Infinity,
    cacheTime: Infinity,
    enabled: false,
    retry: false
  }
})

// Options: https://github.com/TxnLab/use-wallet/blob/main/src/constants/constants.ts#L3
 //  KMD = "kmd",
 //  PERA = "pera",
 //  MYALGO = "myalgo",
 //  ALGOSIGNER = "algosigner",
 //  DEFLY = "defly",
 //  EXODUS = "exodus",
 //  WALLETCONNECT = "walletconnect",
 //  MNEMONIC = "mnemonic",
//const allowedWallets = ["kmd", "pera", "myalgo", "algosigner", "defly", "exodus", "walletconnect", "mnemonic"];
const allowedWallets = ["myalgo", "pera"];

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssBaseline />
    <Alert severity="error" style={{fontWeight: '600'}}>THIS APP IS FOR DEMO PURPOSES ONLY. DO NOT USE IN PRODUCTION.</Alert>
    <QueryClientProvider client={queryClient}>
      <WalletUIProvider providers={allowedWallets}>
        <App />
      </WalletUIProvider>
    </QueryClientProvider>
    <Alert severity="error" style={{fontWeight: '600'}}>THIS APP IS FOR DEMO PURPOSES ONLY. DO NOT USE IN PRODUCTION.</Alert>
  </React.StrictMode>
)
