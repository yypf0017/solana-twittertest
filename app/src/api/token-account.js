import { getOrCreateAssociatedTokenAccount , transfer } from '@solana/spl-token';
// import { web3 } from '@project-serum/anchor'
import {clusterApiUrl, Connection ,PublicKey,Keypair } from "@solana/web3.js";
export const S_TWITTER_IDS = {
  mainnet: {
    programs: {
      s_twitter: '',
    },
    accounts: {
      vault: '',
    },
    mints: {
      tokenSPL: '',
    },
  },
  
  devnet: {
    programs: {
      s_twitter: 'DVb2Fnj4wKqLW34bePJceFH4o5shbixuHkivA849Rs6L',
    },
    accounts: {
      vault: '56yYd4CGnzi8cDHatDcdPYtSgf8yLkfRdkepAvCdrdAP',
    },
    myaccounts: {
      vault: '7Ss8jAHEusSzmhNiGsqnABP6T7M6mPtVxZD1mQBZz55K',
    },
    spl: {
      amount: 1,
    },
    mints: {
      tokenSPL: 'Hx5Zi8fSxf3EW5R9RqS1pLfGwbMcQn8ndZufZAhktY3u',
    },
  },
}

export const tokentransfer = async (fromWallet,to) => {
  
  
  const fromspl = new PublicKey(S_TWITTER_IDS.devnet.mints.tokenSPL)

  const connection = new Connection(
    clusterApiUrl('devnet'),
    'confirmed'
  );


  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet.payer,
    fromspl,
    fromWallet.publicKey
  );

  const destPublicKey = new web3.PublicKey(to);

  // Get the derived address of the destination wallet which will hold the custom token
  const associatedDestinationTokenAddr =
    await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet.payer,
      fromspl,
      destPublicKey
    );
  console.log(associatedDestinationTokenAddr.address.toBase58())
  return await transfer(
    connection,
    fromWallet,
    fromTokenAccount.address,
    associatedDestinationTokenAddr.address,
    fromWallet,
    S_TWITTER_IDS.devnet.spl.amount
  );

}