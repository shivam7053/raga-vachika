"use client";

import React from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Image,
  useMantineColorScheme,
} from "@mantine/core";

const AboutPage: React.FC = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Container size="md" py="xl">
      <Card
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          backgroundColor: dark
            ? "var(--mantine-color-dark-6)"
            : "var(--mantine-color-gray-0)",
          transition: "all 0.3s ease",
        }}
      >
        <Group align="center" mb="xl">
          <Image
            src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
            alt="EduSpark Logo"
            width={80}
          />
          <div>
            <Title order={2} c={dark ? "white" : "dark"}>
              About EduSpark
            </Title>
            <Text c={dark ? "gray.3" : "gray.7"}>
              Empowering learners through engaging and interactive education.
            </Text>
          </div>
        </Group>

        <Text size="lg" c={dark ? "gray.2" : "gray.8"} mb="md">
          EduSpark is a modern learning platform that connects students,
          instructors, and interactive content for a seamless learning
          experience.
        </Text>

        <Text size="md" c={dark ? "gray.3" : "gray.7"}>
          Our mission is to make education accessible, effective, and enjoyable.
          With personalized progress tracking and a supportive community,
          EduSpark helps you reach your full potential.
        </Text>
      </Card>
    </Container>
  );
};

export default AboutPage;
