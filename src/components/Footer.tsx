"use client";

import { ActionIcon, Anchor, Group, Text, Title } from "@mantine/core";
import { IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from "@tabler/icons-react";

export default function Footer() {
  const links = [
    { link: "/about", label: "About" },
    { link: "/contact", label: "Contact" },
    { link: "/privacy", label: "Privacy Policy" },
    { link: "/terms", label: "Terms of Service" },
  ];

  const items = links.map((link) => (
    <Anchor
      key={link.label}
      href={link.link}
      size="sm"
      c="dimmed"
      lh={1}
      style={{ textDecoration: "none" }}
    >
      {link.label}
    </Anchor>
  ));

  return (
    <footer
      style={{
        borderTop: "1px solid var(--mantine-color-gray-3)",
        padding: "1.5rem 2rem",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <Group>
          {/* Replace with your logo image if you want */}
          <Title order={4} style={{ fontWeight: 700 }}>
            EduSpark
          </Title>
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} EduSpark. All rights reserved.
          </Text>
        </Group>

        <Group gap="md">{items}</Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon
            size="lg"
            variant="default"
            radius="xl"
            component="a"
            href="https://twitter.com"
            target="_blank"
          >
            <IconBrandTwitter size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            variant="default"
            radius="xl"
            component="a"
            href="https://youtube.com"
            target="_blank"
          >
            <IconBrandYoutube size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            variant="default"
            radius="xl"
            component="a"
            href="https://instagram.com"
            target="_blank"
          >
            <IconBrandInstagram size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </footer>
  );
}
