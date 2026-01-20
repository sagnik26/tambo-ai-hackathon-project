"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const budgetCardSchema = z.object({
  category: z.string().describe("Budget category"),
  limit: z.number().describe("Budget limit amount"),
  spent: z.number().describe("Amount spent in this category"),
  showProgress: z.boolean().optional().describe("Whether to show progress bar"),
});

export type BudgetCardProps = z.infer<typeof budgetCardSchema> &
  React.HTMLAttributes<HTMLDivElement>;

export const BudgetCard = React.forwardRef<
  HTMLDivElement,
  BudgetCardProps
>(({ category, limit, spent, showProgress = true, className, ...props }, ref) => {
  const percentage = (spent / limit) * 100;
  const isOverBudget = spent > limit;
  const remaining = limit - spent;

  return (
    <div
      ref={ref}
      className={cn(
        "border rounded-lg p-4",
        isOverBudget ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-white",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{category ?? "No category"}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            ${spent?.toFixed(2)} / ${limit?.toFixed(2)}
          </p>
        </div>
        {isOverBudget ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        )}
      </div>

      {showProgress && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn(
                "h-2.5 rounded-full transition-all",
                isOverBudget
                  ? "bg-red-500"
                  : percentage > 80
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>
              {isOverBudget
                ? `Over by $${Math.abs(remaining).toFixed(2)}`
                : `$${remaining.toFixed(2)} remaining`}
            </span>
            <span>{percentage?.toFixed(1) ?? "0.0"}%</span>
          </div>
        </div>
      )}
    </div>
  );
});

BudgetCard.displayName = "BudgetCard";