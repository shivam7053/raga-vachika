"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Stack,
  Loader,
  Center,
  Tabs,
  Paper,
  SimpleGrid,
  Button,
} from "@mantine/core";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Calendar,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  courseTitle: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  paymentMethod: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      console.log("❌ No user logged in");
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 Fetching transactions for user:", user.uid);

        // Try without orderBy first to check if data exists
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        console.log("📦 Found transactions:", snapshot.size);

        if (snapshot.empty) {
          console.log("⚠️ No transactions found for this user");
          setTransactions([]);
          setLoading(false);
          return;
        }

        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          console.log("📄 Transaction data:", doc.id, docData);
          return {
            id: doc.id,
            ...docData,
          };
        }) as Transaction[];

        // Sort manually by createdAt
        data.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Descending order
        });

        console.log("✅ Loaded transactions:", data);
        setTransactions(data);
      } catch (error: any) {
        console.error("❌ Error fetching transactions:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return (
      <Center h="80vh">
        <Stack align="center">
          <Loader size="xl" color="indigo" />
          <Text c="dimmed">Loading transactions...</Text>
        </Stack>
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="80vh">
        <Card shadow="lg" p="xl" radius="lg">
          <Stack align="center">
            <AlertTriangle size={50} color="orange" />
            <Title order={3}>Login Required</Title>
            <Text c="dimmed">Please login to view your transactions</Text>
          </Stack>
        </Card>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="80vh">
        <Card shadow="lg" p="xl" radius="lg">
          <Stack align="center">
            <XCircle size={50} color="red" />
            <Title order={3}>Error Loading Transactions</Title>
            <Text c="dimmed">{error}</Text>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </Stack>
        </Card>
      </Center>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} color="green" />;
      case "failed":
        return <XCircle size={20} color="red" />;
      case "pending":
        return <Clock size={20} color="orange" />;
      default:
        return <Clock size={20} color="gray" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      case "pending":
        return "orange";
      default:
        return "gray";
    }
  };

  const filteredTransactions =
    activeTab === "all"
      ? transactions
      : transactions.filter((t) => t.status === activeTab);

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "completed").length,
    pending: transactions.filter((t) => t.status === "pending").length,
    failed: transactions.filter((t) => t.status === "failed").length,
    totalAmount: transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <Container size="xl" py="xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title order={1} mb="md">
          Transaction History
        </Title>
        <Text c="dimmed" mb="xl">
          View all your payment transactions and their status
        </Text>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
          <Card shadow="md" radius="lg" withBorder p="lg">
            <Group>
              <CreditCard size={30} color="#5B21B6" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Transactions
                </Text>
                <Text size="xl" fw={700}>
                  {stats.total}
                </Text>
              </div>
            </Group>
          </Card>

          <Card shadow="md" radius="lg" withBorder p="lg">
            <Group>
              <CheckCircle size={30} color="green" />
              <div>
                <Text size="xs" c="dimmed">
                  Completed
                </Text>
                <Text size="xl" fw={700} c="green">
                  {stats.completed}
                </Text>
              </div>
            </Group>
          </Card>

          <Card shadow="md" radius="lg" withBorder p="lg">
            <Group>
              <Clock size={30} color="orange" />
              <div>
                <Text size="xs" c="dimmed">
                  Pending
                </Text>
                <Text size="xl" fw={700} c="orange">
                  {stats.pending}
                </Text>
              </div>
            </Group>
          </Card>

          <Card shadow="md" radius="lg" withBorder p="lg">
            <Group>
              <DollarSign size={30} color="blue" />
              <div>
                <Text size="xs" c="dimmed">
                  Total Spent
                </Text>
                <Text size="xl" fw={700} c="blue">
                  ₹{stats.totalAmount}
                </Text>
              </div>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(val) => setActiveTab(val || "all")} color="indigo">
          <Tabs.List>
            <Tabs.Tab value="all">All ({stats.total})</Tabs.Tab>
            <Tabs.Tab value="completed" leftSection={<CheckCircle size={16} />}>
              Completed ({stats.completed})
            </Tabs.Tab>
            <Tabs.Tab value="pending" leftSection={<Clock size={16} />}>
              Pending ({stats.pending})
            </Tabs.Tab>
            <Tabs.Tab value="failed" leftSection={<XCircle size={16} />}>
              Failed ({stats.failed})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={activeTab} pt="md">
            {filteredTransactions.length === 0 ? (
              <Card shadow="md" radius="lg" p="xl">
                <Center>
                  <Stack align="center">
                    <AlertTriangle size={50} color="gray" />
                    <Text c="dimmed" size="lg">
                      No {activeTab === "all" ? "" : activeTab} transactions found
                    </Text>
                    {activeTab === "all" && (
                      <Text size="sm" c="dimmed">
                        Make your first purchase to see transactions here
                      </Text>
                    )}
                  </Stack>
                </Center>
              </Card>
            ) : (
              <Stack gap="md">
                {filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card shadow="md" radius="lg" withBorder p="lg">
                      <Group justify="space-between" wrap="nowrap">
                        <Group wrap="nowrap">
                          {getStatusIcon(transaction.status)}
                          <div>
                            <Text fw={600} size="lg">
                              {transaction.courseTitle}
                            </Text>
                            <Group gap="xs" mt={5}>
                              <Text size="sm" c="dimmed">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </Text>
                              <Badge size="sm" color={getStatusColor(transaction.status)}>
                                {transaction.status.toUpperCase()}
                              </Badge>
                              <Badge size="sm" variant="outline">
                                {transaction.paymentMethod}
                              </Badge>
                            </Group>
                            {transaction.paymentId && (
                              <Text size="xs" c="dimmed" mt={5}>
                                Payment ID: {transaction.paymentId}
                              </Text>
                            )}
                          </div>
                        </Group>

                        <div style={{ textAlign: "right" }}>
                          <Text fw={700} size="xl" c="green">
                            ₹{transaction.amount}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  </motion.div>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <Card mt="xl" p="md" withBorder>
            <Text size="xs" c="dimmed">
              Debug Info: User ID: {user?.uid} | Transactions: {transactions.length}
            </Text>
          </Card>
        )}
      </motion.div>
    </Container>
  );
}