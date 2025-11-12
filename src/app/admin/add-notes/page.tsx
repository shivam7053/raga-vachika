"use client";

import { useState, useEffect } from "react";
import { TextInput, Button, Select, Textarea, Title } from "@mantine/core";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function AddNotes() {
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    driveLink: "",
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

      await addDoc(collection(db, "notes"), {
        ...form,
        createdAt: new Date(),
      });

      alert("✅ Notes added successfully!");
      setForm({ courseId: "", title: "", description: "", driveLink: "" });
    } catch (err) {
      console.error("Error adding notes:", err);
    }
  };

  return (
    <div className="p-6">
      <Title order={2}>Add Notes to Course</Title>

      <Select
        label="Select Course"
        placeholder="Choose a course"
        data={courses}
        value={form.courseId}
        onChange={(v) => handleChange("courseId", v)}
        mt="md"
      />

      <TextInput
        label="Notes Title"
        placeholder="Enter notes title"
        value={form.title}
        onChange={(e) => handleChange("title", e.target.value)}
        mt="md"
      />

      <Textarea
        label="Description"
        placeholder="Brief info about these notes"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
        mt="md"
      />

      <TextInput
        label="Google Drive Link"
        placeholder="Paste Google Drive shareable link"
        value={form.driveLink}
        onChange={(e) => handleChange("driveLink", e.target.value)}
        mt="md"
      />

      <Button mt="lg" onClick={handleSubmit} fullWidth>
        Add Notes
      </Button>
    </div>
  );
}
