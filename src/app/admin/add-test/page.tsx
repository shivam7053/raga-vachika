"use client";

import { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Select,
  Textarea,
  Title,
  NumberInput,
  Group,
  Card,
  Stack,
  Divider,
} from "@mantine/core";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function AddTest() {
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    totalMarks: 0,
    duration: 0,
    description: "",
  });

  const [questions, setQuestions] = useState<
    { questionText: string; options: string[]; correctOption: string }[]
  >([]);

  const [newQuestion, setNewQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      const snapshot = await getDocs(collection(db, "courses"));
      const courseList = snapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().title,
      }));
      setCourses(courseList);
    };
    fetchCourses();
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...newQuestion.options];
    updated[index] = value;
    setNewQuestion({ ...newQuestion, options: updated });
  };

  const handleAddQuestion = () => {
    if (
      !newQuestion.questionText ||
      newQuestion.options.some((opt) => !opt) ||
      !newQuestion.correctOption
    ) {
      alert("⚠️ Please fill in all question fields.");
      return;
    }

    setQuestions([...questions, newQuestion]);
    setNewQuestion({ questionText: "", options: ["", "", "", ""], correctOption: "" });
  };

  const handleSubmit = async () => {
    try {
      if (!form.courseId) {
        alert("⚠️ Please select a course first!");
        return;
      }

      await addDoc(collection(db, "tests"), {
        ...form,
        questions,
        createdAt: new Date(),
      });

      alert("✅ Test added successfully!");
      setForm({ courseId: "", title: "", totalMarks: 0, duration: 0, description: "" });
      setQuestions([]);
    } catch (err) {
      console.error("Error adding test:", err);
    }
  };

  return (
    <div className="p-6">
      <Title order={2}>Add Test for Course</Title>

      <Select
        label="Select Course"
        placeholder="Choose a course"
        data={courses}
        value={form.courseId}
        onChange={(v) => handleChange("courseId", v)}
        mt="md"
      />

      <TextInput
        label="Test Title"
        placeholder="Enter test title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        mt="md"
      />

      <Group grow mt="md">
        <NumberInput
          label="Total Marks"
          placeholder="Enter marks"
          value={form.totalMarks}
          onChange={(v) => handleChange("totalMarks", v)}
        />
        <NumberInput
          label="Duration (minutes)"
          placeholder="Enter time"
          value={form.duration}
          onChange={(v) => handleChange("duration", v)}
        />
      </Group>

      <Textarea
        label="Description / Instructions"
        placeholder="Write test guidelines or description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
        mt="md"
      />

      <Divider my="lg" label="Add Questions" labelPosition="center" />

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Textarea
          label="Question Text"
          placeholder="Enter the question"
          value={newQuestion.questionText}
          onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
        />

        {newQuestion.options.map((opt, i) => (
          <TextInput
            key={i}
            label={`Option ${String.fromCharCode(65 + i)}`}
            placeholder={`Enter option ${String.fromCharCode(65 + i)}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            mt="sm"
          />
        ))}

        <Select
          label="Correct Option"
          placeholder="Select the correct answer"
          data={["A", "B", "C", "D"]}
          value={newQuestion.correctOption}
          onChange={(v) => setNewQuestion({ ...newQuestion, correctOption: v || "" })}
          mt="sm"
        />

        <Button fullWidth mt="md" onClick={handleAddQuestion}>
          ➕ Add Question
        </Button>
      </Card>

      {questions.length > 0 && (
        <div className="mt-6">
          <Title order={4}>Added Questions ({questions.length})</Title>
          <Stack mt="sm">
            {questions.map((q, idx) => (
              <Card key={idx} shadow="xs" withBorder>
                <b>Q{idx + 1}:</b> {q.questionText}
                <ul className="list-disc ml-6 mt-2">
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      {String.fromCharCode(65 + i)}. {opt}
                      {q.correctOption === String.fromCharCode(65 + i) && (
                        <span className="text-green-600 ml-2 font-semibold">(Correct)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </Stack>
        </div>
      )}

      <Button mt="xl" onClick={handleSubmit} fullWidth>
        ✅ Save Test
      </Button>
    </div>
  );
}
