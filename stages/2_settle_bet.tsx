import { useState } from "react";
import StageCard from "../components/StageCard";
import { CardActions, LinearProgress, Typography } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { type CoinFlipper } from "../contracts/coinflipper_client";
import { Box } from "@mui/system";
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import Confetti from "react-confetti";
import Algorand from '../public/android-chrome-192x192.png'

const roundsToWait = 10;

export default function SettleBet({app, setApp, client} : {app: any, setApp: any, client: CoinFlipper }){

	const [progress, setProgress] = useState(0)
	const [confetti, setConfetti] = useState(false)

	const { data: round } = useQuery(['2', 'current_round'], async () => {
		const x = await client.getSuggestedParams()

		return x.firstRound
	}, {
		enabled: app.stage === 2 && progress !== 100,
		refetchInterval: 2000,
		onSuccess: (currRound) => setProgress(Math.min(100, ((currRound - app.data.betRound)/roundsToWait) * 100))
	})

	const { data, isFetching, isError, refetch } = useQuery(['2', 'settle_bet'], async () => {

		const feePaySp = await client.getSuggestedParams(undefined, 1);
		const result = await client.settle(
			{ bettor: client.sender },
			{ suggestedParams: feePaySp }
		)

		if(typeof result.value !== 'undefined') return({ ...result.value })
		else throw 'Error retrieving Results'

	}, {
		onSuccess: (data) => {
			if(data.won) setConfetti(true)
			setProgress(0)
			setApp({ stage: 1, data: app.data})
		}
	})

	return(
		<StageCard currStage={app.stage} triggerStage={2} title="Settle Bet" error={isError} sx={{width: '420px', marginBottom: 4}}>
			<CardActions sx={{flexDirection: 'column', gap: 2}}>
					<Box>
						<Typography variant="h6">Waiting for Block {(app.data.betRound + roundsToWait).toLocaleString()}</Typography>
						<Box display='flex' gap={0.5}>
							<ViewInArIcon htmlColor="#1976d2" />
							<Typography color='#1976d2'>{round}</Typography>
						</Box>
					</Box>
					<LinearProgress variant="determinate" value={progress} sx={{width: '100%', height: '0.75rem', borderRadius: '4px'}} />
					<Box display='flex' gap={4}>
						<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 2 || progress !== 100}>Settle Bet</LoadingButton>
						{typeof data !== 'undefined' && <Box display='flex' gap={2}>
						<Typography variant="h6" color={data.won ? '#2e7d32' : '#d32f2f'}>{data.won ? 'Winner!!!' : 'You Lost...'}</Typography>
						<Typography variant='h6'><img src={Algorand} style={{width: '1rem', height: '1rem', marginRight: '4px'}} />{Number(data.amount) / 1000000}</Typography>
						</Box>}
					</Box>
					{confetti && <Confetti recycle={false} onConfettiComplete={() => setConfetti(false)} />}
			</CardActions>
		</StageCard>
	)
}  