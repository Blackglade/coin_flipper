import algosdk from "algosdk";
import { useState, useEffect } from "react";
import { Network, APIProvider, getAlgodClient } from "beaker-ts/lib/clients";
import { CoinFlipper } from '../contracts/coinflipper_client'
import { Avatar, Card, Box, Divider, Typography, CardContent } from "@mui/material";
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import { LoadingButton } from "@mui/lab";
import { useWalletUI, WalletUI } from '@algoscan/use-wallet-ui'

import OptIn from '../stages/0_opt_in'
import FlipBet from '../stages/1_flip_bet'

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
  const [app, setApp] = useState({
		stage: 0,
		data: {
      optInTx: null,
      optOutTx: null
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

  console.log('signer: ', signer)
  console.log('appClient: ', appClient)
  console.log('addy: ', activeAddress)

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
          <Box display='flex' gap={4}>
            <Card elevation={4} sx={{padding: 2, borderRadius: '0.5rem', maxWidth: '300px'}}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Avatar variant="rounded" sx={{width: '2rem', height: '2rem', bgcolor: "#1976d2"}}><FlipCameraAndroidIcon /></Avatar>
                  <Typography variant="h5">App Transactions</Typography>
              </Box>
              <Divider />
              <CardContent>
                <Typography noWrap>Opt In: {app.data.optInTx ? <a className="link" href={'https://testnet.algoscan.app/tx/' + app.data.optInTx} target='_blank' rel="noreferrer">{app.data.optInTx}</a> : <span style={{color: '#d32f2f'}}>Not Found</span> }</Typography>
                <Typography noWrap>Opt Out: {app.data.optOutTx ? <a className="link" href={'https://testnet.algoscan.app/tx/' + app.data.optOutTx} target='_blank' rel="noreferrer">{app.data.optOutTx}</a> : <span style={{color: '#d32f2f'}}>Not Found</span> }</Typography>
              </CardContent>
            </Card>

            <Box display='flex' flexDirection='column' gap={2}>
              <OptIn app={app} setApp={setApp} client={appClient} />
              <FlipBet app={app} setApp={setApp} client={appClient} />
            </Box>
          </Box>      
        </>}
        {/* <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)}>
          <Tab label='Admin Setup' />
          <Tab label='AMM Functions' />
        </Tabs>
        <TabPanel value={tab} index={0} flexDirection="row">
          <CreateAssets app={app} setApp={setApp} appClient={appClient} />
          <InitAMM app={app} setApp={setApp} appClient={appClient} />
          <OptIn app={app} setApp={setApp} appClient={appClient} />
          <AddLiquidity app={app} setApp={setApp} appClient={appClient} />
        </TabPanel>
        <TabPanel value={tab} index={1} flexDirection="row">

          <Swap app={app} setApp={setApp} appClient={appClient} />
            <Burn app={app} setApp={setApp} appClient={appClient} />
        </TabPanel> */}
      </Box>
    </div>
  );
}
