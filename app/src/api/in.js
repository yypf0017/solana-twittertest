import {getAccount, createMint, createAccount, mintTo, getOrCreateAssociatedTokenAccount, transfer} from "@solana/spl-token";
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";

(async () => {

  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const wallet = Keypair.generate();
  const auxiliaryKeypair = Keypair.generate();

  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature);

  const mint = await createMint(
    connection,
    wallet,
    wallet.publicKey,
    wallet.publicKey,
    9
  );

  // Create custom token account
  const auxiliaryTokenAccount = await createAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
    auxiliaryKeypair
  );

  const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey
  );

  await mintTo(
    connection,
    wallet,
    mint,
    associatedTokenAccount.address,
    wallet,
    50
  );

  const accountInfo = await getAccount(connection, associatedTokenAccount.address);

  console.log(accountInfo.amount);
  // 50

  await transfer(
    connection,
    wallet,
    associatedTokenAccount.address,
    auxiliaryTokenAccount,
    wallet,
    50
  );

  const auxAccountInfo = await getAccount(connection, auxiliaryTokenAccount);

  console.log(auxAccountInfo.amount);
  // 50
})();