// components/PaymentModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PaymentService } from "@/services/paymentService";
import {
  Masterclass,
  MasterclassContent,
  TransactionType,
  PaymentDetails,
} from "@/types/masterclass";
import toast from "react-hot-toast";
import { loadRazorpay } from "@/utils/loadRazorpay";
import { useCelebration } from "@/context/CelebrationContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterclass: Masterclass;
  user: any;
  onPurchaseSuccess?: () => void;
  // The type of purchase is now more explicit
  purchaseType: "purchase";
  amount?: number;
}

/**
 * Client-side helper to trigger a download from a base64 string.
 */
function downloadFromBase64(base64: string, filename: string) {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to create download from base64:", error);
    toast.error("Could not prepare receipt for download.");
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  masterclass,
  user,
  onPurchaseSuccess,
  purchaseType: propPurchaseType,
  amount: propAmount,
}: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"dummy" | "razorpay" | null>(null);
  const [error, setError] = useState("");
  const { triggerCelebration } = useCelebration();

  // Determine the amount based on the prop or the content item's price.
  // Fallback to 0 if no amount is provided.
  const purchaseAmount =
    propAmount !== undefined ? propAmount : masterclass.price || 0;

  // The transaction type is now directly derived from the `purchaseType` prop.
  const transactionType: TransactionType = 'purchase';

  const purchaseTitle = masterclass.title;

  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  useEffect(() => {
    if (isOpen && purchaseAmount > 0) {
      loadRazorpay().then((loaded) => setRazorpayLoaded(!!loaded));
    }
  }, [isOpen, purchaseAmount]);

  useEffect(() => {
    if (isOpen) {
      setProcessing(false);
      setError("");
      setPaymentMethod(purchaseAmount === 0 ? "dummy" : null);
    }
  }, [isOpen, purchaseAmount]);

  if (!isOpen) return null;

  const safeExtractError = (data: any) => {
    if (!data) return "Unexpected error occurred";

    if (typeof data === "string") return data;

    return (
      data.error ||
      data.message ||
      data.details ||
      data.reason ||
      "Something went wrong"
    );
  };

  const handlePayment = async () => {
    if (!user?.uid) {
      toast.error("Please login to continue");
      return;
    }

    if (purchaseAmount > 0 && !paymentMethod) {
      setError("Please select a payment method");
      toast.error("Please select a payment method");
      return;
    }

    setProcessing(true);
    setError("");

    // --- ✅ NEW: Initial toast to indicate payment process has started ---
    const initialToastId = toast.loading("Initiating payment process...");

    const paymentDetails: PaymentDetails = {
      amount: purchaseAmount,
      currency: "INR",
      masterclassId: masterclass.id,
      userId: user.uid,
      email: user.email || undefined,
      phone: user.phone || undefined,
      type: transactionType,
      masterclassTitle: masterclass.title,
    };

    /* DUMMY PAYMENT */
    if (paymentMethod === "dummy") {
      const dummyOrderId = `dummy_${Date.now()}`;
      const dummyPaymentId = `dummy_pay_${Date.now()}`;

      toast.dismiss(initialToastId); // Dismiss initial loading toast

      // ✅ CORRECTED: Show a more accurate toast message based on the purchase amount.
      const toastMessage = purchaseAmount === 0 ? "Processing free registration..." : "Processing dummy payment...";
      toast.loading(toastMessage, { id: "dummyProcessing" });

      try {
        const verifyResponse = await fetch(
          "/.netlify/functions/payment-verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: dummyOrderId,
              razorpay_payment_id: dummyPaymentId,
              razorpay_signature: "dummy_signature",
              masterclassId: masterclass.id,
              userId: user.uid,
              masterclassTitle: masterclass.title,
              amount: purchaseAmount,
              method: "dummy",
              type: transactionType,
            }),
          }
        );

        if (!verifyResponse.ok) {
          throw new Error(`Server error: ${verifyResponse.status} ${verifyResponse.statusText}`);
        }

        const verifyData = await verifyResponse.json();

        toast.dismiss("dummyProcessing"); // Dismiss dummy processing toast

        if (!verifyData?.success) {
          const msg = safeExtractError(verifyData);
          throw new Error(msg);
        }

        // ✅ NEW: Automatically trigger the download and show a confirmation toast.
        if (verifyData.receiptPdf && verifyData.receiptFilename) {
          downloadFromBase64(verifyData.receiptPdf, verifyData.receiptFilename);
          toast.success("Purchase successful! Your receipt is downloading.");
        } else {
          // Fallback message if no PDF is returned
          toast.success("Purchase successful! A confirmation has been sent to your email.");
        }

        // Trigger celebration immediately after success confirmation
        triggerCelebration();
        onPurchaseSuccess?.();

        setTimeout(() => {
          onClose();
        }, 5000);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setProcessing(false);
      }

      return;
    }

    /* RAZORPAY PAYMENT */
    if (paymentMethod === "razorpay") {
      if (!razorpayLoaded) {
        setError("Failed to load Razorpay. Please refresh.");
        toast.dismiss(initialToastId); // Dismiss initial loading toast
        setProcessing(false);
        return;
      }

      try {
        await PaymentService.processRazorpayPayment(
          paymentDetails,
          purchaseTitle,

          // SUCCESS
          async (response) => {
            try {
              // --- ✅ NEW: On-screen notification for verification step ---
              toast.loading("Verifying payment, please wait...");

              const verifyRes = await fetch(
                "/.netlify/functions/payment-verify",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    masterclassId: masterclass.id,
                    userId: user.uid,
                    masterclassTitle: masterclass.title,
                    amount: purchaseAmount,
                    method: "razorpay",
                    type: transactionType,
                  }),
                }
              );

              if (!verifyRes.ok) {
                throw new Error(`Server error: ${verifyRes.status} ${verifyRes.statusText}`);
              }

              const verifyData = await verifyRes.json();

              toast.dismiss(); // Remove the "Verifying..." toast

              if (!verifyData?.success) {
                throw new Error(safeExtractError(verifyData));
              }

              // ✅ NEW: Automatically trigger the download and show a confirmation toast.
              if (verifyData.receiptPdf && verifyData.receiptFilename) {
                downloadFromBase64(verifyData.receiptPdf, verifyData.receiptFilename);
                toast.success("Payment successful! Your receipt is downloading.");
              } else {
                // Fallback message if no PDF is returned
                toast.success("Payment successful! A confirmation has been sent to your email.");
              }

              // Trigger celebration immediately after success confirmation
              triggerCelebration();
              onPurchaseSuccess?.();

              setTimeout(() => {
                onClose();
              }, 5000);
            } catch (err: any) {
              const msg = safeExtractError(err);
              toast.dismiss();
              setError(msg);
              toast.error(msg);
            } finally {
              setProcessing(false);
            }
          },

          // FAILURE
          (error) => {
            const msg =
              (toast.dismiss(initialToastId), error?.error?.description) || // Dismiss initial loading toast on failure
              safeExtractError(error) ||
              "Payment cancelled";
            setError(msg);
            toast.error(msg);
            setProcessing(false);
          }
        );
      } catch (err: any) {
        setError(err.message || "Payment failed");
        toast.error(err.message || "Payment failed");
        setProcessing(false);
      }
    }
  };

  const handleClose = () => {
    if (processing) {
      toast.error("Payment is still processing, please wait");
      return;
    }
    onClose();
  };

  const getHeaderText = () => "Complete Purchase";

  const getPurchaseTypeLabel = () => {
    return "Masterclass Purchase";
  };

  const getButtonText = () => {
    if (processing) return "Processing...";
    return purchaseAmount === 0 ? "Register Now" : `Pay ₹${purchaseAmount}`;
  };

  const paymentMethods = [
    { id: "dummy", name: "Dummy Payment", icon: <CreditCard className="w-4 h-4" /> },
    { id: "razorpay", name: "Razorpay", icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-white/20 dark:border-gray-800"
      >

        {/* HEADER */}
        <div className="bg-gradient-to-r from-sky-500 to-orange-500 p-4 text-white relative">
          <button
            onClick={handleClose}
            disabled={processing}
            className="absolute top-3 right-3 hover:bg-white/20 rounded-full p-1.5 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-bold mb-1">{getHeaderText()}</h2>
          <p className="text-white/80 text-xs">
            {purchaseAmount === 0
              ? "Complete your free registration"
              : "Secure payment powered by Razorpay"}
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Purchase Info */}
          <div className="bg-sky-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-sky-100 dark:border-blue-800">
            <span className="inline-block bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2">
              {getPurchaseTypeLabel()}
            </span>

            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {purchaseTitle}
            </h3>

            <div className="mt-4 pt-4 border-t border-sky-200 dark:border-blue-800 flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-orange-600 dark:from-sky-400 dark:to-orange-400">
                {purchaseAmount === 0 ? "FREE" : `₹${purchaseAmount}`}
              </span>
            </div>
          </div>

          {/* Info Box */}
          {purchaseAmount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-2 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800 dark:text-blue-200">You'll receive a confirmation email with access details.</p>
              </div>
            </div>
          )}

          {/* ERROR BLOCK */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                    Payment Error
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
                <button
                  onClick={() => setError("")}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {purchaseAmount > 0 && (
            <div>
              <label className="text-sm font-medium mb-3 block text-gray-800 dark:text-gray-200">
                Select Payment Method
              </label>

              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as "dummy" | "razorpay")}
                    disabled={processing || (method.id === 'razorpay' && !razorpayLoaded)}
                    className="relative px-4 py-2 text-sm font-medium transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentMethod === method.id && (
                      <motion.span
                        layoutId="payment-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 to-orange-500"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className={`flex items-center gap-2 ${
                      paymentMethod === method.id
                        ? "text-orange-600 dark:text-sky-400"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    }`}>
                      {method.icon}
                      {method.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePayment}
              disabled={processing || (purchaseAmount > 0 && !paymentMethod)}
              className="w-full inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-sky-500 to-orange-500 text-white hover:from-sky-600 hover:to-orange-600 h-11 px-4 py-2 shadow-lg shadow-orange-500/20"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                getButtonText()
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}