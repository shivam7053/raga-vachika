

// app/masterclasses/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Lock,
  User,
  Briefcase,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  CheckCircle,
  ShoppingCart,
  AlertCircle,
  Video,
  List,
} from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContexts";
import toast from "react-hot-toast";
import {
  Masterclass,
  MasterclassContent,
  YoutubeContent,
} from '@/types/masterclass';
import { formatMasterclassDate, getYouTubeVideoId } from "@/utils/masterclass";
import { addTransactionRecord } from "@/utils/userUtils";
import PaymentModal from "@/components/PaymentModal";
import { MasterclassPlayer } from "@/components/masterclass/MasterclassPlayer";
import { MasterclassNotes } from "@/components/masterclass/MasterclassNotes";
import { MasterclassTests } from "@/components/masterclass/MasterclassTests";

export default function MasterclassDetailPage() {
  const params = useParams();
  const { user } = useAuth();

  const [masterclass, setMasterclass] = useState<Masterclass | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<MasterclassContent | null>(null);
  const [showAllContent, setShowAllContent] = useState(false); // ✅ NEW: State for "All Content" view
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'notes' | 'tests'>('about');

  const masterclassId = params.id as string;

  useEffect(() => {
  const fetchMasterclass = async () => {
    if (!masterclassId) return;

    try {
      setLoading(true);
      const docRef = doc(db, "MasterClasses", masterclassId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError("Masterclass not found.");
        return;
      }

      const data = docSnap.data();

      // ✅ FIX: Generate unique IDs for each content item
      const fixedContent = (data.content || []).map(
        (c: MasterclassContent, index: number) => ({
          ...c,
          id:
            c.id && c.id.trim() !== ""
              ? c.id
              : `${docSnap.id}_content_${index}`, // generate unique id
          order: typeof c.order === "number" ? c.order : index,
        })
      );

      const mc: Masterclass = {
        id: docSnap.id,
        title: data.title || "",
        speaker_name: data.speaker_name || "",
        speaker_designation: data.speaker_designation || "",
        thumbnail_url: data.thumbnail_url || "",
        description: data.description || "",
        price: data.price || 0,
        type: data.type || "free",
        created_at: data.created_at
          ? new Date(data.created_at.seconds * 1000).toISOString()
          : new Date().toISOString(),
        content: fixedContent.sort(
          (a: MasterclassContent, b: MasterclassContent) =>
            a.order - b.order
        ),
        purchased_by_users: data.purchased_by_users || [],
        demo_video_url: data.demo_video_url || "",
        notes: data.notes || [],
        tests: data.tests || [],
      };

      setMasterclass(mc);

      if (mc.content.length > 0) {
        setSelectedContent(mc.content[0]);
      }
    } catch (error) {
      console.error("Error fetching masterclass:", error);
      setError("Failed to load masterclass details.");
    } finally {
      setLoading(false);
    }
  };

  toast.loading("Loading masterclass details...", { id: "loading-toast" });
  fetchMasterclass();
  toast.dismiss("loading-toast");
}, [masterclassId]);

  const userHasFullAccess = user?.uid && masterclass?.purchased_by_users?.includes(user.uid);
  const isMasterclassFree = masterclass?.type === 'free';
  const hasAccess = userHasFullAccess || isMasterclassFree;

  // Refresh masterclass data after purchase
  const refreshMasterclassData = useCallback(async () => {
    if (!masterclassId) return;
    
    try {
      const docRef = doc(db, "MasterClasses", masterclassId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setMasterclass((prev) =>
          prev
            ? {
                ...prev,
                purchased_by_users: data.purchased_by_users || [],
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [masterclassId]);

  // Handle enrollment for a FREE masterclass
  const handleFreeEnrollment = async () => {
    if (!user?.uid) return toast.error("Please login to enroll.");
    if (userHasFullAccess) return toast("You are already enrolled.", { icon: "ℹ️" });
    if (!masterclass) return;

    setProcessing(true);
    try {
      const masterclassRef = doc(db, "MasterClasses", masterclassId);
      await updateDoc(masterclassRef, {
        purchased_by_users: arrayUnion(user.uid),
      });

      await addTransactionRecord(user.uid, {
        orderId: "free_enroll_" + Date.now(),
        masterclassId: masterclassId,
        masterclassTitle: masterclass.title,
        amount: 0,
        status: "success",
        method: "free",
        type: "purchase",
        timestamp: new Date().toISOString(),
      });

      toast.success("Enrolled successfully!");
      await refreshMasterclassData();
    } catch (err) {
      console.error("Free enrollment error:", err);
      toast.error("Error processing enrollment.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle enrollment for a PAID masterclass
  const handlePaidEnrollment = () => {
    if (!user?.uid) return toast.error("Please login to enroll.");
    if (userHasFullAccess) return toast("You are already enrolled.", { icon: "ℹ️" });

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    toast.success("Purchase successful! Check your email for confirmation.");
    setShowPaymentModal(false);
    await refreshMasterclassData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading masterclass...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">{error}</p>
          <Link href="/masterclasses" className="text-indigo-600 hover:underline">
            Back to Masterclasses
          </Link>
        </div>
      </div>
    );
  }

  if (!masterclass) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      </div>
    );
  }

  const isUpcomingContent = (content: MasterclassContent) =>
    content.source === 'zoom' && content.scheduled_date && new Date(content.scheduled_date) > new Date();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/masterclasses"
          className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Masterclasses
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MasterclassPlayer
              selectedContent={selectedContent}
              setSelectedContent={setSelectedContent}
              showAllContent={showAllContent}
              masterclass={masterclass}
              hasAccess={!!hasAccess}
              isMasterclassFree={isMasterclassFree}
              processing={processing}
              onEnroll={handlePaidEnrollment}
            />

            {/* Demo Video Section */}
            {masterclass.demo_video_url && !showAllContent && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Video className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Watch the Welcome Video
                  </h2>
                </div>
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(masterclass.demo_video_url)}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Details block */}
            {!showAllContent && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mt-6 overflow-hidden">
                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-4">{masterclass.title}</h1>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Instructor</p>
                        <p className="font-semibold">{masterclass.speaker_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Designation</p>
                        <p className="font-semibold">{masterclass.speaker_designation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Published</p>
                        <p className="font-semibold">{formatMasterclassDate(masterclass.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Total Enrollments</p>
                        <p className="font-semibold">{masterclass.purchased_by_users?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700 px-6">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('about')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'about'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                      }`}
                    >
                      About
                    </button>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                        activeTab === 'notes'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                      }`}
                    >
                      Notes {!hasAccess && <Lock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setActiveTab('tests')}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                        activeTab === 'tests'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
                      }`}
                    >
                      Tests {!hasAccess && <Lock className="w-4 h-4" />}
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'about' && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">About this Masterclass</h3>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{masterclass.description}</p>
                    </div>
                  )}
                  {activeTab === 'notes' && (
                    <MasterclassNotes
                      masterclass={masterclass}
                      hasAccess={!!hasAccess}
                      isMasterclassFree={isMasterclassFree}
                      onEnroll={handlePaidEnrollment}
                    />
                  )}
                  {activeTab === 'tests' && (
                    <MasterclassTests
                      masterclass={masterclass}
                      hasAccess={!!hasAccess}
                      isMasterclassFree={isMasterclassFree}
                      onEnroll={handlePaidEnrollment}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: course content */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-4">Course Content</h3>

              {/* ✅ NEW: View Toggle Button */}
              {(userHasFullAccess || isMasterclassFree) && (
                <button
                  onClick={() => {
                    setShowAllContent(prev => !prev);
                  }}
                  className="w-full mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-md"
                >
                  <List className="w-5 h-5" />
                  {showAllContent ? "Show Single Video" : "Show All Content"}
                </button>
              )}

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {masterclass.content.map((contentItem, index) => {
                  // ✅ FIXED: Check if THIS specific item is selected
                  const isSelected = !showAllContent && selectedContent?.id === contentItem.id;

                  return (
                    <button
                      key={contentItem.id}
                      onClick={() => {
                        if (hasAccess) {
                          setSelectedContent(contentItem);
                          setShowAllContent(false); // Switch back to single video view
                        }
                      }}
                      disabled={!hasAccess}
                      className={`w-full text-left p-4 rounded-lg transition border-2 ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 shadow-md"
                          : hasAccess
                          ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-transparent"
                          : "bg-gray-50 dark:bg-gray-700 border-transparent opacity-60"
                      } ${!hasAccess ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {isUpcomingContent(contentItem) ? (
                            <Calendar className="w-5 h-5 text-blue-500" />
                          ) : isSelected ? (
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                          ) : hasAccess ? (
                            <Play className="w-5 h-5 text-green-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm mb-1 line-clamp-2 ${
                            isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-gray-100"
                          }`}>
                            {index + 1}. {contentItem.title}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {contentItem.duration && (
                              <span>{contentItem.duration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ENROLL BUTTON */}
              {!userHasFullAccess && (
                <div className="mt-6 border-t pt-6">
                  {isMasterclassFree ? (
                    <button
                      onClick={handleFreeEnrollment}
                      disabled={processing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processing ? "Processing..." : "Enroll for Free"}
                    </button>
                  ) : (
                    <button
                      onClick={handlePaidEnrollment}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Enroll for ₹{masterclass.price}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && masterclass && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
          }}
          masterclass={masterclass}
          user={user}
          purchaseType={"purchase"}
          amount={masterclass.price}
          onPurchaseSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}