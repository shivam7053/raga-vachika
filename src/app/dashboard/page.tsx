"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  Image,
  Text,
  Grid,
  Container,
  Title,
  Loader,
} from "@mantine/core";

interface Course {
  id: string;
  title: string;
  thumbnail: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      if (data?.activeCourses?.length) {
        const allCourses = await Promise.all(
          data.activeCourses.map(async (id: string) => {
            const c = await getDoc(doc(db, "courses", id));
            return { id, ...c.data() };
          })
        );
        setCourses(allCourses as Course[]);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader color="blue" size="lg" />
      </div>
    );

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="lg">
        My Courses
      </Title>
      {courses.length === 0 ? (
        <Text>No courses purchased yet.</Text>
      ) : (
        <Grid>
          {courses.map((course) => (
            <Grid.Col key={course.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Image src={course.thumbnail} height={160} alt={course.title} />
                </Card.Section>
                <Text fw={600} mt="sm">
                  {course.title}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Container>
  );
}
