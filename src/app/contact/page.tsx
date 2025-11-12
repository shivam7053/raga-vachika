"use client";

import {
  Container,
  Title,
  TextInput,
  Textarea,
  Button,
  Group,
  Card,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  // Local storage theme sync (if layout uses same logic)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== colorScheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, [colorScheme]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    alert("Thank you for contacting EduSpark! We’ll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Container size="sm" py="xl">
      <Card
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          backgroundColor: dark
            ? "var(--mantine-color-dark-6)"
            : "var(--mantine-color-gray-0)",
          color: dark ? "white" : "black",
          transition: "all 0.3s ease",
        }}
      >
        <Title
          order={2}
          mb="md"
          style={{
            color: dark ? "var(--mantine-color-yellow-4)" : "var(--mantine-color-blue-7)",
          }}
        >
          Contact Us
        </Title>

        <Text c={dark ? "gray.3" : "gray.7"} mb="lg">
          Have questions, feedback, or suggestions? We’d love to hear from you.
          Fill out the form below and our team will respond promptly.
        </Text>

        <TextInput
          label="Full Name"
          placeholder="Your full name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          mb="md"
          styles={{
            input: {
              backgroundColor: dark
                ? "var(--mantine-color-dark-5)"
                : "var(--mantine-color-gray-0)",
              color: dark ? "white" : "black",
            },
          }}
        />

        <TextInput
          label="Email Address"
          placeholder="your@email.com"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          mb="md"
          styles={{
            input: {
              backgroundColor: dark
                ? "var(--mantine-color-dark-5)"
                : "var(--mantine-color-gray-0)",
              color: dark ? "white" : "black",
            },
          }}
        />

        <Textarea
          label="Message"
          placeholder="Write your message..."
          name="message"
          value={form.message}
          onChange={handleChange}
          minRows={4}
          required
          mb="lg"
          styles={{
            input: {
              backgroundColor: dark
                ? "var(--mantine-color-dark-5)"
                : "var(--mantine-color-gray-0)",
              color: dark ? "white" : "black",
            },
          }}
        />

        <Group justify="flex-end">
          <Button
            color={dark ? "yellow" : "blue"}
            radius="xl"
            onClick={handleSubmit}
            style={{
              transition: "background-color 0.3s ease",
            }}
          >
            Send Message
          </Button>
        </Group>
      </Card>
    </Container>
  );
}
