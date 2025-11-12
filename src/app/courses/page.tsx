"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  Image,
  Text,
  Title,
  Group,
  Button,
  Loader,
  SimpleGrid,
  Center,
  Badge,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBook, IconX, IconCheck, IconCurrencyRupee } from "@tabler/icons-react";
import Link from "next/link";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          notifications.show({
            title: "No Courses Found",
            message: "There are currently no courses available.",
            color: "yellow",
            icon: <IconX size={18} />,
          });
          setCourses([]);
          return;
        }

        const data = snapshot.docs
          .map((doc) => {
            const course = doc.data();
            if (!course.title || !course.description || typeof course.price !== "number") {
              console.warn(`Invalid course data for ${doc.id}`, course);
              return null;
            }

            return {
              id: doc.id,
              title: course.title || "Untitled Course",
              description: course.description || "No description provided.",
              price: course.price ?? 0,
              thumbnail: course.thumbnail || "",
              subject: course.subject || "General",
              grade: course.grade || "-",
              createdAt: course.createdAt?.toDate?.() || new Date(),
            };
          })
          .filter(Boolean);

        setCourses(data);

        notifications.show({
          title: "Courses Loaded",
          message: `Successfully fetched ${data.length} course(s).`,
          color: "green",
          icon: <IconCheck size={18} />,
        });
      } catch (error: any) {
        console.error("Error fetching courses:", error);
        notifications.show({
          title: "Error Fetching Courses",
          message: error.message || "An unexpected error occurred.",
          color: "red",
          icon: <IconX size={18} />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading)
    return (
      <Center h="80vh">
        <Loader size="xl" variant="bars" />
        <Text ml="md">Loading courses...</Text>
      </Center>
    );

  return (
    <div className="p-6">
      <Group justify="space-between" mb="lg">
        <Title order={2} fw={700} tt="capitalize">
          📚 Explore Our Courses
        </Title>
        <Text c="dimmed" size="sm">
          {courses.length} course{courses.length !== 1 ? "s" : ""} available
        </Text>
      </Group>

      {courses.length === 0 ? (
        <Center h="50vh">
          <div className="text-center">
            <IconBook size={60} stroke={1.5} color="gray" />
            <Text mt="sm" c="dimmed">
              No courses available right now.
            </Text>
          </div>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
          {courses.map((course) => (
            <Card
              key={course.id}
              shadow="lg"
              radius="lg"
              withBorder
              p="md"
              className="hover:scale-[1.02] transition-all duration-300"
            >
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  height={180}
                  fit="cover"
                  radius="md"
                />
              ) : (
                <Center h={180} bg="gray.1" radius="md">
                  <IconBook size={50} stroke={1.5} color="gray" />
                </Center>
              )}

              <Stack mt="sm" spacing="xs">
                <Group justify="space-between">
                  <Title order={4} fw={600}>
                    {course.title}
                  </Title>
                  <Badge color="blue" variant="light">
                    {course.subject}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2}>
                  {course.description}
                </Text>

                <Group justify="space-between" mt="sm" align="center">
                  <Group gap={4}>
                    <IconCurrencyRupee size={16} />
                    <Text fw={600}>{course.price}</Text>
                  </Group>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="xs" variant="gradient" gradient={{ from: "indigo", to: "cyan" }}>
                      View Details
                    </Button>
                  </Link>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
