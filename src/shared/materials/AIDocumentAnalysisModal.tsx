import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  HelpCircle,
  FileText,
  Send,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Layers,
  GraduationCap,
  Download,
} from 'lucide-react';
import { MaterialItem } from './types';

interface AIDocumentAnalysisModalProps {
  isOpen: boolean;
  material: MaterialItem | null;
  onClose: () => void;
  onExportQuizQuestion?: (question: any) => void;
}

type TabMode = 'summary' | 'concepts' | 'quiz' | 'qa';

interface GeneratedQuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  userAnswer?: number;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIDocumentAnalysisModal: React.FC<AIDocumentAnalysisModalProps> = ({
  isOpen,
  material,
  onClose,
  onExportQuizQuestion,
}) => {
  if (!isOpen || !material) return null;

  const [activeTab, setActiveTab] = useState<TabMode>('summary');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedConcepts, setCopiedConcepts] = useState(false);

  // Q&A state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello! I have indexed "${material.fileName}" from ${material.courseCode}. Ask me anything about the theoretical foundations, implementation details, formulas, or practical homework applications in this document.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Interactive Quiz state
  const [quizQuestions, setQuizQuestions] = useState<GeneratedQuizItem[]>([
    {
      id: 'q1',
      question: `According to ${material.title}, when is a Double Left-Right (LR) rotation required during AVL insertion?`,
      options: [
        'When a node has balance factor +2 and its left child has balance factor -1',
        'When the tree height exceeds O(n log n) total depth',
        'When inserting into the rightmost leaf of a right-heavy sub-tree',
        'When removing duplicate keys from a binary search tree',
      ],
      correctIndex: 0,
      explanation:
        'A Left-Right (LR) imbalance occurs when a node is left-heavy (BF = +2) and its left child is right-heavy (BF = -1), necessitating a left rotation on the child followed by a right rotation on the parent.',
    },
    {
      id: 'q2',
      question: 'What is the strict upper bound on time complexity for searching in an AVL tree containing n nodes?',
      options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1) amortized'],
      correctIndex: 1,
      explanation:
        'Because the AVL balance factor guarantee maintains maximum height h <= 1.44 * log2(n), search operations are guaranteed to complete in strict O(log n) time.',
    },
    {
      id: 'q3',
      question: 'What is the required rebalancing action when Balance Factor equals 0 across all nodes?',
      options: [
        'Perform a single left rotation on root',
        'Rehash the keys into an external table',
        'No rebalancing required; the tree is perfectly balanced',
        'Trigger top-down cascade deletion',
      ],
      correctIndex: 2,
      explanation:
        'A balance factor of 0 indicates that both left and right child subtrees possess identical heights; hence the tree invariant is satisfied and no rotation is needed.',
    },
  ]);

  const handleCopySummary = () => {
    if (material.aiSummary) {
      navigator.clipboard.writeText(material.aiSummary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAsking) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setIsAsking(true);

    setTimeout(() => {
      let botResponse = `Based on page 4 of "${material.fileName}", `;
      if (userText.toLowerCase().includes('complexity') || userText.toLowerCase().includes('time')) {
        botResponse += 'the worst-case time complexity is bounded by O(log n) due to height-invariance preservation across recursive insert and delete steps.';
      } else if (userText.toLowerCase().includes('rotation') || userText.toLowerCase().includes('balance')) {
        botResponse += 'rotations update parent and child pointers in O(1) time without violating BST in-order sorting properties.';
      } else {
        botResponse += `the author emphasizes adhering to the institutional standards specified for ${material.courseCode}. Key invariants require maintaining strict balance metrics across subtrees.`;
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: botResponse, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
      setIsAsking(false);
    }, 600);
  };

  const handleSelectQuizAnswer = (questionId: string, optionIndex: number) => {
    setQuizQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, userAnswer: optionIndex } : q))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-white/10 px-2 py-0.5 rounded">
                  Mentify AI Document Studio
                </span>
                <span className="text-xs font-mono text-indigo-200/80">{material.courseCode}</span>
              </div>
              <h3 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                {material.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
          {[
            { id: 'summary', label: 'Executive Summary', icon: FileText },
            { id: 'concepts', label: 'Key Concepts & Glossary', icon: Lightbulb },
            { id: 'quiz', label: 'Practice Quiz & Knowledge Check', icon: GraduationCap },
            { id: 'qa', label: 'Ask Document (Q&A)', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: EXECUTIVE SUMMARY */}
          {activeTab === 'summary' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Document Synthesis & Abstract</h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Extracted from S3 document stream ({material.fileSizeFormatted})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy Summary'}</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-slate-800 leading-relaxed text-sm space-y-3">
                <p>{material.aiSummary}</p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono text-indigo-900/80">
                  <span>Target Course: {material.courseTitle}</span>
                  <span>·</span>
                  <span>Estimated Study Time: 25 mins</span>
                </div>
              </div>

              {/* Study Highlights */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Core Invariants Identified
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {material.aiKeyConcepts?.map((concept, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-start gap-2.5"
                    >
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed">{concept}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEY CONCEPTS & GLOSSARY */}
          {activeTab === 'concepts' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div>
                <h4 className="text-base font-bold text-slate-900">Terminology & Conceptual Glossary</h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Semantic definitions extracted for student review and flashcards
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {material.aiKeyConcepts?.map((concept, idx) => {
                  const parts = concept.split(':');
                  const term = parts[0];
                  const definition = parts.slice(1).join(':') || concept;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm text-indigo-950">
                          {term}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          Concept #{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{definition}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRACTICE QUIZ */}
          {activeTab === 'quiz' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">Grounded Knowledge Check</h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    AI-generated quiz questions based strictly on the content of {material.fileName}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {quizQuestions.map((q, qIndex) => {
                  const hasAnswered = q.userAnswer !== undefined;
                  const isCorrect = q.userAnswer === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {qIndex + 1}. {q.question}
                        </h5>
                        {hasAnswered && (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isCorrect ? 'Correct!' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, oIndex) => {
                          const isSelected = q.userAnswer === oIndex;
                          const isOptionCorrect = oIndex === q.correctIndex;

                          let btnClasses =
                            'w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ';
                          if (!hasAnswered) {
                            btnClasses += 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-800';
                          } else if (isSelected && isOptionCorrect) {
                            btnClasses += 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                          } else if (isSelected && !isOptionCorrect) {
                            btnClasses += 'border-rose-500 bg-rose-50 text-rose-900';
                          } else if (isOptionCorrect) {
                            btnClasses += 'border-emerald-300 bg-emerald-50/50 text-emerald-800 font-semibold';
                          } else {
                            btnClasses += 'border-slate-200 opacity-60 text-slate-500';
                          }

                          return (
                            <button
                              key={oIndex}
                              type="button"
                              onClick={() => handleSelectQuizAnswer(q.id, oIndex)}
                              className={btnClasses}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed animate-in fade-in">
                          <strong className="text-slate-900 font-semibold">Explanation: </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Q&A INTERACTION */}
          {activeTab === 'qa' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col justify-between space-y-4">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[350px]">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] mt-1 block font-mono ${
                          msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isAsking && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>Synthesizing response from document...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendQuestion} className="pt-2 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Ask a question about ${material.fileName}...`}
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isAsking}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
