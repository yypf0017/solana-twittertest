use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use anchor_lang::solana_program::{
    program::{invoke},
    program_option::{COption},
};

use anchor_spl::token::{self, TokenAccount, MintTo, Transfer, Token, Mint};
use spl_token::instruction::{close_account};
declare_id!("DVb2Fnj4wKqLW34bePJceFH4o5shbixuHkivA849Rs6L");

#[program]
pub mod solana_twitter {
    use super::*;
    pub fn send_tweet(ctx: Context<SendTweet>, topic: String, content: String) -> ProgramResult {
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;
        let author: &Signer = &ctx.accounts.author;
        let payer_token_account= &ctx.accounts.payer_token_account;
        let royalty_token_account= &ctx.accounts.royalty_token_account;
        let clock: Clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_token_account.to_account_info(),
            to: ctx.accounts.royalty_token_account.to_account_info(),
            authority: ctx.accounts.author.to_account_info().clone(),
        };
        let cpi_program = ctx.accounts.system_program.to_account_info().clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, splamount)?;

        tweet.author = *author.key;
        tweet.timestamp = clock.unix_timestamp;
        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }

    pub fn update_tweet(ctx: Context<UpdateTweet>, topic: String, content: String) -> ProgramResult {
        let tweet: &mut Account<Tweet> = &mut ctx.accounts.tweet;

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        tweet.topic = topic;
        tweet.content = content;

        Ok(())
    }

    pub fn delete_tweet(_ctx: Context<DeleteTweet>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(init, payer = author, space = Tweet::LEN)]
    pub tweet: Account<'info, Tweet>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub payer_token_account: Box<Account<'info, TokenAccount>>,
    pub royalty_token_account: Box<Account<'info, TokenAccount>>,
    #[account(address = system_program::ID)]
    pub system_program: AccountInfo<'info>,
    
   
}

#[derive(Accounts)]
pub struct UpdateTweet<'info> {
    #[account(mut, has_one = author)]
    pub tweet: Account<'info, Tweet>,
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteTweet<'info> {
    #[account(mut, has_one = author, close = author)]
    pub tweet: Account<'info, Tweet>,
    pub author: Signer<'info>,
}

#[account]
pub struct Tweet<'info> {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.

impl Tweet {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH;
}

#[error]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}
