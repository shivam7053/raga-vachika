

"use client";
import React from "react";
import { UserProfile } from "@/types/masterclass"; // ✅ Single source of truth
import { User, Mail, Phone, Linkedin, FileText, Image } from "lucide-react";

interface UserFormProps {
  userData: Partial<UserProfile>; // ✅ Changed to Partial to allow incomplete forms
  onChange: (field: keyof UserProfile, value: string) => void;
  isSignup?: boolean;
}

export default function UserForm({
  userData,
  onChange,
  isSignup = true,
}: UserFormProps) {
  return (
    <div className="space-y-5">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-200">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={userData.full_name || ""}
            onChange={(e) => onChange("full_name", e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:focus:ring-sky-400 transition-all"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-200">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={userData.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            className={`flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:focus:ring-sky-400 transition-all ${
              !isSignup ? "opacity-70 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50" : ""
            }`}
            placeholder="name@example.com"
            required
            disabled={!isSignup}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-200">
          Phone
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={userData.phone || ""}
            onChange={(e) => onChange("phone", e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:focus:ring-sky-400 transition-all"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      {/* LinkedIn */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-200">
          LinkedIn Profile
        </label>
        <div className="relative">
          <Linkedin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="url"
            value={userData.linkedin || ""}
            onChange={(e) => onChange("linkedin", e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:focus:ring-sky-400 transition-all"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-200">
          Bio
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            value={userData.bio || ""}
            onChange={(e) => onChange("bio", e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:focus:ring-sky-400 transition-all resize-none"
            placeholder="Tell us a bit about yourself..."
            rows={3}
          />
        </div>
      </div>

      {/* Avatar */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-200">
          Profile Image URL
        </label>
        <div className="relative">
          <Image className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="url"
            value={userData.avatar_url || ""}
            onChange={(e) => onChange("avatar_url", e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 pl-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:focus:ring-sky-400 transition-all"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>
    </div>
  );
}