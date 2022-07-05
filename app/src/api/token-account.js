import { getOrCreateAssociatedTokenAccount , transfer } from '@solana/spl-token';
// import { web3 } from '@project-serum/anchor'
import {clusterApiUrl, Connection ,PublicKey,Keypair } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import { web3 } from '@project-serum/anchor'

export const createMintInit = async () => { 
  const payer = web3.Keypair.generate();
  const mintAuthority = web3.Keypair.generate();
  const freezeAuthority = web3.Keypair.generate();
  
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed'
  );

  // 空投一点SOL
  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    web3.LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airdropSignature);

  // 创建token
  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    9 // We are using 9 to match the CLI decimal default exactly
  );
  console.log(mint.toBase58());

  // 创建一个账户
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  )

  console.log(tokenAccount.address.toBase58());

  // const tokenAccountInfo = await getAccount(
  //   connection,
  //   tokenAccount.address
  // )
  
  // console.log(tokenAccountInfo.amount);

  //向帐户中铸造 100 个代币
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    mintAuthority,
    100000000000 // because decimals for the mint are set to 9 
  )
  return tokenAccount.address;
}

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
      s_twitter: 'BNDCEb5uXCuWDxJW9BGmbfvR1JBMAKckfhYrEKW2Bv1W',
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

export const tokentransfer = async (toTokenAccount,amount) => { 
  const fromWallet = web3.PublicKey(S_TWITTER_IDS.devnet.accounts.vault)
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed'
  );

  return await transfer(
    connection,
    fromWallet,
    web3.PublicKey(S_TWITTER_IDS.devnet.mints.tokenSPL).address,
    toTokenAccount.address,
    fromWallet.publicKey,
    amount
  );

}
