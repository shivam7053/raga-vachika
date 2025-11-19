"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Title,
  Text,
  Radio,
  Group,
  Stack,
  Progress,
  Loader,
  Center,
  Container,
} from "@mantine/core";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { notifications } from "@mantine/notifications";

export default function TestAttemptPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log("🔍 useEffect triggered with:", { id, user });

    if (!id) {
      notifications.show({
        title: "⚠️ Invalid Route",
        message: "No test ID found in URL.",
        color: "red",
      });
      console.warn("❌ No test ID found in URL.");
      setLoading(false);
      return;
    }

    if (!user) {
      notifications.show({
        title: "🔒 Login Required",
        message: "Please login first to access tests.",
        color: "yellow",
      });
      console.warn("❌ No user logged in.");
      setLoading(false);
      return;
    }

    const fetchTest = async () => {
      try {
        console.log("📡 Fetching test data for ID:", id);
        const docRef = doc(db, "tests", id as string);
        const snapshot = await getDoc(docRef);
        console.log("📦 Firestore snapshot:", snapshot.exists(), snapshot.data());

        if (!snapshot.exists()) {
          notifications.show({
            title: "❌ Test Not Found",
            message: `No test found with ID: ${id}`,
            color: "red",
          });
          console.warn("❌ Test not found in Firestore for ID:", id);
          return;
        }

        const data = snapshot.data();
        console.log("✅ Loaded test data:", data);

        if (!data.questions || !Array.isArray(data.questions)) {
          notifications.show({
            title: "⚠️ Invalid Test Format",
            message: "Test does not contain valid questions.",
            color: "orange",
          });
          console.error("⚠️ Invalid test format:", data);
          return;
        }

        setTest(data);
        notifications.show({
          title: "✅ Test Loaded",
          message: `Loaded test: ${data.title || "Untitled"}`,
          color: "green",
        });
      } catch (error: any) {
        console.error("❌ Error fetching test:", error);
        notifications.show({
          title: "Error",
          message: error.message || "Failed to fetch test data.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id, user]);

  if (loading) {
    return (
      <Center h="70vh">
        <Loader color="blue" size="lg" />
      </Center>
    );
  }

  if (!test) {
    return (
      <Center h="70vh">
        <Card shadow="lg" p="xl">
          <Title order={3} ta="center" mb="md">
            ❌ No Test Data
          </Title>
          <Text ta="center">
            Could not load test. Check console logs for detailed errors.
          </Text>
        </Card>
      </Center>
    );
  }

  // Show score screen after submission
  if (score !== null) {
    const percentage = ((score / test.totalMarks) * 100).toFixed(1);
    return (
      <Container size="sm" py="xl">
        <Card shadow="lg" p="xl" radius="lg" withBorder ta="center">
          <Title order={2} mb="md">🎉 Test Completed!</Title>
          <Text size="xl" fw={700} c="blue" mb="md">
            Your Score: {score} / {test.totalMarks}
          </Text>
          <Text size="lg" c="dimmed" mb="xl">
            Percentage: {percentage}%
          </Text>
          <Group justify="center" gap="md">
            <Button 
              variant="outline" 
              onClick={() => {
                setScore(null);
                setCurrent(0);
                setAnswers({});
              }}
            >
              Retake Test
            </Button>
            <Button onClick={() => router.back()}>
              Back to Course
            </Button>
          </Group>
        </Card>
      </Container>
    );
  }

  const currentQuestion = test?.questions[current];
  console.log("🧩 Current question:", currentQuestion);

  const handleNext = () => {
    console.log("➡️ Next clicked. Current answers:", answers);
    if (!answers[current]) {
      notifications.show({
        title: "⚠️ Answer Required",
        message: "Please select an option before moving on.",
        color: "orange",
      });
      return;
    }
    if (current < test.questions.length - 1) setCurrent(current + 1);
  };

  const handlePrev = () => {
    console.log("⬅️ Previous clicked.");
    if (current > 0) setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    console.log("🧾 Submitting test with answers:", answers);

    if (Object.keys(answers).length < test.questions.length) {
      notifications.show({
        title: "⚠️ Incomplete Test",
        message: "Please answer all questions before submitting.",
        color: "orange",
      });
      console.warn("⚠️ Incomplete answers:", answers);
      return;
    }

    setSubmitting(true);

    try {
      let correct = 0;
      test.questions.forEach((q: any, i: number) => {
        if (answers[i] === q.correctOption) correct++;
      });

      const finalScore = (
        (correct / test.questions.length) *
        test.totalMarks
      ).toFixed(2);

      setScore(Number(finalScore));
      console.log("✅ Test completed. Score:", finalScore);

      if (user) {
        // ✅ FIXED: Save as individual document with composite key
        // This ensures each test attempt is stored separately and can be queried
        // If user retakes, it will overwrite the previous attempt automatically
        const userTestId = `${user.uid}_${id}`;
        const userTestRef = doc(db, "userTests", userTestId);
        
        await setDoc(userTestRef, {
          userId: user.uid,
          testId: id,
          courseId: test.courseId, // ✅ CRITICAL: Include courseId for filtering
          title: test.title,
          score: Number(finalScore),
          totalMarks: test.totalMarks,
          correctAnswers: correct,
          totalQuestions: test.questions.length,
          attemptedAt: new Date().toISOString(),
        });

        notifications.show({
          title: "🎉 Test Submitted",
          message: `Score saved: ${finalScore}/${test.totalMarks}`,
          color: "green",
        });
        console.log("💾 Score saved to Firestore with ID:", userTestId);
      } else {
        console.warn("⚠️ No user found during submit. Score not saved.");
      }
    } catch (error: any) {
      console.error("❌ Error submitting test:", error);
      notifications.show({
        title: "Error Submitting Test",
        message: error.message || "Unexpected error occurred.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Card shadow="lg" p="xl" radius="lg" withBorder>
        <Title order={3}>{test.title || "Untitled Test"}</Title>
        <Progress
          value={((current + 1) / test.questions.length) * 100}
          mt="md"
          mb="lg"
        />
        <Text size="lg" fw={600}>
          Q{current + 1}: {currentQuestion?.questionText || "No question text"}
        </Text>

        <Radio.Group
          value={answers[current] || ""}
          onChange={(val) => {
            console.log(`📝 Selected option ${val} for Q${current + 1}`);
            setAnswers({ ...answers, [current]: val });
          }}
          mt="md"
        >
          <Stack>
            {currentQuestion?.options?.map((opt: string, i: number) => (
              <Radio
                key={i}
                value={String.fromCharCode(65 + i)}
                label={`${String.fromCharCode(65 + i)}. ${opt}`}
              />
            )) || (
              <Text c="dimmed" mt="md">
                No options available.
              </Text>
            )}
          </Stack>
        </Radio.Group>

        <Group justify="space-between" mt="xl">
          <Button variant="default" disabled={current === 0} onClick={handlePrev}>
            Previous
          </Button>
          {current < test.questions.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button 
              color="green" 
              onClick={handleSubmit}
              loading={submitting}
            >
              Submit Test
            </Button>
          )}
        </Group>
      </Card>
    </Container>
  );
}