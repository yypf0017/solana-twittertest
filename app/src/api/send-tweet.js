import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'
import { Tweet } from '@/models'
import { tokentransfer } from './token-account'

export const sendTweet = async (topic, content) => {
    const { wallet, program } = useWorkspace()
    const tweet = web3.Keypair.generate()

    await program.value.rpc.sendTweet(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            tweet: tweet.publicKey,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [tweet]
    })

    const tweetAccount = await program.value.account.tweet.fetch(tweet.publicKey)
    if(tweetAccount){
        tokentransfer(wallet.value.publicKey,1)
    }
    return new Tweet(tweet.publicKey, tweetAccount)
}
