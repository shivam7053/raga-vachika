"use client";

import { useState } from "react";
import { TextInput, NumberInput, Button, Textarea, Group, Title, Select } from "@mantine/core";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddCourse() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    grade: "",
    price: 0,
    thumbnail: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "courses"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      alert("✅ Course added successfully!");
      setForm({
        title: "",
        description: "",
        subject: "",
        grade: "",
        price: 0,
        thumbnail: "",
      });
    } catch (err) {
      console.error("Error adding course:", err);
    }
  };

  return (
    <div className="p-6">
      <Title order={2} mb="md">Add New Course</Title>

      <Group grow>
        <TextInput
          label="Course Title"
          placeholder="Enter course name"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
        <TextInput
          label="Subject"
          placeholder="e.g. Mathematics"
          value={form.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
        />
      </Group>

      <Select
        label="Grade Level"
        placeholder="Select grade"
        data={[
          { value: "1", label: "Grade 1" },
          { value: "2", label: "Grade 2" },
          { value: "3", label: "Grade 3" },
          { value: "10", label: "Grade 10" },
          { value: "12", label: "Grade 12" },
        ]}
        value={form.grade}
        onChange={(v) => handleChange("grade", v)}
        mt="md"
      />

      <NumberInput
        label="Price (₹)"
        placeholder="Enter price"
        value={form.price}
        onChange={(v) => handleChange("price", v)}
        mt="md"
      />

      <TextInput
        label="Thumbnail URL"
        placeholder="Enter image URL"
        value={form.thumbnail}
        onChange={(e) => handleChange("thumbnail", e.target.value)}
        mt="md"
      />

      <Textarea
        label="Description"
        placeholder="Brief course description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
        mt="md"
      />

      <Button mt="lg" onClick={handleSubmit} fullWidth>
        Add Course
      </Button>
    </div>
  );
}
