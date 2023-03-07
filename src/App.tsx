import algosdk from "algosdk";
import { useState, useEffect } from "react";
import { Network, APIProvider, getAlgodClient } from "beaker-ts/lib/clients";
import { CoinFlipper } from '../contracts/coinflipper_client'
import { Avatar, Card, Box, Divider, Typography, CardContent, CardActions } from "@mui/material";
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import { LoadingButton } from "@mui/lab";
import { useWalletUI, WalletUI } from '@algoscan/use-wallet-ui'

import OptIn from '../stages/0_opt_in'
import FlipBet from '../stages/1_flip_bet'
import SettleBet from '../stages/2_settle_bet'
import { useQuery } from "@tanstack/react-query";

// App ID of DApp Deployed to Testnet
const APPID = 115885218

// Init our algod client
const algodClient = getAlgodClient(APIProvider.AlgoNode, Network.TestNet);

// If you just need a placeholder signer
const PlaceHolderSigner: algosdk.TransactionSigner = (
  _txnGroup: algosdk.Transaction[],
  _indexesToSign: number[],
): Promise<Uint8Array[]> => {
  return Promise.resolve([]);
};

// AnonClient can still allow reads for an app but no transactions
// can be signed
const AnonClient = (): CoinFlipper => {
  return new CoinFlipper({
    client: algodClient,
    signer: PlaceHolderSigner,
    sender: "",
    appId: APPID,
  });
};


export default function App() {

  const { signer, activeAddress } = useWalletUI()

  // Init our app client
  const [appClient, setAppClient] = useState<CoinFlipper>(AnonClient)

  // App State
  const [app, setApp] = useState<{ 
    stage: number, 
    data: { 
      status: boolean | null
      optInTx: string | null
      optOutTx: string | null
      betTx: string | null
      betRound: number | null
    } 
  }>({
		stage: -1,
		data: {
      status: null,
      optInTx: null,
      optOutTx: null,
      betTx: null,
      betRound: null
    }
	})

  // Update App Client when activeAddress updates
  useEffect(() => {
    if(typeof activeAddress !== 'undefined'){
      setAppClient(new CoinFlipper({
        client: algodClient,
        signer: signer,
        sender: activeAddress,
        appId: APPID,
      }))
    }
  }, [activeAddress])
  
  useQuery(['-1', 'opt_status', activeAddress], async () => {
    
    if(typeof activeAddress === 'undefined') return;
    try {
      const result = await algodClient.accountApplicationInformation(activeAddress, APPID).do()
      return('app-local-state' in result)
    } catch(e) {
      return false
    }
  }, {
    enabled: app.data.status === null && typeof activeAddress !== 'undefined',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: (optedIn) => setApp(prev => ({ stage: optedIn ? 1 : 0, data: { ...prev.data, status: !!optedIn }}))
  })

  const { refetch, isFetching } = useQuery(['-2', 'opt_out'], async () => {
    const result = await appClient.closeOut()
    return result
  }, {
    onSuccess: (data) => setApp(prev => ({ stage: 0, data: { ...prev.data, optOutTx: data.txIDs[0], status: false }}))
  })

  console.log(app)

  return (
    <div className="App">
      <header>
        <Box m={2} display="flex" justifyContent="end">
          <WalletUI />
        </Box>
        <Divider />
      </header>
      <Box display="flex" flexDirection="column" gap={2} mt={2} position="relative" alignItems="center">
        <Typography variant="h3" fontWeight={700} textAlign="center" mb={2}>Coin Flipper Demo</Typography>
        {typeof activeAddress === 'undefined' ? <Typography variant="h4" fontWeight={500} textAlign="center" mt={2}>Connect Wallet</Typography> : <>
          <Box display='flex' gap={2}>
            <Box display='flex' flexDirection='column' gap={2}>
              <Card elevation={4} sx={{padding: 2, borderRadius: '0.5rem', maxWidth: '300px'}}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar variant="rounded" sx={{width: '2rem', height: '2rem', bgcolor: "#1976d2"}}><FlipCameraAndroidIcon /></Avatar>
                    <Typography variant="h5">App Transactions</Typography>
                </Box>
                <Divider />
                <CardContent>
                  <Typography noWrap>Status: <span style={{color: !!app.data.status ? '#2e7d32' : '#d32f2f'}}>{app.data.status === null ? 'Checking Status...' : app.data.status ? 'Opted In' : 'Opted Out'}</span></Typography>
                  <Typography noWrap>Opt In: {app.data.optInTx ? <a className="link" href={'https://testnet.algoscan.app/tx/' + app.data.optInTx} target='_blank' rel="noreferrer">{app.data.optInTx}</a> : <span style={{color: '#d32f2f'}}>Not Found</span> }</Typography>
                  <Typography noWrap>Opt Out: {app.data.optOutTx ? <a className="link" href={'https://testnet.algoscan.app/tx/' + app.data.optOutTx} target='_blank' rel="noreferrer">{app.data.optOutTx}</a> : <span style={{color: '#d32f2f'}}>Not Found</span> }</Typography>
                  <Typography noWrap>Bet Tx: {app.data.betTx ? <a className="link" href={'https://testnet.algoscan.app/tx/' + app.data.betTx} target='_blank' rel="noreferrer">{app.data.betTx}</a> : <span style={{color: '#d32f2f'}}>Not Found</span> }</Typography>
                  <Typography noWrap>Bet Round: {app.data.betRound ? <a className="link" href={'https://testnet.algoscan.app/block/' + app.data.betRound} target='_blank' rel="noreferrer">{app.data.betRound}</a> : <span style={{color: '#d32f2f'}}>Not Found</span> }</Typography>
                </CardContent>
                <CardActions>
                  <LoadingButton variant="contained" color="error" disabled={app.data.status === null || !app.data.status} loading={isFetching} onClick={() => refetch()}>Opt Out</LoadingButton>
                </CardActions>
              </Card>
              <OptIn app={app} setApp={setApp} client={appClient} />
            </Box>
            <FlipBet app={app} setApp={setApp} client={appClient} />
          </Box>
          <SettleBet app={app} setApp={setApp} client={appClient} />      
        </>}
      </Box>
    </div>
  );
}
