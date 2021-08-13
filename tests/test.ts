import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as anchor from '@project-serum/anchor';
import assert from 'assert';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { addUserToThread, createThreadAccount, getAccountInfo, getSettings, getThreadAccount } from '../api';

chai.use(chaiAsPromised);
anchor.setProvider(anchor.Provider.local());
const PROGRAM = anchor.workspace.Dialect;

async function _createSettingsAccount(
  pk: anchor.web3.PublicKey,
  nonce: number,
  owner: anchor.web3.PublicKey | null = null,
  signer: anchor.web3.Keypair | null = null,
  instructions: anchor.web3.TransactionInstruction[] | undefined = undefined,
) {
  await PROGRAM.rpc.createUserSettingsAccount(
    new anchor.BN(nonce),
    {
      accounts: {
        owner: owner || PROGRAM.provider.wallet.publicKey,
        settingsAccount: pk,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [signer || PROGRAM.provider.wallet.keypair],
      instructions: instructions,
    }
  );
}

async function _findSettingsProgramAddress(
  publicKey: anchor.web3.PublicKey | null = null
): Promise<[anchor.web3.PublicKey, number]> {
  return await anchor.web3.PublicKey.findProgramAddress(
    [
      publicKey?.toBuffer() || PROGRAM.provider.wallet.publicKey.toBuffer(),
      'settings_account',
    ],
    PROGRAM.programId,
  );
}

describe('test settings', () => {
  let settingspk: anchor.web3.PublicKey;
  let nonce: number;
  it('creates a settings account for the user', async () => {
    const [_settingspk, _nonce] = await _findSettingsProgramAddress();
    settingspk = _settingspk;
    nonce = _nonce;

    await _createSettingsAccount(
      settingspk,
      nonce
    );
    const settingsAccount = await PROGRAM.account.settingsAccount.fetch(settingspk);
    assert.ok(
      settingsAccount.owner.toString() === 
      PROGRAM.provider.wallet.publicKey.toString()
    );
    assert.ok(settingsAccount.threads.length === 0);
  });

  it('should fail to create a settings account a second time for the user', async () => {
    chai
      .expect(_createSettingsAccount(settingspk, nonce))
      .to.eventually.be.rejectedWith(Error);
  });

  it('should fail to create a settings account for the wrong user', async () => {
    const newkp = anchor.web3.Keypair.generate(); // new user
    const [settingspk, nonce] = await _findSettingsProgramAddress(); // derived for old user
    chai.expect(
      _createSettingsAccount(
        settingspk,
        nonce,
        newkp.publicKey,
        newkp,
        [await PROGRAM.account.settingsAccount.createInstruction(newkp)], // TODO: is this failing bc newkp is not for the settingsAccount?
      )
    ).to.eventually.be.rejectedWith(Error);  // 0x92 (A seeds constraint was violated)
  });
});

describe('test threads', () => {
  // TODO: Remove test dependence on previous tests
  let threadpk: PublicKey;
  it('creates a thread account for the user', async () => {
    const {publicKey} = await createThreadAccount(PROGRAM, PROGRAM.provider.wallet);
    threadpk = publicKey;
    // TODO: check if invited users' settings accounts exist. if not, make them on their behalf
    const settingsAccount = await getSettings('/settings', PROGRAM, PROGRAM.provider.connection, PROGRAM.provider.wallet.publicKey);
    assert.ok(settingsAccount.data.threads.length === 1);
    assert.ok(settingsAccount.data.threads[0].key.toString() === publicKey.toString());
  });

  it('adds another user to the thread', async () => {
    // new user
    const newkp = anchor.web3.Keypair.generate(); // invitee

    const transferTransaction = new Transaction();
    transferTransaction.add(SystemProgram.transfer({
      fromPubkey: PROGRAM.provider.wallet.publicKey,
      toPubkey: newkp.publicKey,
      lamports: 1000000000
    }));

    await PROGRAM.provider.send(transferTransaction);
    
    // make settings account
    const [_settingspk, _nonce] = await _findSettingsProgramAddress(newkp.publicKey);

    await _createSettingsAccount(
      _settingspk,
      _nonce,
      newkp.publicKey,
      newkp,
    );

    // thread owner invites new user to thread
    await addUserToThread(
      PROGRAM,
      threadpk,
      newkp.publicKey,
      _settingspk,
      _nonce,
    );
  });
});
