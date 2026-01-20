/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { BudgetCard, budgetCardSchema } from "@/components/finance/budget-card";
import { SummaryCard, summaryCardSchema } from "@/components/finance/summary-card";
import { TransactionCard, transactionCardSchema } from "@/components/finance/transaction-card";
import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import { addTransaction, getBudgetStatus, getSpendingByCategory, getSpendingTrend, getSummary, getTransactions, setBudget } from "@/services/finance-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { Amiko } from "next/font/google";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "addTransaction",
    description: "A tool to add a new transaction to the finance data",
    tool: addTransaction,
    toolSchema: z
    .function()
    .args(
      z.object({
        type: z.enum(["income", "expense"]).describe("Transaction type"),
        amount: z.number().describe("Transaction amount"),
        category: z
        .enum([
          "Food & Dining", 
          "Shopping", 
          "Transportation", 
          "Bills & Utilities", 
          "Entertainment", 
          "Healthcare", 
          "Travel", 
          "Education", 
          "Salary", 
          "Freelance", 
          "Investment", 
          "Other"])
          .describe("Transaction category"),
        description: z.string().describe("Transaction description"),
        date: z.string().describe("Transaction date (ISO format)"),
        tags: z.array(z.string()).optional().describe("Optional tags"),
      }),
    )
    .returns(
      z.array(
        z.object({
          id: z.string(),
          type: z.enum(["income", "expense"]),
          amount: z.number(),
          category: z.string(),
          description: z.string(),
          date: z.string(),
          tags: z.array(z.string()).optional(),
        })
      )
    ),
  },
  {
    name: "getTransactions",
    description:
      "Get a list of transactions with optional filtering by type, category, date range, or limit. Use this to show transaction history.",
    tool: getTransactions,
    toolSchema: z
      .function()
      .args(
        z
          .object({
            type: z.enum(["income", "expense"]).optional(),
            category: z.string().optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            limit: z.number().optional(),
          })
          .optional()
      )
      .returns(
        z.array(
          z.object({
            id: z.string(),
            type: z.enum(["income", "expense"]),
            amount: z.number(),
            category: z.string(),
            description: z.string(),
            date: z.string(),
            tags: z.array(z.string()).optional(),
          })
        )
      ),
  },
  {
    name: "getSpendingByCategory",
    description:
      "Get spending breakdown by category. Returns totals and percentages for each category. Useful for showing where money is being spent.",
    tool: getSpendingByCategory,
    toolSchema: z
      .function()
      .args(
        z
          .object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            type: z.enum(["income", "expense"]).optional(),
          })
          .optional()
      )
      .returns(
        z.array(
          z.object({
            category: z.string(),
            total: z.number(),
            percentage: z.number(),
            transactionCount: z.number(),
          })
        )
      ),
  },
  {
    name: "getSpendingTrend",
    description:
      "Get spending trends over time. Returns income, expenses, and net balance grouped by day, week, or month. Useful for showing financial trends.",
    tool: getSpendingTrend,
    toolSchema: z
      .function()
      .args(
        z
          .object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            groupBy: z.enum(["day", "week", "month"]).optional(),
          })
          .optional()
      )
      .returns(
        z.array(
          z.object({
            date: z.string(),
            income: z.number(),
            expenses: z.number(),
            net: z.number(),
          })
        )
      ),
  },
  {
    name: "getBudgetStatus",
    description:
      "Get current budget status for all categories. Shows budget limits and how much has been spent in each category.",
    tool: getBudgetStatus,
    toolSchema: z
      .function()
      .args()
      .returns(
        z.array(
          z.object({
            category: z.string(),
            limit: z.number(),
            spent: z.number(),
          })
        )
      ),
  },
  {
    name: "setBudget",
    description:
      "Set or update a budget limit for a specific category. Use this when the user wants to set spending limits.",
    tool: setBudget,
    toolSchema: z
      .function()
      .args(
        z.object({
          category: z.string().describe("Budget category"),
          limit: z.number().describe("Budget limit amount"),
        })
      )
      .returns(
        z.object({
          category: z.string(),
          limit: z.number(),
          spent: z.number(),
        })
      ),
  },
  {
    name: "getSummary",
    description:
      "Get financial summary including total income, total expenses, balance, and transaction count. Use this to show overall financial status.",
    tool: getSummary,
    toolSchema: z
      .function()
      .args(
        z
          .object({
            startDate: z.string().optional(),
            endDate: z.string().optional(),
          })
          .optional()
      )
      .returns(
        z.object({
          totalIncome: z.number(),
          totalExpenses: z.number(),
          balance: z.number(),
          transactionCount: z.number(),
        })
      ),
  },
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    toolSchema: z
      .function()
      .args(
        z
          .object({
            continent: z.string().optional(),
            sortBy: z.enum(["population", "growthRate"]).optional(),
            limit: z.number().optional(),
            order: z.enum(["asc", "desc"]).optional(),
          })
          .optional(),
      )
      .returns(
        z.array(
          z.object({
            countryCode: z.string(),
            countryName: z.string(),
            continent: z.enum([
              "Asia",
              "Africa",
              "Europe",
              "North America",
              "South America",
              "Oceania",
            ]),
            population: z.number(),
            year: z.number(),
            growthRate: z.number(),
          }),
        ),
      ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    toolSchema: z
      .function()
      .args(
        z
          .object({
            startYear: z.number().optional(),
            endYear: z.number().optional(),
          })
          .optional(),
      )
      .returns(
        z.array(
          z.object({
            year: z.number(),
            population: z.number(),
            growthRate: z.number(),
          }),
        ),
      ),
  },
  // Add more tools here
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
    // Finance components
  {
    name: "TransactionCard",
    description:
      "A component that displays a single financial transaction with type (income/expense), amount, category, description, date, and optional tags. Use this to show individual transactions in a list.",
    component: TransactionCard,
    propsSchema: transactionCardSchema,
  },
  {
    name: "BudgetCard",
    description:
      "A component that displays budget information for a category including limit, amount spent, remaining amount, and a progress bar. Shows warning when over budget. Use this to display budget status.",
    component: BudgetCard,
    propsSchema: budgetCardSchema,
  },
  {
    name: "SummaryCard",
    description:
      "A component that displays financial summary including total income, total expenses, net balance, and transaction count. Shows positive balance in green and negative in red. Use this to show overall financial status.",
    component: SummaryCard,
    propsSchema: summaryCardSchema,
  },
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Add more components here
];
