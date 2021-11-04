import * as anchor from '@project-serum/anchor';
import * as splToken from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { waitForFinality } from '../utils';

/*
Dialect
*/

type Dialect = {
  mint: PublicKey;
}

type DialectAccount = anchor.web3.AccountInfo<Buffer> & {
  dialect: MintDialect;
  publicKey: PublicKey;
}

export async function getDialectProgramAddress(program: anchor.Program, members: anchor.web3.PublicKey[]): Promise<[anchor.web3.PublicKey, number]> {
  return await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from('dialect'),
      ...members // sort for deterministic address
        .map(m => m.toBuffer())
        .sort((a, b) => a.compare(b)), // TODO: test that buffers sort as expected
    ],
    program.programId,
  );
}

export async function getDialect(program: anchor.Program, members: anchor.web3.PublicKey[]): Promise<MintDialectAccount> {
  const sortedMembers = members.sort((a, b) => a.toBuffer().compare(b.toBuffer()));
  const [publicKey,] = await getDialectProgramAddress(program, sortedMembers);
  const dialect = await program.account.dialectAccount.fetch(publicKey);
  const account = await program.provider.connection.getAccountInfo(publicKey);
  return {
    ...account,
    publicKey,
    dialect,
  } as DialectAccount;
}

export async function createDialect(program: anchor.Program, owner: anchor.web3.Keypair, members: anchor.web3.PublicKey[]): Promise<DialectAccount> {
  const sortedMembers = members.sort((a, b) => a.toBuffer().compare(b.toBuffer()));
  const [publicKey, nonce] = await getDialectProgramAddress(program, sortedMembers);
  // TODO: assert owner in members, handle removal
  const keyedMembers = members.reduce((ms, m, idx) => ({...ms, [`member${idx}`]: m}), {});
  const tx = await program.rpc.createDialect(
    new anchor.BN(nonce),
    {
      accounts: {
        dialect: publicKey,
        owner: owner.publicKey,
        ...keyedMembers,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [owner],
    }
  );
  await waitForFinality(program, tx);
  return await getDialect(program, members);
}

/*
Mint Dialect
*/

type MintDialect = {
  mint: PublicKey;
}

type MintDialectAccount = anchor.web3.AccountInfo<Buffer> & {
  dialect: MintDialect;
  publicKey: PublicKey;
}

export async function getMintDialectProgramAddress(program: anchor.Program, mint: splToken.Token): Promise<[anchor.web3.PublicKey, number]> {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('dialect'), mint.publicKey.toBuffer()],
    program.programId
  );
}

export async function getMintDialect(program: anchor.Program, mint: splToken.Token): Promise<MintDialectAccount> {
  const [publicKey,] = await getMintDialectProgramAddress(program, mint);
  const dialect = await program.account.mintDialectAccount.fetch(publicKey);
  const account = await program.provider.connection.getAccountInfo(publicKey);
  return {
    ...account,
    publicKey,
    dialect,
  } as MintDialectAccount;
}

export async function createMintDialect(program: anchor.Program, mint: splToken.Token, mintAuthority: anchor.web3.Keypair): Promise<MintDialectAccount> {
  const [publicKey, nonce] = await getMintDialectProgramAddress(program, mint);
  const tx = await program.rpc.createMintDialect(
    new anchor.BN(nonce),
    {
      accounts: {
        dialect: publicKey,
        mint: mint.publicKey,
        mintAuthority: mintAuthority.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [mintAuthority],
    }
  );
  await waitForFinality(program, tx);
  return await getMintDialect(program, mint);
}


/*
Messages
*/

type Message = {
  sender: PublicKey;
  text: string;
}

type MessagesAccount = anchor.web3.AccountInfo<Buffer> & {
  messages: Message[];
  publicKey: PublicKey;
}

export async function sendMessage(program: anchor.Program, mint: splToken.Token, sender: anchor.web3.Keypair): Promise<Message> {
  return { text: 'hello' } as Message;
}
