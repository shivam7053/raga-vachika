"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Container, Title } from "@mantine/core";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(userCredential.user, { displayName: form.name });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: form.name,
        email: form.email,
        role: "student",
        createdAt: new Date().toISOString(),
      });

      notifications.show({ title: "Account Created", message: "Welcome to EduSpark!" });
      router.push("/dashboard");
    } catch (error: any) {
      notifications.show({ color: "red", title: "Error", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" className="py-16 text-center">
      <Title order={2}>Create an Account</Title>
      <TextInput
        label="Name"
        placeholder="Your name"
        mt="md"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
      />
      <TextInput
        label="Email"
        placeholder="you@example.com"
        mt="md"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
      />
      <PasswordInput
        label="Password"
        mt="md"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.currentTarget.value })}
      />
      <Button fullWidth mt="xl" loading={loading} onClick={handleSignup}>
        Sign Up
      </Button>
    </Container>
  );
}
