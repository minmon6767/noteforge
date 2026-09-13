"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GenerateResponse, NoteItem } from "@/lib/gemini-schema";
import { ArrowLeft, CheckCircle2, XCircle, RefreshCcw, BookOpen } from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const [data, setData] = useState<GenerateResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [missedTopics, setMissedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = sessionStorage.getItem("noteforge_data");
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!data) return null; // Or a loading spinner

  const questions = data.quiz;
  
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <p className="text-ink text-xl font-serif">No quiz generated.</p>
        <Link href="/" className="mt-4 text-accent underline">Go back</Link>
      </div>
    );
  }

  const isFinished = currentIndex >= questions.length;
  const currentQ = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (isRevealed) return;
    setSelectedOption(option);
  };

  const handleReveal = () => {
    if (!selectedOption) return;
    setIsRevealed(true);
    if (selectedOption === currentQ.correctAnswer) {
      setScore(s => s + 1);
    } else {
      if (currentQ.sourceSectionId) {
        setMissedTopics(prev => {
          const next = new Set(prev);
          next.add(currentQ.sourceSectionId!);
          return next;
        });
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsRevealed(false);
    setCurrentIndex(i => i + 1);
  };

  if (isFinished) {
    // Attempt to map missed section IDs back to section titles using the notes tree
    // (A recursive search through notes)
    const findNoteTitle = (notes: NoteItem[], id: string): string | null => {
      for (const n of notes) {
        if (n.id === id) return n.title;
        if (n.subTopics) {
          const found = findNoteTitle(n.subTopics, id);
          if (found) return found;
        }
      }
      return null;
    };

    const topicsToReview = Array.from(missedTopics)
      .map(id => findNoteTitle(data.notes, id))
      .filter(Boolean) as string[];

    return (
      <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8 animate-in fade-in duration-500">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Notes
        </Link>
        
        <div className="bg-white p-10 md:p-14 rounded-3xl shadow-sm border border-ink-light/10 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-serif font-bold">{score}/{questions.length}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink mb-2">Quiz Complete</h1>
          <p className="text-ink-light text-lg mb-8">
            {score === questions.length ? "Perfect score! You're ready." : "Good effort. Let's review."}
          </p>

          {topicsToReview.length > 0 && (
            <div className="w-full text-left bg-paper p-6 rounded-2xl border border-ink-light/20 mb-8">
              <h3 className="font-semibold text-ink flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-accent" />
                Topics to revisit:
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-ink-light">
                {topicsToReview.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setMissedTopics(new Set());
                setSelectedOption(null);
                setIsRevealed(false);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-ink-light/20 text-ink rounded-lg font-semibold hover:bg-stone-50 transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-lg font-semibold hover:bg-ink/90 transition-colors"
            >
              Study Notes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6">
      <header className="flex justify-between items-center pb-4 border-b border-ink-light/10">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-light hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Notes
        </Link>
        <div className="font-serif font-semibold text-ink-light">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="w-[80px] text-right font-semibold text-accent">
          Score: {score}
        </div>
      </header>

      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-ink-light/10">
        <div className="inline-block px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full border border-stone-200 mb-6 uppercase tracking-wider">
          {currentQ.difficulty}
        </div>
        
        <h2 className="text-2xl font-serif font-semibold text-ink mb-8 leading-snug">
          {currentQ.question}
        </h2>

        <div className="flex flex-col gap-3 mb-8">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrect = opt === currentQ.correctAnswer;
            
            let btnClass = "text-left p-4 rounded-xl border transition-all text-ink ";
            
            if (!isRevealed) {
              btnClass += isSelected 
                ? "border-ink bg-ink/5 ring-1 ring-ink" 
                : "border-ink-light/20 hover:border-ink/50 hover:bg-stone-50";
            } else {
              if (isCorrect) {
                btnClass += "border-green-500 bg-green-50 text-green-900";
              } else if (isSelected) {
                btnClass += "border-red-500 bg-red-50 text-red-900";
              } else {
                btnClass += "border-ink-light/10 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={isRevealed}
                onClick={() => handleSelect(opt)}
                className={btnClass}
              >
                <div className="flex justify-between items-center gap-4">
                  <span className="flex-1">{opt}</span>
                  {isRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />}
                  {isRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="bg-paper p-6 rounded-2xl border border-ink-light/20 mb-8 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="font-semibold text-ink mb-1">Explanation</h4>
            <p className="text-ink-light leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!isRevealed ? (
            <button
              disabled={!selectedOption}
              onClick={handleReveal}
              className="px-8 py-3 bg-ink text-white rounded-xl font-semibold hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent/90 transition-colors animate-in fade-in"
            >
              {currentIndex === questions.length - 1 ? "View Results" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
