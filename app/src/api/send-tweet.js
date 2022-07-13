import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'
import { Tweet } from '@/models'
import { getOrCreateAssociatedTokenAccount} from '@solana/spl-token';
import TWITTERClient, { S_TWITTER_IDS } from './token-account'

export const sendTweet = async (topic, content) => {
    const { wallet, program, connection } = useWorkspace()
    const tweet = web3.Keypair.generate()
    const fromspl = new web3.PublicKey(S_TWITTER_IDS.devnet.mints.tokenSPL)
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet.value.payer,
        fromspl,
        wallet.value.publicKey
      );
    
      const destPublicKey = new web3.PublicKey(S_TWITTER_IDS.devnet.myaccounts.vault);
    
      // Get the derived address of the destination wallet which will hold the custom token
      const associatedDestinationTokenAddr =
        await getOrCreateAssociatedTokenAccount(
          connection,
          wallet.value.payer,
          fromspl,
          destPublicKey
        );
    await program.value.rpc.sendTweet(topic, content,{
        //,S_TWITTER_IDS.devnet.mints.tokenSPL,S_TWITTER_IDS.devnet.spl.amount
        //
        // payerTokenAccount: fromTokenAccount,
        //     royaltyTokenAccount: associatedDestinationTokenAddr,
        accounts: {  
            author: wallet.value.publicKey,
            payerTokenAccount:fromTokenAccount.address,
            royaltyTokenAccount:associatedDestinationTokenAddr.address,
            tweet: tweet.publicKey,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: TWITTERClient.TOKEN_PROGRAM_ID,
        },
        signers: [tweet]
    })

    const tweetAccount = await program.value.account.tweet.fetch(tweet.publicKey)
    //if(tweetAccount){
        // const tokenMintAddress = S_TWITTER_IDS.devnet.mints.tokenSPL
        
        // const fromwallet = wallet.value
        // const towallet = S_TWITTER_IDS.devnet.myaccounts.vault
        // // const connection = new Connection(
        // //     clusterApiUrl('devnet'),
        // //     'confirmed'
        // // );
        // const amount = S_TWITTER_IDS.devnet.spl.amount
        // transfer(tokenMintAddress,
        //     fromwallet,
        //     towallet,
        //     connection,
        //     amount)
        //await tokentransfer( wallet.value,S_TWITTER_IDS.devnet.myaccounts.vault)
    //}
    return new Tweet(tweet.publicKey, tweetAccount)
}
