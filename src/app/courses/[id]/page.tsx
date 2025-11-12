"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Tabs,
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  Loader,
  Center,
  Badge,
  Paper,
  Divider,
  Alert,
  SimpleGrid,
  Tooltip,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  PlayCircle,
  FileText,
  BookOpen,
  AlertTriangle,
  Info,
  Lock,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext"; // ✅ ensure AuthContext is implemented

export default function CourseDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Loading course details...");
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!courseId || typeof courseId !== "string") {
      setStatusMessage("Invalid course ID. Please go back and try again.");
      setLoading(false);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setCourse(null);
          setStatusMessage("Course not found.");
          setLoading(false);
          return;
        }

        const courseData = { id: courseSnap.id, ...courseSnap.data() };
        setCourse(courseData);

        // fetch associated data
        const [videosSnap, notesSnap, testsSnap] = await Promise.all([
          getDocs(query(collection(db, "videos"), where("courseId", "==", courseData.id))),
          getDocs(query(collection(db, "notes"), where("courseId", "==", courseData.id))),
          getDocs(query(collection(db, "tests"), where("courseId", "==", courseData.id))),
        ]);

        setVideos(videosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setNotes(notesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setTests(testsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // check purchase info
        if (user) {
          const q = query(
            collection(db, "userCourses"),
            where("userId", "==", user.uid),
            where("courseId", "==", courseId)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            setPurchaseInfo(data);
            setHasAccess(data.status === "active");
          } else {
            setPurchaseInfo(null);
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        setStatusMessage("Error loading course data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  if (loading)
    return (
      <Center h="80vh" style={{ flexDirection: "column" }}>
        <Loader color="indigo" size="xl" />
        <Text mt="md" fw={500} c="dimmed">
          {statusMessage}
        </Text>
      </Center>
    );

  if (!course)
    return (
      <Center h="60vh" style={{ flexDirection: "column" }}>
        <AlertTriangle size={50} color="orange" />
        <Text mt="md" size="lg" c="dimmed">
          {statusMessage || "Course not found."}
        </Text>
      </Center>
    );

  return (
    <Container size="lg" py="xl">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title order={1} ta="center" mb="sm">
          {course.title}
        </Title>
        <Text ta="center" size="lg" c="dimmed" mb="sm">
          {course.description}
        </Text>

        <Group justify="center" mb="md">
          <Badge color="blue" size="lg">
            {videos.length} Videos
          </Badge>
          <Badge color="grape" size="lg">
            {notes.length} Notes
          </Badge>
          <Badge color="teal" size="lg">
            {tests.length} Tests
          </Badge>
        </Group>

        {purchaseInfo ? (
          <Group justify="center" mb="xl">
            <Badge color={hasAccess ? "green" : "red"} size="lg">
              {hasAccess ? "Active" : "Inactive"}
            </Badge>
            <Badge color="blue" size="lg">
              Purchased: {new Date(purchaseInfo.purchasedAt).toLocaleDateString()}
            </Badge>
            <Badge color="orange" size="lg">
              Expires: {new Date(purchaseInfo.expiresAt).toLocaleDateString()}
            </Badge>
          </Group>
        ) : (
          <Group justify="center" mb="xl">
            <Button color="indigo" radius="xl" size="md">
              Buy Course ₹{course.price ?? "—"}
            </Button>
          </Group>
        )}
      </motion.div>

      {!hasAccess && (
        <Alert
          icon={<Lock size={18} />}
          title={user ? "Purchase Required" : "Login Required"}
          color="red"
          variant="filled"
          mb="md"
        >
          {user
            ? "You need to purchase this course to access videos, notes, and tests."
            : "Please log in to see your access or purchase this course."}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={setActiveTab} color="indigo" radius="md" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="overview" leftSection={<Info size={18} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="classes" leftSection={<PlayCircle size={18} />}>
            Classes
          </Tabs.Tab>
          <Tabs.Tab value="notes" leftSection={<FileText size={18} />}>
            Notes
          </Tabs.Tab>
          <Tabs.Tab value="tests" leftSection={<BookOpen size={18} />}>
            Tests
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Paper shadow="md" radius="lg" p="lg">
            <Text size="lg" fw={600}>
              Welcome to {course.title}
            </Text>
            <Text mt="sm" c="dimmed">
              {course.description}
            </Text>
            <Divider my="md" />
            <Text size="sm" c="dimmed">
              This course includes {videos.length} videos, {notes.length} notes, and {tests.length} tests.
            </Text>
          </Paper>
        </Tabs.Panel>

        {/* Classes */}
        <Tabs.Panel value="classes" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {videos.map((v) => (
              <Card key={v.id} shadow="md" radius="lg" withBorder>
                {hasAccess ? (
                  v.youtubeId ? (
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${v.youtubeId}`}
                      title={v.title}
                      allowFullScreen
                      style={{ borderRadius: "12px" }}
                    />
                  ) : (
                    <Center h={200} bg="gray.1">
                      <PlayCircle size={40} color="gray" />
                    </Center>
                  )
                ) : (
                  <Center h={200} bg="gray.1">
                    <Lock size={40} color="gray" />
                  </Center>
                )}
                <Text fw={500} mt="sm">
                  {v.title}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        {/* Notes */}
        <Tabs.Panel value="notes" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {notes.map((n) => (
              <Card key={n.id} shadow="md" radius="lg" withBorder p="md">
                {hasAccess ? (
                  <FileText size={30} color="purple" />
                ) : (
                  <Lock size={30} color="gray" />
                )}
                <Text fw={500} mt="sm">
                  {n.title}
                </Text>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {n.description || "No description"}
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        {/* Tests */}
        <Tabs.Panel value="tests" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {tests.map((t) => (
              <Card key={t.id} shadow="md" radius="lg" withBorder p="md">
                {hasAccess ? (
                  <BookOpen size={30} color="teal" />
                ) : (
                  <Lock size={30} color="gray" />
                )}
                <Text fw={500} mt="sm">
                  {t.title}
                </Text>
                <Text size="sm" c="dimmed">
                  {t.questions?.length || 0} questions
                </Text>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
