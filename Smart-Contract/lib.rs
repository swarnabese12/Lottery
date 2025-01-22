use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, program::invoke_signed, system_instruction};

declare_id!("84pCTFayHs72yMh4jd67f4YX4a6rvSjM46w7pbYvvkUz");

#[program]
pub mod lottery_program {
    use super::*;

    pub fn initialize_lottery(ctx: Context<InitializeLottery>, ticket_price: u64) -> Result<()> {
        let lottery_account = &mut ctx.accounts.lottery_account;

        require!(ticket_price > 0, ErrorCode::InvalidTicketPrice);

        lottery_account.ticket_price = ticket_price;
        lottery_account.tickets_sold = 0;
        lottery_account.buyers = Vec::new();

        let (lottery_wallet, _bump) = Pubkey::find_program_address(
            &[
                b"lottery_wallet",
                lottery_account.to_account_info().key.as_ref(),
            ],
            ctx.program_id,
        );

        lottery_account.lottery_wallet = lottery_wallet;

        invoke(
            &system_instruction::transfer(&ctx.accounts.payer.key(), &lottery_wallet, 1_000_000),
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.lottery_wallet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        msg!("Lottery initialized successfully!");
        msg!("Lottery Wallet PDA: {}", lottery_wallet);
        msg!("Ticket Price: {} lamports", ticket_price);

        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let lottery_account = &mut ctx.accounts.lottery_account;

        let ticket_price = lottery_account.ticket_price;
        require!(ticket_price > 0, ErrorCode::InvalidTicketPrice);
        msg!("Ticket Buyer is: {}", &ctx.accounts.ticket_buyer.key());

        invoke(
            &system_instruction::transfer(
                &ctx.accounts.ticket_buyer.key(),
                &ctx.accounts.lottery_wallet.key(),
                ticket_price,
            ),
            &[
                ctx.accounts.ticket_buyer.to_account_info(),
                ctx.accounts.lottery_wallet.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        lottery_account.tickets_sold += 1;
        lottery_account.buyers.push(ctx.accounts.ticket_buyer.key());

        msg!("Buyers List is {:?}", lottery_account.buyers);
        msg!(
            "Ticket purchased successfully! Total tickets sold: {}",
            lottery_account.tickets_sold
        );

        Ok(())
    }

    pub fn draw_winner(ctx: Context<DrawWinner>) -> Result<()> {
        let lottery_account = &mut ctx.accounts.lottery_account;

        require!(
            lottery_account.tickets_sold == 5,
            ErrorCode::NotEnoughTickets
        );

        let winner = lottery_account.buyers[2];
        msg!("Winner is: {}", winner);

        let ticket_price = lottery_account.ticket_price;
        let total_lamports = ticket_price * 5;
        let winner_share = total_lamports * 80 / 100;

        let (lottery_wallet, bump) = Pubkey::find_program_address(
            &[b"lottery_wallet", lottery_account.key().as_ref()],
            ctx.program_id,
        );

        invoke_signed(
            &system_instruction::transfer(
                &lottery_wallet,
                &ctx.accounts.winner.key(),
                winner_share,
            ),
            &[
                ctx.accounts.lottery_wallet.to_account_info(),
                ctx.accounts.winner.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[&[b"lottery_wallet", lottery_account.key().as_ref(), &[bump]]],
        )?;

        msg!(
            "Transferred {} lamports to the winner: {}",
            winner_share,
            winner
        );

        lottery_account.tickets_sold = 0;
        lottery_account.buyers.clear();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 4 + 4 + (32 * 5),
    )]
    pub lottery_account: Account<'info, LotteryAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_wallet", lottery_account.key().as_ref()],
        bump
    )]
    pub lottery_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub ticket_buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"lottery_wallet", lottery_account.key().as_ref()],
        bump
    )]
    pub lottery_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub lottery_account: Account<'info, LotteryAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinner<'info> {
    #[account(
        mut,
        seeds = [b"lottery_wallet", lottery_account.key().as_ref()],
        bump
    )]
    pub lottery_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub lottery_account: Account<'info, LotteryAccount>,

    #[account(mut)]
    pub winner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct LotteryAccount {
    pub lottery_wallet: Pubkey,
    pub ticket_price: u64,
    pub tickets_sold: u32,
    pub buyers: Vec<Pubkey>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Ticket price must be greater than zero.")]
    InvalidTicketPrice,

    #[msg("Not enough tickets sold to draw a winner.")]
    NotEnoughTickets,
}
