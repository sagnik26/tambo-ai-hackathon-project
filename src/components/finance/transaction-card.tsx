"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export const transactionCardSchema = z.object({
  id: z.string().describe("Unique transaction identifier"),
  type: z.enum(["income", "expense"]).describe("Transaction type"),
  amount: z.number().describe("Transaction amount"),
  category: z.string().describe("Transaction category"),
  description: z.string().describe("Transaction description"),
  date: z.string().describe("Transaction date (ISO format)"),
  tags: z.array(z.string()).optional().describe("Optional tags"),
});

export type TransactionCardProps = z.infer<typeof transactionCardSchema> &
  React.HTMLAttributes<HTMLDivElement>;

export const TransactionCard = React.forwardRef<
  HTMLDivElement,
  TransactionCardProps
>(({ id, type, amount, category, description, date, tags, className, ...props }, ref) => {
  const isIncome = type === "income";
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      ref={ref}
      className={cn(
        "border rounded-lg p-4 transition-colors hover:bg-gray-50",
        isIncome ? "border-green-200 bg-green-50/30" : "border-red-200 bg-red-50/30",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={cn(
              "p-2 rounded-full",
              isIncome ? "bg-green-100" : "bg-red-100"
            )}
          >
            {isIncome ? (
              <ArrowUpCircle className="w-5 h-5 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{description ?? "No description"}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{category ?? "No category"}</p>
            <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
            {tags && tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p
            className={cn(
              "text-lg font-semibold",
              isIncome ? "text-green-600" : "text-red-600"
            )}
          >
            {isIncome ? "+" : "-"}${amount?.toFixed(2) ?? "0.00"}
          </p>
        </div>
      </div>
    </div>
  );
});

TransactionCard.displayName = "TransactionCard";