"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CookiePolicyPage() {
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
            Cookie Policy
          </h1>

          <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              This Cookie Policy explains how <strong>Ragavachika</strong> uses cookies
              and similar technologies on our website.
            </p>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                1. What Are Cookies?
              </h2>
              <p>
                Cookies are small text files stored on your device when you visit a
                website. They help us improve your browsing experience and analyze
                site usage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                2. Types of Cookies We Use
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> Required for site functionality.
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand usage
                  patterns.
                </li>
                <li>
                  <strong>Preference Cookies:</strong> Remember your settings and
                  preferences.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                3. Managing Cookies
              </h2>
              <p>
                You can manage or disable cookies in your browser settings. However,
                some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                4. Third-Party Cookies
              </h2>
              <p>
                We may use third-party tools such as Google Analytics and Razorpay
                that set their own cookies for analytics or payment processing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                5. Contact
              </h2>
              <p>
                If you have any questions about this policy, contact us at{" "}
                <strong>ragavachika@gmail.com</strong>.
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
