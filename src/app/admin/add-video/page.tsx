"use client";

import { useState, useEffect } from "react";
import { TextInput, Button, Select, Textarea, Title, Group } from "@mantine/core";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function AddVideo() {
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    youtubeId: "",
    description: "",
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

  const handleSubmit = async () => {
    try {
      if (!form.courseId) {
        alert("⚠️ Please select a course first!");
        return;
      }

      await addDoc(collection(db, "videos"), {
        ...form,
        createdAt: new Date(),
      });

      alert("✅ Video added successfully!");
      setForm({ courseId: "", title: "", youtubeId: "", description: "" });
    } catch (err) {
      console.error("Error adding video:", err);
    }
  };

  return (
    <div className="p-6">
      <Title order={2}>Add Video to Course</Title>

      <Select
        label="Select Course"
        placeholder="Choose a course"
        data={courses}
        value={form.courseId}
        onChange={(v) => handleChange("courseId", v)}
        mt="md"
      />

      <TextInput
        label="Video Title"
        placeholder="Enter video title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        mt="md"
      />

      <TextInput
        label="YouTube Video ID"
        placeholder="e.g. dQw4w9WgXcQ"
        value={form.youtubeId}
        onChange={(e) => handleChange("youtubeId", e.target.value)}
        mt="md"
      />

      <Textarea
        label="Video Description"
        placeholder="Describe this video"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
        mt="md"
      />

      <Button mt="lg" onClick={handleSubmit} fullWidth>
        Add Video
      </Button>
    </div>
  );
}
