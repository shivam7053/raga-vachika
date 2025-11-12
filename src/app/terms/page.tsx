"use client";

import { Container, Title, Text, List, ThemeIcon } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";

export default function TermsOfServicePage() {
  return (
    <Container size="md" py="xl">
      <Title order={2} mb="md" ta="center">
        Terms of Service
      </Title>

      <Text c="dimmed" mb="lg" ta="center">
        Last updated: {new Date().toLocaleDateString()}
      </Text>

      <Text mb="md">
        Welcome to <strong>Ragavachika</strong>. By using our website, you agree
        to comply with and be bound by the following terms and conditions.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        1. Acceptance of Terms
      </Title>
      <Text>
        By accessing this website, you acknowledge that you have read,
        understood, and agree to be bound by these terms.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        2. Use of Services
      </Title>
      <List spacing="xs" icon={<ThemeIcon color="blue" size={20} radius="xl"><IconCircleCheck size={14} /></ThemeIcon>}>
        <List.Item>You agree to use our services only for lawful purposes.</List.Item>
        <List.Item>You will not attempt to hack, damage, or disrupt the website.</List.Item>
        <List.Item>We reserve the right to suspend access for violations.</List.Item>
      </List>

      <Title order={3} mt="lg" mb="sm">
        3. Intellectual Property
      </Title>
      <Text>
        All content, logos, and trademarks on <strong>Ragavachika</strong> are
        the property of Ragavachika or its licensors and may not be used without
        permission.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        4. Limitation of Liability
      </Title>
      <Text>
        We are not responsible for any direct or indirect damages resulting from
        the use of our services or website.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        5. Changes to Terms
      </Title>
      <Text>
        We may update these terms at any time. Continued use of the site means
        you accept the changes.
      </Text>

      <Title order={3} mt="lg" mb="sm">
        6. Contact Us
      </Title>
      <Text>
        For questions regarding these Terms of Service, contact us at{" "}
        <strong>legal@ragavachika.com</strong>.
      </Text>
    </Container>
  );
}
