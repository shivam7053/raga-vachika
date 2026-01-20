"use client";

import React, { useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContexts";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import HeroVideoSection from "@/components/home/HeroVideoSection";
import MasterclassSection from "@/components/home/MasterclassSection";


import BackgroundAnimation from "@/components/home/BackgroundAnimation";

import FAQSection from "@/components/home/FAQSection";
import StudentFeedback from "@/components/home/StudentFeedback";


import { Masterclass, MasterclassContent } from "@/types/masterclass";


export default function HomePage() {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // ✅ Fetch Masterclasses from Firestore
  const fetchMasterclasses = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "MasterClasses"));
      
      const masterclassList: Masterclass[] = querySnapshot.docs.map((docSnap) => {
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
          content: (data.content || []).sort((a: MasterclassContent, b: MasterclassContent) => a.order - b.order),
          purchased_by_users: data.purchased_by_users || [],
          demo_video_url: data.demo_video_url || "",
          notes: data.notes || [],
          tests: data.tests || [],
        };
      });

      setMasterclasses(masterclassList);
    } catch (error: any) {
      console.error("❌ Error loading masterclasses:", error);
      toast.error("Error loading masterclasses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterclasses();
  }, [fetchMasterclasses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden relative text-gray-900 dark:text-gray-100">
      <BackgroundAnimation />

      {/* 1. Hero Video Section (Main Banner) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <HeroVideoSection />
      </motion.div>


      {/* 3. Featured Masterclasses Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <MasterclassSection
          masterclasses={masterclasses}
          loading={loading}
          user={user}
        />
      </motion.div>

      {/* Student Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <StudentFeedback />
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <FAQSection />
      </motion.div>

      
    </div>
  );
}