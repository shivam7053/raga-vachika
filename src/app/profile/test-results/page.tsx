"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContexts";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { TestResult, Masterclass } from "@/types/masterclass";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function TestResultsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [masterclassTitles, setMasterclassTitles] = useState<Record<string, string>>({});
  const [testTitles, setTestTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [openTests, setOpenTests] = useState<Set<string>>(new Set());

  const fetchDetails = async (results: TestResult[]) => {
    if (results.length === 0) {
        setLoading(false);
        return;
    }

    const mcIds = Array.from(new Set(results.map(r => r.masterclassId)));
    const mcMap: Record<string, string> = {};
    const testMap: Record<string, string> = {};

    try {
        await Promise.all(mcIds.map(async (id) => {
            const snap = await getDoc(doc(db, "MasterClasses", id));
            if (snap.exists()) {
                const data = snap.data() as Masterclass;
                mcMap[id] = data.title;
                
                if (data.tests) {
                    data.tests.forEach(t => {
                        testMap[t.id] = t.title;
                    });
                }
            }
        }));
    } catch (error) {
        console.error("Error fetching details:", error);
    }

    setMasterclassTitles(mcMap);
    setTestTitles(testMap);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
        setLoading(false);
        return;
    }
    
    if (userProfile) {
        const userResults = userProfile.test_results || [];
        // Sort by newest first
        const sorted = [...userResults].sort((a, b) => 
            new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
        );
        setResults(sorted);
        fetchDetails(sorted);
    } else {
        setLoading(false);
    }
  }, [userProfile, user, authLoading]);

  const toggleTest = (testId: string) => {
    setOpenTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) newSet.delete(testId);
      else newSet.add(testId);
      return newSet;
    });
  };

  const groupedResults = useMemo(() => {
    const grouped: Record<string, TestResult[]> = {};
    results.forEach((r) => {
      if (!grouped[r.testId]) grouped[r.testId] = [];
      grouped[r.testId].push(r);
    });
    return grouped;
  }, [results]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/profile" className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition">
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Test Results</h1>
        </div>

        {results.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tests attempted yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Enroll in masterclasses and take tests to see your results here.
            </p>
            <Link 
              href="/masterclasses" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse Masterclasses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedResults)
              .sort(([, a], [, b]) => new Date(b[0].attemptedAt).getTime() - new Date(a[0].attemptedAt).getTime())
              .map(([testId, attempts]) => {
                const latestAttempt = attempts[0];
                const mcTitle = masterclassTitles[latestAttempt.masterclassId] || "Unknown Masterclass";
                const testTitle = testTitles[testId] || "Unknown Test";
                const isOpen = openTests.has(testId);
                const bestAttempt = attempts.reduce((prev, curr) => (curr.score > prev.score ? curr : prev), attempts[0]);

                return (
                  <div key={testId} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => toggleTest(testId)}
                      className="w-full flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{testTitle}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{mcTitle}</p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                {attempts.length} Attempt{attempts.length !== 1 ? 's' : ''}
                            </span>
                            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                                Best: {bestAttempt.score}/{bestAttempt.totalQuestions}
                            </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isOpen ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
                        {attempts.map((result, index) => {
                          const date = new Date(result.attemptedAt);
                          return (
                            <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {result.passed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      Attempt #{attempts.length - index}
                                    </p>
                                    <div className="flex items-center text-xs text-gray-500">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 pl-11 md:pl-0">
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Score</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                      {result.score} <span className="text-gray-400 text-sm">/ {result.totalQuestions}</span>
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Result</p>
                                    <p className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                      {result.percentage.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
