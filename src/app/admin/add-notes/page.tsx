"use client";

import { useState, useEffect } from "react";
import { TextInput, Button, Select, Textarea, Title, Card, Text, Group, Badge } from "@mantine/core";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { notifications } from "@mantine/notifications";
import { FileText, AlertCircle } from "lucide-react";

export default function AddNotes() {
  const [courses, setCourses] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    driveLink: "",
    type: "pdf",
  });
  const [loading, setLoading] = useState(false);

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

  // Convert Google Drive link to direct download link
  const convertDriveLink = (link: string): string => {
    if (!link) return "";
    
    // If it's already a direct link, return it
    if (link.includes("drive.google.com/uc?")) {
      return link;
    }

    // Extract file ID from various Google Drive URL formats
    let fileId = "";
    
    // Format 1: https://drive.google.com/file/d/FILE_ID/view
    if (link.includes("/file/d/")) {
      fileId = link.split("/file/d/")[1].split("/")[0];
    }
    // Format 2: https://drive.google.com/open?id=FILE_ID
    else if (link.includes("open?id=")) {
      fileId = link.split("open?id=")[1].split("&")[0];
    }
    // Format 3: https://drive.google.com/drive/folders or other formats
    else if (link.includes("id=")) {
      fileId = link.split("id=")[1].split("&")[0];
    }

    // Convert to direct download link
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return link; // Return original if can't parse
  };

  const handleSubmit = async () => {
    try {
      if (!form.courseId) {
        notifications.show({
          title: "Missing Field",
          message: "Please select a course first!",
          color: "red",
        });
        return;
      }

      if (!form.title) {
        notifications.show({
          title: "Missing Field",
          message: "Please enter a title!",
          color: "red",
        });
        return;
      }

      setLoading(true);

      // Convert drive link to direct download link
      const fileUrl = form.driveLink ? convertDriveLink(form.driveLink) : "";

      await addDoc(collection(db, "notes"), {
        courseId: form.courseId,
        title: form.title,
        description: form.description,
        driveLink: form.driveLink, // Keep original link for reference
        fileUrl: fileUrl, // Direct download link
        type: form.type,
        createdAt: new Date().toISOString(),
      });

      notifications.show({
        title: "Success! ✓",
        message: "Notes added successfully!",
        color: "green",
      });

      setForm({ courseId: "", title: "", description: "", driveLink: "", type: "pdf" });
    } catch (err) {
      console.error("Error adding notes:", err);
      notifications.show({
        title: "Error",
        message: "Failed to add notes. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Title order={2} mb="xl">
        <Group>
          <FileText size={30} />
          Add Notes to Course
        </Group>
      </Title>

      <Card shadow="md" radius="lg" p="lg" withBorder>
        <Select
          label="Select Course"
          placeholder="Choose a course"
          data={courses}
          value={form.courseId}
          onChange={(v) => handleChange("courseId", v)}
          required
          withAsterisk
        />

        <TextInput
          label="Notes Title"
          placeholder="e.g., React Fundamentals - Chapter 1"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          mt="md"
          required
          withAsterisk
        />

        <Textarea
          label="Description"
          placeholder="Brief info about these notes"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          mt="md"
          minRows={3}
        />

        <Select
          label="File Type"
          placeholder="Select file type"
          data={[
            { value: "pdf", label: "PDF" },
            { value: "doc", label: "DOC/DOCX" },
            { value: "text", label: "Text" },
            { value: "jpg", label: "Image (JPG/PNG)" },
          ]}
          value={form.type}
          onChange={(v) => handleChange("type", v)}
          mt="md"
        />

        <TextInput
          label="Google Drive Link"
          placeholder="Paste Google Drive shareable link"
          value={form.driveLink}
          onChange={(e) => handleChange("driveLink", e.target.value)}
          mt="md"
          description="Make sure the file is set to 'Anyone with the link can view'"
        />

        {form.driveLink && (
          <Card mt="sm" p="sm" withBorder bg="blue.0">
            <Group gap="xs">
              <AlertCircle size={16} color="blue" />
              <Text size="xs" c="blue">
                Link will be converted to direct download format
              </Text>
            </Group>
          </Card>
        )}

        <Button 
          mt="xl" 
          onClick={handleSubmit} 
          fullWidth 
          size="md"
          loading={loading}
        >
          Add Notes
        </Button>
      </Card>
    </div>
  );
}