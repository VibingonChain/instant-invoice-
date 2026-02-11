'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { type InvoicePayload } from '@/lib/validation';
import { CHAINS, ERC20_TRANSFER_ABI, ERC20_BALANCE_ABI, type Chain } from '@/lib/chains';
import { TxStatus } from './TxStatus';
import { WarningBanner } from './WarningBanner';

interface PayButtonProps {
  payload: InvoicePayload;
  disabled?: boolean;
}

export function PayButton({ payload, disabled }: PayButtonProps) {
  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainConfig = CHAINS[payload.chain as Chain];
  const isCorrectChain = chainId === chainConfig.chainId;

  const { data: balance } = useReadContract({
    address: chainConfig.usdc,
    abi: ERC20_BALANCE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: isConnected && isCorrectChain && !!address },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const amountBigInt = parseUnits(payload.amount, 6);
  const hasInsufficientBalance = balance !== undefined && balance < amountBigInt;
  const isSelfPay = address?.toLowerCase() === payload.to.toLowerCase();
  const isDustAmount = parseFloat(payload.amount) < 0.01;

  const formattedBalance =
    balance !== undefined ? formatUnits(balance, 6) : null;

  const getTxState = () => {
    if (isConfirmed && txHash) {
      return { status: 'confirmed' as const, hash: txHash, explorerUrl: chainConfig.explorer };
    }
    if (isConfirming && txHash) {
      return { status: 'confirming' as const, hash: txHash, explorerUrl: chainConfig.explorer };
    }
    if (isWriteError) {
      const msg = writeError?.message || 'Unknown error';
      if (msg.includes('User rejected') || msg.includes('user rejected')) {
        return { status: 'rejected' as const };
      }
      return { status: 'error' as const, message: msg.slice(0, 100) };
    }
    if (isWritePending) {
      return { status: 'pending' as const };
    }
    return { status: 'idle' as const };
  };

  const handlePay = () => {
    writeContract({
      address: chainConfig.usdc,
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [payload.to as `0x${string}`, amountBigInt],
    });
  };

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <button
              onClick={openConnectModal}
              disabled={disabled}
              className="w-full rounded-lg bg-brand-green px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Connect Wallet to Pay
            </button>
          )}
        </ConnectButton.Custom>
      </div>
    );
  }

  if (!isCorrectChain) {
    return (
      <div className="space-y-3">
        <WarningBanner variant="amber">
          Switch to {chainConfig.name} to pay this invoice
        </WarningBanner>
        <button
          onClick={() => switchChain({ chainId: chainConfig.chainId })}
          className="w-full rounded-lg bg-brand-green px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Switch to {chainConfig.name}
        </button>
      </div>
    );
  }

  const txState = getTxState();

  return (
    <div className="space-y-3">
      {hasInsufficientBalance && (
        <WarningBanner variant="red">
          Insufficient USDC balance. You have {formattedBalance} USDC.
        </WarningBanner>
      )}

      {isSelfPay && !isConfirmed && (
        <WarningBanner variant="amber">
          You&apos;re paying yourself — confirm this is intended
        </WarningBanner>
      )}

      {isDustAmount && !isConfirmed && (
        <WarningBanner variant="amber">
          Very small amount — confirm this is correct
        </WarningBanner>
      )}

      {txState.status === 'idle' && (
        <button
          onClick={handlePay}
          disabled={disabled || hasInsufficientBalance}
          className="w-full rounded-lg bg-brand-green px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pay {payload.amount} USDC
        </button>
      )}

      <TxStatus
        state={txState}
        onRetry={() => {
          resetWrite();
        }}
      />
    </div>
  );
}
