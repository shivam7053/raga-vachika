"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Text,
  Title,
  Loader,
  Badge,
  Group,
  Button,
  Notification,
} from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { showNotification } from "@mantine/notifications";

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const q = query(collection(db, "userCourses"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (data.length === 0) {
          showNotification({
            title: "No Courses Found",
            message: "You haven’t enrolled in any course yet.",
            color: "orange",
            icon: <IconAlertTriangle size={18} />,
          });
        } else {
          showNotification({
            title: "Courses Loaded",
            message: `Fetched ${data.length} enrolled course(s).`,
            color: "green",
            icon: <IconCheck size={18} />,
          });
        }

        setEnrollments(data);
      } catch (err) {
        console.error("Error loading enrollments:", err);
        showNotification({
          title: "Error",
          message: "Could not fetch enrolled courses.",
          color: "red",
          icon: <IconX size={18} />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  // Renew expired course (dummy logic)
  const handleRenew = async (courseId: string) => {
    try {
      const now = new Date();
      const expires = new Date(now);
      expires.setMonth(expires.getMonth() + 1);

      const docRef = doc(db, "userCourses", `${user?.uid}_${courseId}`);
      await updateDoc(docRef, {
        purchasedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        status: "active",
      });

      showNotification({
        title: "Renewal Successful 🎉",
        message: "Course renewed for one more month!",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      // Refresh list after renewal
      setEnrollments((prev) =>
        prev.map((c) =>
          c.courseId === courseId
            ? { ...c, expiresAt: expires.toISOString(), status: "active" }
            : c
        )
      );
    } catch (error) {
      console.error("Error renewing:", error);
      showNotification({
        title: "Renewal Failed",
        message: "Something went wrong during renewal.",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  // Handle not logged in
  if (!user)
    return (
      <Notification
        color="red"
        icon={<IconAlertTriangle size={18} />}
        title="Login Required"
        mt="xl"
      >
        Please log in to view your enrolled courses.
      </Notification>
    );

  // Handle loading
  if (loading)
    return (
      <div className="flex justify-center mt-16">
        <Loader size="lg" />
      </div>
    );

  return (
    <div className="p-6">
      <Title order={2} mb="md">
        🎓 My Courses
      </Title>

      {enrollments.length === 0 ? (
        <Text c="dimmed">No enrolled courses yet.</Text>
      ) : (
        enrollments.map((enroll) => {
          const now = new Date();
          const expired = new Date(enroll.expiresAt) < now;
          const purchasedDate = new Date(enroll.purchasedAt).toLocaleDateString();
          const expiryDate = new Date(enroll.expiresAt).toLocaleDateString();

          return (
            <Card key={enroll.id} shadow="sm" radius="md" withBorder mb="lg" p="lg">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={4}>{enroll.courseTitle}</Title>
                  <Text size="sm" mt="xs">
                    Roll No: <strong>{enroll.rollNumber}</strong>
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">
                    Purchased: {purchasedDate}
                  </Text>
                  <Text size="xs" c={expired ? "red" : "dimmed"} mt="xs">
                    Expires: {expiryDate}
                  </Text>
                </div>

                <Badge color={expired ? "red" : "green"} size="lg">
                  {expired ? "Expired" : "Active"}
                </Badge>
              </Group>

              <Group mt="md">
                {expired ? (
                  <Button
                    leftSection={<IconRefresh size={16} />}
                    color="orange"
                    onClick={() => handleRenew(enroll.courseId)}
                  >
                    Renew Subscription
                  </Button>
                ) : (
                  <Button
                    component="a"
                    href={`/courses/${enroll.courseId}`}
                    color="blue"
                    variant="light"
                  >
                    Go to Course
                  </Button>
                )}
              </Group>
            </Card>
          );
        })
      )}
    </div>
  );
}
