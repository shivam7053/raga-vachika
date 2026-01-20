"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50 dark:from-blue-950 dark:via-gray-900 dark:to-black relative overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-sky-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20 dark:border-gray-800"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-orange-600 dark:from-sky-400 dark:to-orange-400">
            Terms of Service
          </h1>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              Welcome to <strong>Ragavachika</strong>. By accessing or using our website
              and services, you agree to these Terms of Service (“Terms”).
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                1. Use of Services
              </h2>
              <p>
                You agree to use our services only for lawful purposes and in
                accordance with these Terms. Unauthorized access, copying, or resale
                of our materials is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                2. Account Responsibilities
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                3. Payments
              </h2>
              <p>
                All payments are processed through <strong>Razorpay</strong>. You
                agree to provide accurate billing information. We are not responsible
                for any payment processing errors made by Razorpay.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                4. Refund Policy
              </h2>
              <p>
                Fees for masterclasses or other paid services are non-refundable
                unless explicitly stated otherwise or required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                5. Limitation of Liability
              </h2>
              <p>
                Ragavachika is not liable for indirect, incidental, or consequential
                damages arising from the use or inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                6. Contact Information
              </h2>
              <p>
                For any questions about these Terms, please contact us at{" "}
                <strong>ragavachika@gmail.com</strong> or call{" "}
                <strong>+91 0010010010</strong>.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200 dark:border-gray-700 mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                <strong>Effective Date:</strong> November 8, 2025
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
