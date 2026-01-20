"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Calendar,
  IndianRupee,
  AlertCircle,
} from "lucide-react";
import { getUserTransactions } from "@/utils/userUtils";
import { Transaction } from "@/types/masterclass";

interface TransactionHistoryProps {
  userId: string;
}

export default function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "success" | "failed" | "pending">(
    "all"
  );

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getUserTransactions(userId);

      // Sort by newest first — FIXED TYPE ERROR
      const sorted = data.sort(
        (a: Transaction, b: Transaction) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setTransactions(sorted);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "success":
        return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "failed":
        return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      case "pending":
        return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      default:
        return base;
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTransactions = transactions.filter((txn) =>
    filter === "all" ? true : txn.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-orange-600 dark:from-sky-400 dark:to-orange-400 mb-2">
          Transaction History
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          View all your payment transactions and their status
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {["all", "success", "failed", "pending"].map((status) => (
          <button
            key={status}
            onClick={() =>
              setFilter(status as "all" | "success" | "failed" | "pending")
            }
            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
              filter === status
                ? "bg-gradient-to-r from-sky-500 to-orange-500 text-white shadow-md"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs opacity-80">
              (
              {status === "all"
                ? transactions.length
                : transactions.filter((t) => t.status === status).length}
              )
            </span>
          </button>
        ))}
      </div>

      {/* Transactions */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No transactions found
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {filter !== "all"
              ? `You don't have any ${filter} transactions`
              : "Your transaction history will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.orderId}
              className="bg-white/50 dark:bg-gray-800/50 border border-sky-100 dark:border-blue-900 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1 p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate text-lg">
                      {transaction.masterclassTitle}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-sky-500" />
                        {formatDate(transaction.timestamp)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-orange-500" />
                        {transaction.method.toUpperCase()}
                      </span>
                    </div>

                    {transaction.failureReason && (
                      <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-300">
                          {transaction.failureReason}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-400 dark:text-gray-500 font-mono break-all">
                      Order: {transaction.orderId}
                      {transaction.paymentId && (
                        <>
                          <span className="mx-2">•</span>
                          Payment: {transaction.paymentId}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-xl font-bold text-gray-900 dark:text-white">
                    <IndianRupee className="w-5 h-5 text-gray-400" />
                    {transaction.amount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-sky-100 dark:border-blue-900">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/10">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {transactions.filter((t) => t.status === "success").length}
              </div>
              <div className="text-xs font-medium text-green-800 dark:text-green-300 mt-1 uppercase tracking-wide">
                Successful
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {transactions.filter((t) => t.status === "failed").length}
              </div>
              <div className="text-xs font-medium text-red-800 dark:text-red-300 mt-1 uppercase tracking-wide">
                Failed
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/10">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {transactions.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mt-1 uppercase tracking-wide">
                Pending
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
