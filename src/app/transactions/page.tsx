"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContexts";
import NextLink from "next/link";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TransactionRecord, Transaction } from "@/types/masterclass";

type FilterStatus = "all" | "success" | "failed";

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.uid) {
        setLoadingTransactions(false);
        return;
      }

      setLoadingTransactions(true);
      try {
        const transactionsRef = collection(
          db,
          `user_profiles/${user.uid}/transactions`
        );
        const q = query(transactionsRef, where("type", "==", "purchase"));
        const querySnapshot = await getDocs(q);

        const fetchedTransactions: TransactionRecord[] = [];
        querySnapshot.forEach((doc) => {
          fetchedTransactions.push({
            id: doc.id,
            ...doc.data(),
          } as TransactionRecord);
        });

        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (authLoading || loadingTransactions) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: "#FF7A00" }} />
      </Box>
    );
  }

  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((t) => t.status === filter);

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const stats = {
    total: transactions.length,
    success: transactions.filter((t) => t.status === "success").length,
    failed: transactions.filter((t) => t.status === "failed").length,
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: 16, pb: 12 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Button
            component={NextLink}
            href="/profile"
            startIcon={<ArrowBackIcon />}
            sx={{ color: "text.secondary", mb: 2, "&:hover": { bgcolor: "action.hover" } }}
          >
            Back to Profile
          </Button>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            Transaction History
          </Typography>
          <Typography color="text.secondary">
            View your past purchase and enrollment records.
          </Typography>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 3, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>{stats.total}</Typography>
              <Typography color="text.secondary">Total</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 3, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main" }}>{stats.success}</Typography>
              <Typography color="text.secondary">Successful</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper elevation={0} sx={{ bgcolor: "background.paper", p: 2, borderRadius: 3, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "error.main" }}>{stats.failed}</Typography>
              <Typography color="text.secondary">Failed</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filter Tabs */}
        <Box sx={{ display: "flex", gap: 1, mb: 4 }}>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "contained" : "outlined"}
            sx={{
              bgcolor: filter === "all" ? "secondary.main" : "transparent",
              borderColor: "secondary.main",
              color: filter === "all" ? theme.palette.getContrastText(theme.palette.secondary.main) : "secondary.main",
              "&:hover": { bgcolor: filter === "all" ? "secondary.dark" : "action.hover" },
            }}
          >
            All ({stats.total})
          </Button>
          <Button
            onClick={() => setFilter("success")}
            variant={filter === "success" ? "contained" : "outlined"}
            sx={{
              bgcolor: filter === "success" ? "success.main" : "transparent",
              borderColor: "success.main",
              color: filter === "success" ? theme.palette.getContrastText(theme.palette.success.main) : "success.main",
              "&:hover": { bgcolor: filter === "success" ? "success.dark" : "rgba(102, 187, 106, 0.1)" },
            }}
          >
            Success ({stats.success})
          </Button>
          <Button
            onClick={() => setFilter("failed")}
            variant={filter === "failed" ? "contained" : "outlined"}
            sx={{
              bgcolor: filter === "failed" ? "error.main" : "transparent",
              borderColor: "error.main",
              color: filter === "failed" ? theme.palette.getContrastText(theme.palette.error.main) : "error.main",
              "&:hover": { bgcolor: filter === "failed" ? "error.dark" : "rgba(244, 67, 54, 0.1)" },
            }}
          >
            Failed ({stats.failed})
          </Button>
        </Box>

        {/* Transactions Table */}
        <TableContainer component={Paper} sx={{ bgcolor: "background.paper", borderRadius: 3 }}>
          <Table aria-label="transactions table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Course</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Order ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow
                  key={transaction.orderId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {transaction.courseTitle || 'Enrollment'}
                  </TableCell>
                  <TableCell>₹{transaction.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={transaction.status === 'success' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {transaction.orderId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {sortedTransactions.length === 0 && (
          <Paper
            elevation={0}
            sx={{ bgcolor: "background.paper", textAlign: "center", p: 8, mt: 4, borderRadius: 3 }}
          >
            <ReceiptIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              No Transactions Found
            </Typography>
            <Typography color="text.secondary">
              {filter !== "all"
                ? `You don't have any ${filter} transactions`
                : "Your transaction history will appear here"}
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}