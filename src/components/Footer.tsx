"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Linkedin,
  Instagram,
} from "lucide-react";
import Chatbot from "@/chatbot/Chatbot";

export default function Footer() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <footer className="relative bg-gradient-to-br from-sky-50/80 to-orange-50/50 dark:from-blue-950 dark:to-blue-900 border-t border-orange-100 dark:border-blue-900 py-6">
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-orange-400 to-sky-400 opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Single row layout */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            {/* Brand and Copyright */}
            <div className="flex items-center gap-6">
              <Link href="/" className="transition-transform hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Ragavachika"
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <p className="text-gray-500 dark:text-gray-400 text-sm hidden sm:block">
                © {new Date().getFullYear()} <span className="font-semibold text-orange-600 dark:text-sky-400">Ragavachika</span>
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2">
              {[
                 { label: "Home", href: "/" },
                  { label: "Master Classes", href: "/masterclasses" },
                  { label: "About Us", href: "/about" },
                  { label: "Contact", href: "/contact" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms of Service", href: "/terms-of-service" },
                  { label: "Cookie Policy", href: "/cookie-policy" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-1 text-sm transition-colors group"
                >
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="footer-underline"
                      className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-orange-500 dark:bg-sky-400"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`${
                    isActive(link.href) 
                      ? "text-orange-600 dark:text-sky-300 font-semibold" 
                      : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-sky-400"
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Contact and Social */}
            <div className="flex items-center gap-4">
              <a href="mailto:Ragavachika@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="tel:+910010001000" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-sky-600 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Mobile copyright */}
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-4 sm:hidden">
            © {new Date().getFullYear()} Ragavachika. All rights reserved.
          </p>
        </div>
      </footer>
      <Chatbot />
    </>
  );
}