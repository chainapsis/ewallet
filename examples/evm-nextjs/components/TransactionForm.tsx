"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Hex, isAddress, toHex } from "viem";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import Button from "./Button";
import useKeplrEmbedded from "@/hooks/useKeplrEmbedded";
import usePublicClient from "@/hooks/usePublicClient";

interface TransactionFormProps {
  className?: string;
}

const formSchema = z.object({
  recipientAddress: z
    .string()
    .trim()
    .min(1, { message: "Required" })
    .refine((v) => isAddress(v), { message: "Invalid address" }),
  amount: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, { message: "Enter a positive integer (wei)" })
    .refine(
      (v) => {
        try {
          return BigInt(v) > BigInt(0);
        } catch {
          return false;
        }
      },
      { message: "Amount must be > 0" },
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionForm({ className }: TransactionFormProps) {
  const { address, provider } = useKeplrEmbedded();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { recipientAddress: "", amount: "" },
  });

  const [isTxSending, setIsTxSending] = useState(false);

  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | "failed">(
    "pending",
  );

  const explorerTxUrl = useMemo(() => {
    return txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : "";
  }, [txHash]);

  async function handleSendTransaction(values: FormValues) {
    if (!address || isTxSending || !provider) {
      return;
    }

    let txHashForTracking: Hex | null = null;

    setIsTxSending(true);
    try {
      const { recipientAddress, amount } = values;

      // make sure we are on the correct chain
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      // send transaction
      txHashForTracking = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            to: recipientAddress as `0x${string}`,
            value: toHex(BigInt(amount)),
          },
        ],
      });

      setTxHash(txHashForTracking);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTxSending(false);
    }

    if (!txHashForTracking) {
      return;
    }

    try {
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHashForTracking,
      });

      setTxStatus(receipt.status === "success" ? "confirmed" : "failed");

      await queryClient.invalidateQueries({
        queryKey: ["balance", address],
        exact: true,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function resetForm() {
    reset();
    setTxHash("");
    setTxStatus("pending");
  }

  return (
    <div
      className={`bg-widget border border-widget-border rounded-3xl p-10 shadow-xl min-h-[360px] flex flex-col ${
        className ?? ""
      }`}
    >
      {!txHash ? (
        <FormView
          register={register}
          errors={errors}
          onSubmit={handleSubmit(handleSendTransaction)}
          canSend={!!address && isValid && !isTxSending}
          loading={isTxSending}
        />
      ) : txStatus === "pending" ? (
        <TrackingView txHash={txHash} explorerTxUrl={explorerTxUrl} />
      ) : (
        <ResultView
          status={txStatus}
          explorerTxUrl={explorerTxUrl}
          onBack={resetForm}
        />
      )}
    </div>
  );
}

function FormView(props: {
  register: ReturnType<typeof useForm<FormValues>>["register"];
  errors: Record<string, { message?: string }>;
  onSubmit: () => void;
  canSend: boolean;
  loading: boolean;
}) {
  const { register, errors, onSubmit, canSend, loading } = props;
  return (
    <div className="flex flex-col gap-5 flex-1">
      <h3 className="text-2xl font-semibold tracking-tight mb-2">
        Send Transaction
      </h3>
      <div className="flex flex-col gap-3">
        <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300 mb-2">
          Recipient Address
        </label>
        <input
          type="text"
          placeholder="0x..."
          className={`w-full bg-widget-field border rounded-2xl px-6 py-5 font-mono text-sm focus:outline-none transition-all ${
            errors.recipientAddress
              ? "border-red-500/70 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/40"
              : "border-widget-border focus:border-widget-border-hover focus:ring-2 focus:ring-widget-border-hover"
          }`}
          {...register("recipientAddress")}
        />
        {errors.recipientAddress?.message && (
          <p className="text-xs text-red-400">
            {errors.recipientAddress.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="block text-xs font-semibold tracking-wide uppercase text-gray-300 mb-2">
          Amount (WEI)
        </label>
        <input
          type="text"
          placeholder="0"
          className={`w-full bg-widget-field border rounded-2xl px-6 py-5 text-sm focus:outline-none transition-all ${
            errors.amount
              ? "border-red-500/70 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/40"
              : "border-widget-border focus:border-widget-border-hover focus:ring-2 focus:ring-widget-border-hover"
          }`}
          {...register("amount")}
        />
        {errors.amount?.message && (
          <p className="text-xs text-red-400">{errors.amount.message}</p>
        )}
      </div>

      <Button
        className="mt-auto"
        fullWidth
        size="lg"
        disabled={!canSend}
        loading={loading}
        onClick={onSubmit}
      >
        Send Transaction
      </Button>
    </div>
  );
}

function TrackingView({
  txHash,
  explorerTxUrl,
}: {
  txHash: string;
  explorerTxUrl: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center flex-1">
      <div className="h-12 w-12 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <div className="px-4">
        <h3 className="text-2xl font-semibold tracking-tight">
          Tracking transaction…
        </h3>
        <p className="text-xs text-gray-300 mt-3 font-mono break-all whitespace-pre-wrap max-w-full">
          {txHash}
        </p>
      </div>
      {explorerTxUrl && (
        <Link
          href={explorerTxUrl}
          target="_blank"
          className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
        >
          View on explorer
        </Link>
      )}
    </div>
  );
}

function ResultView({
  status,
  explorerTxUrl,
  onBack,
}: {
  status: "confirmed" | "failed";
  explorerTxUrl: string;
  onBack: () => void;
}) {
  const isSuccess = status === "confirmed";
  return (
    <div className="flex flex-col h-full flex-1">
      <div className="flex flex-col items-center justify-center gap-6 text-center flex-1">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            isSuccess
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isSuccess ? (
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">
          {isSuccess ? "Transaction confirmed" : "Transaction failed"}
        </h3>
        {explorerTxUrl && (
          <Link
            href={explorerTxUrl}
            target="_blank"
            className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
          >
            View on explorer
          </Link>
        )}
      </div>
      <Button size="lg" fullWidth onClick={onBack}>
        Try again
      </Button>
    </div>
  );
}
