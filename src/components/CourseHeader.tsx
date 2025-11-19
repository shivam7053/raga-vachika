"use client";

import { Title, Text, Button, Group, Badge } from "@mantine/core";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface CourseHeaderProps {
  course: {
    title: string;
    description: string;
    price?: number;
  };
  videosCount: number;
  notesCount: number;
  testsCount: number;
  purchaseInfo?: {
    status: string;
    purchasedAt: string;
    expiresAt?: string;
  };
  hasAccess: boolean;
  onBuyCourse: () => void;
}

export default function CourseHeader({
  course,
  videosCount,
  notesCount,
  testsCount,
  purchaseInfo,
  hasAccess,
  onBuyCourse,
}: CourseHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Title order={1} ta="center" mb="sm">
        {course.title}
      </Title>
      <Text ta="center" size="lg" c="dimmed" mb="sm">
        {course.description}
      </Text>

      <Group justify="center" mb="md">
        <Badge color="blue">{videosCount} Videos</Badge>
        <Badge color="grape">{notesCount} Notes</Badge>
        <Badge color="teal">{testsCount} Tests</Badge>
      </Group>

      {purchaseInfo ? (
        <Group justify="center" mb="xl">
          <Badge color={hasAccess ? "green" : "red"} size="lg">
            {hasAccess ? "✓ Active" : "Inactive"}
          </Badge>
          {purchaseInfo.purchasedAt && (
            <Badge color="blue" size="lg">
              Purchased:{" "}
              {new Date(purchaseInfo.purchasedAt).toLocaleDateString()}
            </Badge>
          )}
          {purchaseInfo.expiresAt && (
            <Badge color="orange" size="lg">
              Expires: {new Date(purchaseInfo.expiresAt).toLocaleDateString()}
            </Badge>
          )}
        </Group>
      ) : (
        <Group justify="center" mb="xl">
          <Button
            color="indigo"
            radius="xl"
            size="lg"
            leftSection={<ShoppingCart size={20} />}
            onClick={onBuyCourse}
          >
            Buy Course ₹{course.price ?? "—"}
          </Button>
        </Group>
      )}
    </motion.div>
  );
}