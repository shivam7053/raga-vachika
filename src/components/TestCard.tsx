"use client";

import { Card, Text, Badge, Group, Button } from "@mantine/core";
import { BookOpen, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface TestCardProps {
  test: {
    id: string;
    title: string;
    questions?: any[];
    totalMarks?: number;
    duration?: number;
  };
  userAttempt?: {
    score: number;
    totalMarks: number;
    attemptedAt: string;
  };
  hasAccess: boolean;
}

export default function TestCard({ test, userAttempt, hasAccess }: TestCardProps) {
  const router = useRouter();

  if (!hasAccess) {
    return (
      <Card shadow="md" radius="lg" withBorder p="md">
        <Group justify="space-between" align="flex-start">
          <Group align="flex-start">
            <Lock size={30} color="gray" />
            <div>
              <Text fw={600}>{test.title}</Text>
              <Text size="sm" c="dimmed">
                {test.questions?.length || 0} questions
              </Text>
              <Badge color="red" variant="light" mt={5}>
                Locked
              </Badge>
            </div>
          </Group>
        </Group>
      </Card>
    );
  }

  return (
    <Card shadow="md" radius="lg" withBorder p="md">
      <Group justify="space-between" align="flex-start">
        <Group align="flex-start">
          <BookOpen size={30} color="teal" />
          <div>
            <Text fw={600}>{test.title}</Text>
            <Text size="sm" c="dimmed">
              {test.questions?.length || 0} questions
            </Text>
            {test.duration && (
              <Text size="xs" c="dimmed">
                Duration: {test.duration} minutes
              </Text>
            )}
            {userAttempt ? (
              <>
                <Badge color="green" mt={5}>
                  Score: {userAttempt.score}/{userAttempt.totalMarks}
                </Badge>
                <Text size="xs" c="dimmed" mt={5}>
                  Last attempt:{" "}
                  {new Date(userAttempt.attemptedAt).toLocaleDateString()}
                </Text>
              </>
            ) : (
              <Badge color="gray" mt={5}>
                Not Attempted
              </Badge>
            )}
          </div>
        </Group>

        <Button
          color={userAttempt ? "blue" : "teal"}
          size="xs"
          radius="xl"
          onClick={() => router.push(`/test/${test.id}`)}
        >
          {userAttempt ? "Retake Test" : "Attempt Test"}
        </Button>
      </Group>
    </Card>
  );
}