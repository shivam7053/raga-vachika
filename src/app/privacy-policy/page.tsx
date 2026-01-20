"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              This Privacy Policy explains how <strong>Ragavachika</strong> (“we”,
              “our”, “us”) collects, uses, and protects the personal information of
              users (“you”, “your”) who access our website and services.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly (such as name, email, and
                phone number), and automatically collected data (like IP address and
                usage details) to improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                2. How We Use Your Information
              </h2>
              <p>
                We use your data to process payments, provide masterclasses, enhance
                user experience, send updates, and ensure compliance with legal
                requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                3. Payment Information
              </h2>
              <p>
                All payment transactions are securely processed by{" "}
                <strong>Razorpay</strong>. We do not store your full card or payment
                details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                4. Data Protection
              </h2>
              <p>
                We use industry-standard encryption and security measures to protect
                your data. However, no method of transmission is 100% secure, and we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                5. Your Rights
              </h2>
              <p>
                You can request access, correction, or deletion of your data by
                emailing us at <strong>india.growpro@gmail.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                6. Updates
              </h2>
              <p>
                We may update this Privacy Policy occasionally. Updates will be posted
                on this page with a revised effective date.
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
