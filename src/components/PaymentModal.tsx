"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Radio,
  Card,
  Divider,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { CreditCard, Smartphone, CheckCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/context/AuthContext";

interface PaymentModalProps {
  opened: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    price: number;
    duration?: number; // in days
  };
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({
  opened,
  onClose,
  course,
  onSuccess,
}: PaymentModalProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"dummy" | "razorpay">("dummy");
  const [processing, setProcessing] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Create transaction record
  const createTransaction = async (
    status: "pending" | "completed" | "failed",
    paymentId?: string,
    razorpayOrderId?: string
  ) => {
    if (!user) return null;

    const transactionData = {
      userId: user.uid,
      courseId: course.id,
      courseTitle: course.title,
      amount: course.price,
      status,
      paymentMethod,
      paymentId: paymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("💾 Creating transaction:", transactionData);

    const transactionRef = await addDoc(
      collection(db, "transactions"),
      transactionData
    );

    console.log("✅ Transaction created with ID:", transactionRef.id);

    return transactionRef.id;
  };

  // Update user course access
  const grantCourseAccess = async () => {
    if (!user) return;

    const expiresAt = course.duration
      ? new Date(Date.now() + course.duration * 24 * 60 * 60 * 1000)
      : null;

    const userCourseId = `${user.uid}_${course.id}`;
    await setDoc(doc(db, "userCourses", userCourseId), {
      userId: user.uid,
      courseId: course.id,
      courseTitle: course.title,
      status: "active",
      purchasedAt: new Date().toISOString(),
      expiresAt: expiresAt?.toISOString() || null,
      amount: course.price,
    });
  };

  // Handle Dummy Payment
  const handleDummyPayment = async () => {
    if (!user) {
      notifications.show({
        title: "Login Required",
        message: "Please login to make a purchase",
        color: "red",
      });
      return;
    }

    setProcessing(true);

    try {
      // Create pending transaction
      const transactionId = await createTransaction("pending");

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Randomly succeed or fail (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        // Update transaction to completed
        const paymentId = `DUMMY_${Date.now()}`;
        console.log("✅ Payment successful, updating transaction:", transactionId);
        
        await setDoc(
          doc(db, "transactions", transactionId!),
          {
            status: "completed",
            paymentId: paymentId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        console.log("✅ Transaction updated to completed");

        // Grant course access
        await grantCourseAccess();
        console.log("✅ Course access granted");

        notifications.show({
          title: "Payment Successful! 🎉",
          message: `You now have access to ${course.title}`,
          color: "green",
        });

        onSuccess?.();
        onClose();
      } else {
        // Update transaction to failed
        await setDoc(
          doc(db, "transactions", transactionId!),
          {
            status: "failed",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        notifications.show({
          title: "Payment Failed",
          message: "Transaction could not be completed. Please try again.",
          color: "red",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Something went wrong",
        color: "red",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Handle Razorpay Payment
  const handleRazorpayPayment = async () => {
    if (!user) {
      notifications.show({
        title: "Login Required",
        message: "Please login to make a purchase",
        color: "red",
      });
      return;
    }

    setProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        notifications.show({
          title: "Error",
          message: "Failed to load payment gateway",
          color: "red",
        });
        setProcessing(false);
        return;
      }

      // Create pending transaction
      const transactionId = await createTransaction("pending");

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxxxxxx", // Replace with your key
        amount: course.price * 100, // Amount in paise
        currency: "INR",
        name: "Your Platform Name",
        description: course.title,
        image: "/logo.png", // Your logo
        handler: async function (response: any) {
          try {
            // Payment successful
            await setDoc(
              doc(db, "transactions", transactionId!),
              {
                status: "completed",
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );

            // Grant course access
            await grantCourseAccess();

            notifications.show({
              title: "Payment Successful! 🎉",
              message: `You now have access to ${course.title}`,
              color: "green",
            });

            onSuccess?.();
            onClose();
          } catch (error) {
            console.error("Error updating payment:", error);
            notifications.show({
              title: "Error",
              message: "Payment received but failed to grant access. Contact support.",
              color: "orange",
            });
          }
        },
        prefill: {
          name: user.displayName || user.email,
          email: user.email,
        },
        theme: {
          color: "#5B21B6",
        },
        modal: {
          ondismiss: async function () {
            // Payment cancelled
            await setDoc(
              doc(db, "transactions", transactionId!),
              {
                status: "failed",
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
            setProcessing(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("Razorpay error:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to initialize payment",
        color: "red",
      });
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === "dummy") {
      handleDummyPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Complete Payment"
      size="md"
      centered
    >
      <Stack gap="md">
        {/* Course Info */}
        <Card withBorder p="md" radius="md">
          <Group justify="space-between" mb="xs">
            <Text fw={600} size="lg">
              {course.title}
            </Text>
            <Badge size="lg" color="green">
              ₹{course.price}
            </Badge>
          </Group>
          {course.duration && (
            <Text size="sm" c="dimmed">
              Access Duration: {course.duration} days
            </Text>
          )}
        </Card>

        <Divider />

        {/* Payment Method Selection */}
        <div>
          <Text fw={500} mb="sm">
            Select Payment Method
          </Text>
          <Radio.Group value={paymentMethod} onChange={(val) => setPaymentMethod(val as any)}>
            <Stack gap="xs">
              <Card
                withBorder
                p="md"
                radius="md"
                style={{
                  cursor: "pointer",
                  border: paymentMethod === "dummy" ? "2px solid #5B21B6" : undefined,
                }}
                onClick={() => setPaymentMethod("dummy")}
              >
                <Group>
                  <Radio value="dummy" />
                  <CreditCard size={20} />
                  <div>
                    <Text fw={500}>Dummy Payment</Text>
                    <Text size="xs" c="dimmed">
                      For testing purposes (90% success rate)
                    </Text>
                  </div>
                </Group>
              </Card>

              <Card
                withBorder
                p="md"
                radius="md"
                style={{
                  cursor: "pointer",
                  border: paymentMethod === "razorpay" ? "2px solid #5B21B6" : undefined,
                }}
                onClick={() => setPaymentMethod("razorpay")}
              >
                <Group>
                  <Radio value="razorpay" />
                  <Smartphone size={20} />
                  <div>
                    <Text fw={500}>Razorpay</Text>
                    <Text size="xs" c="dimmed">
                      UPI, Cards, Net Banking & more
                    </Text>
                  </div>
                </Group>
              </Card>
            </Stack>
          </Radio.Group>
        </div>

        <Divider />

        {/* Total Amount */}
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Total Amount
          </Text>
          <Text fw={700} size="xl" c="green">
            ₹{course.price}
          </Text>
        </Group>

        {/* Action Buttons */}
        <Group justify="space-between" mt="md">
          <Button variant="default" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button
            color="green"
            leftSection={processing ? <Loader size="xs" color="white" /> : <CheckCircle size={18} />}
            onClick={handlePayment}
            disabled={processing}
            loading={processing}
          >
            {processing ? "Processing..." : `Pay ₹${course.price}`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}