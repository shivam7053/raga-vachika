"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Tabs,
  Container,
  Text,
  Button,
  Loader,
  Center,
  Paper,
  Divider,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import {
  PlayCircle,
  FileText,
  BookOpen,
  AlertTriangle,
  Info,
  Lock,
  ShoppingCart,
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
import { useAuth } from "@/context/AuthContext";
import PaymentModal from "@/components/PaymentModal";
import CourseHeader from "@/components/CourseHeader";
import VideoPlayer from "@/components/VideoPlayer";
import NotesCard from "@/components/NotesCard";
import TestCard from "@/components/TestCard";
import { notifications } from "@mantine/notifications";

export default function CourseDetailsPage() {
  const params = useParams();
  const { user } = useAuth();

  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [userTests, setUserTests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Loading course details...");
  const [purchaseInfo, setPurchaseInfo] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Fetch course details
      const courseRef = doc(db, "courses", courseId as string);
      const courseSnap = await getDoc(courseRef);
      if (!courseSnap.exists()) {
        setCourse(null);
        setStatusMessage("Course not found.");
        setLoading(false);
        return;
      }

      const courseData = { id: courseSnap.id, ...courseSnap.data() };
      setCourse(courseData);

      // Fetch related content (videos, notes, tests)
      const [videosSnap, notesSnap, testsSnap] = await Promise.all([
        getDocs(query(collection(db, "videos"), where("courseId", "==", courseData.id))),
        getDocs(query(collection(db, "notes"), where("courseId", "==", courseData.id))),
        getDocs(query(collection(db, "tests"), where("courseId", "==", courseData.id))),
      ]);

      setVideos(videosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setNotes(notesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTests(testsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Fetch user purchase info and test attempts
      if (user) {
        // Check if user purchased the course
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

        // Fetch user test attempts
        const userTestsRef = query(
          collection(db, "userTests"),
          where("userId", "==", user.uid),
          where("courseId", "==", courseId)
        );
        const userTestsSnap = await getDocs(userTestsRef);
        const userTestsData = userTestsSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        console.log("✅ Fetched user test attempts:", userTestsData);
        setUserTests(userTestsData);
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

  useEffect(() => {
    if (!courseId || typeof courseId !== "string") {
      setStatusMessage("Invalid course ID. Please go back and try again.");
      setLoading(false);
      return;
    }

    fetchCourseData();
  }, [courseId, user]);

  const handleBuyCourse = () => {
    if (!user) {
      notifications.show({
        title: "Login Required",
        message: "Please login to purchase this course",
        color: "red",
      });
      return;
    }
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchCourseData();
    notifications.show({
      title: "Welcome! 🎉",
      message: "You can now access all course content",
      color: "green",
    });
  };

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
      {/* Payment Modal */}
      <PaymentModal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        course={{
          id: course.id,
          title: course.title,
          price: course.price || 0,
          duration: course.duration || 365,
        }}
        onSuccess={handlePaymentSuccess}
      />

      {/* Course Header */}
      <CourseHeader
        course={course}
        videosCount={videos.length}
        notesCount={notes.length}
        testsCount={tests.length}
        purchaseInfo={purchaseInfo}
        hasAccess={hasAccess}
        onBuyCourse={handleBuyCourse}
      />

      {/* Alert if Locked */}
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
            : "Please log in to view course content."}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        color="indigo"
        radius="md"
        variant="outline"
      >
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

        {/* Overview Tab */}
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
              This course includes {videos.length} videos, {notes.length} notes,
              and {tests.length} tests.
            </Text>

            {!hasAccess && (
              <>
                <Divider my="md" />
                <Center>
                  <Button
                    color="green"
                    size="md"
                    leftSection={<ShoppingCart size={18} />}
                    onClick={handleBuyCourse}
                  >
                    Enroll Now - ₹{course.price ?? "—"}
                  </Button>
                </Center>
              </>
            )}
          </Paper>
        </Tabs.Panel>

        {/* Classes Tab */}
        <Tabs.Panel value="classes" pt="md">
          {videos.length === 0 ? (
            <Paper shadow="md" radius="lg" p="xl">
              <Center>
                <Text c="dimmed">No videos available yet</Text>
              </Center>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {videos.map((video, index) => (
                <VideoPlayer
                  key={video.id}
                  video={video}
                  hasAccess={hasAccess}
                  index={index}
                />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        {/* Notes Tab */}
        <Tabs.Panel value="notes" pt="md">
          {notes.length === 0 ? (
            <Paper shadow="md" radius="lg" p="xl">
              <Center>
                <Text c="dimmed">No notes available yet</Text>
              </Center>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {notes.map((note, index) => (
                <NotesCard
                  key={note.id}
                  note={note}
                  hasAccess={hasAccess}
                  index={index}
                />
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        {/* Tests Tab */}
        <Tabs.Panel value="tests" pt="md">
          {tests.length === 0 ? (
            <Paper shadow="md" radius="lg" p="xl">
              <Center>
                <Text c="dimmed">No tests available yet</Text>
              </Center>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {tests.map((test) => {
                const userAttempt = userTests.find((ut) => ut.testId === test.id);
                return (
                  <TestCard
                    key={test.id}
                    test={test}
                    userAttempt={userAttempt}
                    hasAccess={hasAccess}
                  />
                );
              })}
            </SimpleGrid>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}