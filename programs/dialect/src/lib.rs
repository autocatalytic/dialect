use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use solana_program::program_option::COption;

declare_id!("5KqWSKK4urvq6LMRyKV6BrC5qPTXr7B3YK8xFmF3MAX7");

/*
Entrypoints
*/
#[program]
pub mod dialect {
    use super::*;

    /*
    Dialects
    */

    pub fn create_dialect(ctx: Context<CreateDialect>, _dialect_nonce: u8) -> ProgramResult {
        // TODO: Assert that members are unique
        // TODO: Assert that owner in members
        // TODO: Pass up scopes
        // TODO: Enumerate over members & scopes
        let dialect = &mut ctx.accounts.dialect;
        let owner = &mut ctx.accounts.owner;
        let members = [
            &mut ctx.accounts.member0,
            &mut ctx.accounts.member1,
            &mut ctx.accounts.member2,
            &mut ctx.accounts.member3,
            &mut ctx.accounts.member4,
            &mut ctx.accounts.member5,
            &mut ctx.accounts.member6,
            &mut ctx.accounts.member7,
        ];
        // TODO: Enforce that members are sorted
        msg!("members: {:?}", members);

        dialect.members = [
            Some(Member {
                pubkey: *members[0].key,
                scopes: [true, true], // owner/write
            }),
            Some(Member {
                pubkey: *members[1].key,
                scopes: [false, true], // write
            }),
            Some(Member {
                pubkey: *members[2].key,
                scopes: [false, false], // read
            }),
            Some(Member {
                pubkey: *members[3].key,
                scopes: [false, false], // read
            }),
            Some(Member {
                pubkey: *members[4].key,
                scopes: [false, false], // read
            }),
            Some(Member {
                pubkey: *members[5].key,
                scopes: [false, false], // read
            }),
            Some(Member {
                pubkey: *members[6].key,
                scopes: [false, false], // read
            }),
            Some(Member {
                pubkey: *members[7].key,
                scopes: [false, false], // read
            }),
        ];
        Ok(())
    }

    /*
    Mint Dialects
    */
    pub fn create_mint_dialect(
        ctx: Context<CreateMintDialect>,
        _dialect_nonce: u8,
    ) -> ProgramResult {
        let mint = &ctx.accounts.mint;
        let dialect = &mut ctx.accounts.dialect;
        dialect.mint = mint.key();
        Ok(())
    }
}

/*
Contexts
*/

#[derive(Accounts)]
#[instruction(dialect_nonce: u8)]
pub struct CreateDialect<'info> {
    #[account(signer, mut)] // mut is needed because they're the payer for PDA initialization
    pub owner: AccountInfo<'info>,
    pub member0: AccountInfo<'info>,
    // TOOD: Set limit, or use remaining accounts for members
    pub member1: AccountInfo<'info>,
    pub member2: AccountInfo<'info>,
    pub member3: AccountInfo<'info>,
    pub member4: AccountInfo<'info>,
    pub member5: AccountInfo<'info>,
    pub member6: AccountInfo<'info>,
    pub member7: AccountInfo<'info>,
    #[account(
        init,
        // TODO: Assert that owner is a member with owner privileges
        // TODO: Assert no dupes among members
        // TODO: Sort member keys for deterministic seed per set
        seeds = [
            b"dialect".as_ref(),
            member0.key().as_ref(),
            member1.key().as_ref(),
            member2.key().as_ref(),
            member3.key().as_ref(),
            member4.key().as_ref(),
            member5.key().as_ref(),
            member6.key().as_ref(),
            member7.key().as_ref(),
        ],
        bump = dialect_nonce,
        payer = owner,
        space = 512, // TODO: Choose space
    )]
    pub dialect: Account<'info, DialectAccount>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(dialect_nonce: u8)]
pub struct CreateMintDialect<'info> {
    #[account(signer, mut)] // mut is needed because they're the payer for PDA initialization
    pub mint_authority: AccountInfo<'info>, // The dialect owner must be the mint authority
    // TODO: Enforce that mint.mint_authority exists
    #[account(constraint = COption::Some(mint_authority.key()) == mint.mint_authority)]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        seeds = [b"dialect".as_ref(), mint.key().as_ref()],
        bump = dialect_nonce,
        payer = mint_authority,
        space = 512, // TODO: Choose space
    )]
    pub dialect: Account<'info, MintDialectAccount>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: AccountInfo<'info>,
}

/*
Accounts
*/
#[account]
#[derive(Default)]
pub struct DialectAccount {
    pub members: [Option<Member>; 8],
}

#[account]
#[derive(Default)]
pub struct MintDialectAccount {
    pub mint: Pubkey,
    // pub mint_authority: Pubkey, // TODO: Do we need this?
}

/*
Data
*/

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Copy)]
pub struct Member {
    pub pubkey: Pubkey,
    // [Owner, Write]. [false, false] implies read-only
    pub scopes: [bool; 2],
}
