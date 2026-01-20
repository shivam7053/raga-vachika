"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContexts";
import { Masterclass, MasterclassTest, TestResult } from "@/types/masterclass";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Timer, 
  ChevronRight, 
  ChevronLeft, 
  Save,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function TestPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const testId = params.id as string;
  const masterclassId = searchParams.get("masterclassId");

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<MasterclassTest | null>(null);
  const [masterclassTitle, setMasterclassTitle] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds

  // Fetch Test Data
  useEffect(() => {
    const fetchTest = async () => {
      if (!user || !masterclassId) return;
      
      try {
        const docRef = doc(db, "MasterClasses", masterclassId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          toast.error("Masterclass not found");
          router.push("/masterclasses");
          return;
        }

        const data = docSnap.data() as Masterclass;
        
        // Check access
        const hasAccess = data.type === 'free' || (data.purchased_by_users && data.purchased_by_users.includes(user.uid));
        
        if (!hasAccess) {
             toast.error("You need to enroll in this masterclass to take the test.");
             router.push(`/masterclasses/${masterclassId}`);
             return;
        }

        const foundTest = data.tests?.find(t => t.id === testId);
        
        if (!foundTest) {
          toast.error("Test not found");
          router.push(`/masterclasses/${masterclassId}`);
          return;
        }

        setMasterclassTitle(data.title);
        setTest(foundTest);
        if (foundTest.durationMinutes) {
            setTimeLeft(foundTest.durationMinutes * 60);
        }
      } catch (error) {
        console.error("Error fetching test:", error);
        toast.error("Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        if (!user) {
            router.push("/signin");
        } else if (!masterclassId) {
            toast.error("Invalid test link");
            router.push("/masterclasses");
        } else {
            fetchTest();
        }
    }
  }, [masterclassId, testId, user, authLoading, router]);

  // Timer Logic
  useEffect(() => {
    if (submitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!test || !user || submitted || !masterclassId) return;
    
    let score = 0;
    test.questions.forEach(q => {
        if (answers[q.id] === q.correctOptionIndex) {
            score++;
        }
    });

    const totalQuestions = test.questions.length;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= (test.passingPercentage || 50);

    const newResult: TestResult = {
        testId: test.id,
        masterclassId: masterclassId,
        score,
        totalQuestions,
        percentage,
        passed,
        attemptedAt: new Date().toISOString()
    };

    setResult(newResult);
    setSubmitted(true);

    // Save to profile
    try {
        const userRef = doc(db, "user_profiles", user.uid);
        await updateDoc(userRef, {
            test_results: arrayUnion(newResult)
        });
        toast.success("Test submitted successfully!");
    } catch (error) {
        console.error("Error saving result:", error);
        toast.error("Result calculated but failed to save to profile.");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!test) return null;

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href={`/masterclasses/${masterclassId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Masterclass
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{test.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{masterclassTitle}</p>
          </div>
          
          {!submitted && timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
              timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
            }`}>
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Main Content */}
        {!submitted ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
              <div 
                className="bg-indigo-600 h-2 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      answers[currentQuestion.id] === idx
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQuestion.id] === idx
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {answers[currentQuestion.id] === idx && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={isFirstQuestion}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" /> Submit Test
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Result View */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              result?.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {result?.passed ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {result?.passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You scored <span className="font-bold text-gray-900 dark:text-white">{result?.score}</span> out of {result?.totalQuestions} ({result?.percentage.toFixed(1)}%)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className={`font-bold ${result?.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result?.passed ? 'PASSED' : 'FAILED'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Passing Score</p>
                <p className="font-bold text-gray-900 dark:text-white">{test.passingPercentage}%</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href={`/masterclasses/${masterclassId}`}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Back to Masterclass
              </Link>
              <Link
                href="/profile/test-results"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                View All Results
              </Link>
            </div>

            {/* Review Answers Section */}
            <div className="mt-12 text-left border-t pt-8 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-6">Review Answers</h3>
              <div className="space-y-6">
                {test.questions.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctOptionIndex;
                  
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border ${
                      isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900' : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900'
                    }`}>
                      <p className="font-medium mb-3 flex gap-2">
                        <span className="text-gray-500">{idx + 1}.</span>
                        {q.question}
                      </p>
                      <div className="space-y-2 ml-6">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className={`flex items-center gap-2 text-sm ${
                            optIdx === q.correctOptionIndex 
                              ? 'text-green-700 font-semibold dark:text-green-400' 
                              : optIdx === userAnswer 
                                ? 'text-red-600 font-semibold dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {optIdx === q.correctOptionIndex ? <CheckCircle className="w-4 h-4" /> : 
                             optIdx === userAnswer ? <XCircle className="w-4 h-4" /> : 
                             <div className="w-4 h-4" />}
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && !isCorrect && (
                        <div className="mt-3 ml-6 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex gap-2">
                          <HelpCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Explanation:</span> {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}