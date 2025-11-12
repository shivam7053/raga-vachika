"use client";

import { useState } from "react";
import { TextInput, PasswordInput, Button, Container, Title } from "@mantine/core";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      notifications.show({ title: "Welcome Back!", message: "Successfully logged in." });
      router.push("/dashboard");
    } catch (error: any) {
      notifications.show({ color: "red", title: "Login Failed", message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xs" className="py-16 text-center">
      <Title order={2}>Login to Your Account</Title>
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
      <Button fullWidth mt="xl" loading={loading} onClick={handleLogin}>
        Login
      </Button>
    </Container>
  );
}
