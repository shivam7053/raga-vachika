"use client";

import { Container, Title, Text, Button } from "@mantine/core";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container size="lg" className="py-20 text-center">
      <Title order={1}>Welcome to EduSpark 🎓</Title>
      <Text c="dimmed" mt="sm">
        Fun and interactive learning for students up to Class 5
      </Text>
      <Button component={Link} href="/courses" mt="xl" size="lg">
        Explore Courses
      </Button>
    </Container>
  );
}
