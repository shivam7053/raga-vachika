"use client";

import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContexts";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import MasterclassSection from "@/components/home/MasterclassSection";
import CTAFooter from "@/components/home/CTAFooter";
import BackgroundAnimation from "@/components/home/BackgroundAnimation";
import TeachersCarousel from "@/components/home/TeachersCarousel";
import FAQSection from "@/components/home/FAQSection";
import StudentFeedback from "@/components/home/StudentFeedback";
import HeroSection from "@/components/home/HeroSection";
import HeroVideoSection from "@/components/home/HeroVideoSection";


import { Course, CourseContent } from "@/types/masterclass";

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ✅ Fetch Courses from Firestore
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "Courses"));
      
      const courseList: Course[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "",
          description: data.description || "",
          speaker_name: data.speaker_name || "",
          speaker_designation: data.speaker_designation || "",
          thumbnail_url: data.thumbnail_url || "",
          price: data.price || 0,
          type: data.type || 'free',
          created_at: data.created_at?.toDate()?.toISOString() || new Date().toISOString(),
          content: (data.content || []).sort((a: CourseContent, b: CourseContent) => a.order - b.order),
          purchased_by_users: data.purchased_by_users || [],
        };
      });

      setCourses(courseList);
    } catch (error: any) {
      console.error("❌ Error loading courses:", error);
      toast.error("Error loading courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden relative text-gray-900 dark:text-gray-100">
      <BackgroundAnimation />


      <HeroSection />


      {/* Featured Courses Section - Shows any 4 classes */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <MasterclassSection
          masterclasses={courses}
          loading={loading}
          user={user}
        />
      </motion.div>

        {/* HeroVideo Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <HeroVideoSection />
      </motion.div>

      {/* Teacher Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <TeachersCarousel />
      </motion.div>

      {/* Student Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <StudentFeedback />
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <FAQSection />
      </motion.div>

      {/* CTA Footer */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <CTAFooter />
      </motion.div>
    </div>
  );
}