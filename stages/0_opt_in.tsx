import StageCard from "../components/StageCard";
import { CardActions } from "@mui/material";
import { LoadingButton } from '@mui/lab';
import { useQuery } from "@tanstack/react-query";
import { type CoinFlipper } from "../contracts/coinflipper_client";

export default function OptIn({app, setApp, client} : {app: any, setApp: any, client: CoinFlipper }){

	const { isFetching, isError, refetch } = useQuery(['0', 'opt_in'], async () => {
		const optin = await client.optIn()
		return { txid: optin.txIDs[0] }
	}, {
		onSuccess: ({txid}) => {
			setApp({ stage: 1, data: { ...app.data, optInTx: txid }})
		}
	})


	return(
		<StageCard currStage={app.stage} triggerStage={0} title="Opt In" error={isError}>
			<CardActions>
				<LoadingButton variant="contained" onClick={() => refetch()} loading={isFetching} disabled={app.stage !== 0}>Opt In</LoadingButton>
			</CardActions>
		</StageCard>
	)
}