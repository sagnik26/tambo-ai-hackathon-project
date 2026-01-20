"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const summaryCardSchema = z.object({
  totalIncome: z.number().describe("Total income amount"),
  totalExpenses: z.number().describe("Total expenses amount"),
  balance: z.number().describe("Net balance (income - expenses)"),
  transactionCount: z.number().optional().describe("Number of transactions"),
  period: z.string().optional().describe("Time period (e.g., 'This Month')"),
});

export type SummaryCardProps = z.infer<typeof summaryCardSchema> &
  React.HTMLAttributes<HTMLDivElement>;

export const SummaryCard = React.forwardRef<
  HTMLDivElement,
  SummaryCardProps
>(
  (
    {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount,
      period,
      className,
      ...props
    },
    ref
  ) => {
    const isPositive = balance >= 0;

    // Show loading state if critical data is missing
    if (totalIncome === undefined || totalExpenses === undefined) {
      return (
        <div
          ref={ref}
          className={cn(
            "border rounded-lg p-6 bg-gray-50",
            className
          )}
          {...props}
        >
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-gray-500">Loading financial data...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "border rounded-lg p-6 bg-gradient-to-br",
          isPositive
            ? "border-green-200 from-green-50 to-white"
            : "border-red-200 from-red-50 to-white",
          className
        )}
        {...props}
      >
        {period && (
          <p className="text-sm text-gray-500 mb-4">{period}</p>
        )}

        <div className="space-y-4">
          {/* Balance */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <div className="flex items-center gap-2">
              <Wallet
                className={cn(
                  "w-5 h-5",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              />
              <p
                className={cn(
                  "text-3xl font-bold",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                ${balance?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Income and Expenses */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-gray-600">Income</p>
              </div>
              <p className="text-xl font-semibold text-green-600">
                ${totalIncome?.toFixed(2)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <p className="text-xs text-gray-600">Expenses</p>
              </div>
              <p className="text-xl font-semibold text-red-600">
                ${totalExpenses?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Transaction Count */}
          {transactionCount !== undefined && (
            <div className="pt-2 text-xs text-gray-500">
              {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SummaryCard.displayName = "SummaryCard";