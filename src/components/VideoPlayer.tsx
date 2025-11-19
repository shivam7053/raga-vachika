"use client";

import { useState } from "react";
import { Card, Text, Center, Modal, AspectRatio, Badge, Group } from "@mantine/core";
import { PlayCircle, Lock, Play } from "lucide-react";

interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    youtubeId?: string;
    description?: string;
    duration?: string;
  };
  hasAccess: boolean;
  index: number;
}

export default function VideoPlayer({ video, hasAccess, index }: VideoPlayerProps) {
  const [opened, setOpened] = useState(false);

  if (!hasAccess) {
    return (
      <Card shadow="md" radius="lg" withBorder>
        <Center h={200} bg="gray.1" style={{ position: "relative" }}>
          <Lock size={40} color="gray" />
        </Center>
        <Group justify="space-between" mt="sm">
          <div>
            <Text fw={500} lineClamp={1}>
              {index + 1}. {video.title}
            </Text>
            {video.duration && (
              <Text size="xs" c="dimmed">
                {video.duration}
              </Text>
            )}
          </div>
          <Badge color="red" variant="light">
            Locked
          </Badge>
        </Group>
      </Card>
    );
  }

  if (!video.youtubeId) {
    return (
      <Card shadow="md" radius="lg" withBorder>
        <Center h={200} bg="gray.1">
          <PlayCircle size={40} color="gray" />
        </Center>
        <Group justify="space-between" mt="sm">
          <div>
            <Text fw={500} lineClamp={1}>
              {index + 1}. {video.title}
            </Text>
            <Text size="xs" c="red">
              Video not available
            </Text>
          </div>
        </Group>
      </Card>
    );
  }

  return (
    <>
      <Card
        shadow="md"
        radius="lg"
        withBorder
        style={{ cursor: "pointer" }}
        onClick={() => setOpened(true)}
      >
        <div style={{ position: "relative" }}>
          <AspectRatio ratio={16 / 9}>
            <img
              src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
              alt={video.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </AspectRatio>
          <Center
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.3)",
              borderRadius: "8px",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.3)";
            }}
          >
            <Play size={50} color="white" fill="white" />
          </Center>
        </div>
        <Group justify="space-between" mt="sm">
          <div style={{ flex: 1 }}>
            <Text fw={500} lineClamp={1}>
              {index + 1}. {video.title}
            </Text>
            {video.duration && (
              <Text size="xs" c="dimmed">
                {video.duration}
              </Text>
            )}
          </div>
          <Badge color="blue" variant="light">
            Watch
          </Badge>
        </Group>
      </Card>

      {/* Video Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={video.title}
        size="xl"
        centered
      >
        <AspectRatio ratio={16 / 9}>
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              border: "none",
              borderRadius: "8px",
            }}
          />
        </AspectRatio>
        {video.description && (
          <Text size="sm" c="dimmed" mt="md">
            {video.description}
          </Text>
        )}
      </Modal>
    </>
  );
}