"use client";

import { Container, Title, Text, List, ThemeIcon } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";

export default function PrivacyPolicyPage() {
  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md" ta="center">
        Privacy Policy
      </Title>

      <Text c="dimmed" mb="lg" ta="center">
        Last updated: {new Date().toLocaleDateString()}
      </Text>

      <Text mb="md">
        Welcome to <strong>Ragavachika</strong>. Your privacy is very important
        to us. This Privacy Policy explains how we collect, use, and protect your
        personal information when you use our website and services.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        1. Information We Collect
      </Title>
      <List spacing="xs" icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCircleCheck size={14} /></ThemeIcon>}>
        <List.Item>Personal information (name, email, etc.) provided during registration.</List.Item>
        <List.Item>Usage data such as pages visited, time spent, and interactions.</List.Item>
        <List.Item>Cookies and analytics data to improve website performance.</List.Item>
      </List>

      <Title order={3} mt="lg" mb="sm">
        2. How We Use Your Information
      </Title>
      <Text>
        We use your information to provide and improve our services, send
        notifications, personalize your experience, and ensure compliance with
        legal obligations.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        3. Data Protection
      </Title>
      <Text>
        We implement industry-standard security measures to protect your data.
        However, no method of transmission over the Internet is 100% secure.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        4. Third-Party Services
      </Title>
      <Text>
        We may use third-party services such as analytics tools or payment
        gateways. These services have their own privacy policies.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        5. Your Rights
      </Title>
      <Text>
        You may access, update, or delete your personal data at any time by
        contacting us at <strong>support@ragavachika.com</strong>.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        6. Contact Us
      </Title>
      <Text>
        If you have any questions about this Privacy Policy, please contact us
        at <strong>privacy@ragavachika.com</strong>.
      </Text>
    </Container>
  );
}
