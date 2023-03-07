import StageCard from "../components/StageCard";
import { CardActions, Slider, Typography } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { type CoinFlipper } from "../contracts/coinflipper_client";
import { Box } from "@mui/system";
import { useState, type CSSProperties } from "react";
import algosdk, { makePaymentTxnWithSuggestedParamsFromObject } from "algosdk";

export default function FlipBet({app, setApp, client} : {app: any, setApp: any, client: CoinFlipper }){

	const [amount, setAmount] = useState(25)
	const [head, setHead] = useState(true)

	const { isFetching, isError, refetch } = useQuery(['1', 'flip_bet', amount, head], async () => {

		const sp = await client.client.getTransactionParams().do()
		const result = await client.flip_coin({
			bet_payment: makePaymentTxnWithSuggestedParamsFromObject({
				from: client.sender,
				suggestedParams: sp,
				to: client.appAddress,
				amount: amount * 1_000,
			}),
			heads: head,
		});

		return result
	}, {
		onSuccess: (result) => setApp({ stage: 2, data: { ...app.data, betTx: result.txID, betRound: Number(result.returnValue) }})
	})

	return(
		<StageCard currStage={app.stage} triggerStage={1} title="Bet on Coin Flip" error={isError}>
			<CardActions>
				<Box>
					<Box mb={1}>
						<Typography variant="h6">Betting {amount} microALGO's</Typography>
						<Slider defaultValue={25} step={5} min={5} max={1000} value={amount} onChange={(e: any) => setAmount(e.target.value)} aria-label="Default" valueLabelDisplay="auto" />
					</Box>
					<Box mb={1}>
						<Typography variant="h6">the coin will land on <span style={{color: head ? '#2196f3' : '#f44336'}}>{head ? 'HEADS' : 'TAILS'}</span></Typography>
						<div style={{width: 'max-content', margin: '2rem auto'}} onClick={() => {
							
							setHead(!head)
						}}><span className={"coin " + (head ? 'flippy' : 'reverse-flippy')} style={{'--coin-img': head ? `url("/silvio.jpg")` : `url("/algorand.jpg")`} as CSSProperties}></span></div>
					</Box>
					<Box display='flex' justifyContent='center'>
						<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 1}>Flip Coin</LoadingButton>
					</Box>
				</Box>
			</CardActions>
		</StageCard>
	)
}