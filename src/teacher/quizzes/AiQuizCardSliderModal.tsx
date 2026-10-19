import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Edit3,
  Sliders,
  Clock,
  Award,
  Layers,
  BookOpen,
  Send,
  Save,
  Check,
  Plus,
  Trash2,
  Lightbulb,
  Maximize2,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import {
  AiQuizDraftResponse,
  CreateQuestionRequest,
  QuestionOptionRequest,
  BackendQuizItem,
  QuizGenerationDifficulty,
} from './types';
import { Course } from '../types';

interface AiQuizCardSliderModalProps {
  draft: AiQuizDraftResponse;
  initialTitle: string;
  initialDescription: string;
  initialDuration: number;
  initialPassMark: number;
  course?: Course;
  sourceFileName?: string;
  onClose: () => void;
  onSaveDraft: (quizData: BackendQuizItem) => void;
  onPublish: (quizData: BackendQuizItem) => void;
  onRegenerate?: () => void;
}

export const AiQuizCardSliderModal: React.FC<AiQuizCardSliderModalProps> = ({
  draft,
  initialTitle,
  initialDescription,
  initialDuration,
  initialPassMark,
  course,
  sourceFileName,
  onClose,
  onSaveDraft,
  onPublish,
  onRegenerate,
}) => {
  // Questions State
  const [questions, setQuestions] = useState<CreateQuestionRequest[]>(draft.questions || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Quiz Meta State
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [durationMinutes, setDurationMinutes] = useState(initialDuration);
  const [passMark, setPassMark] = useState(initialPassMark);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Editing state for active question
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingRationale, setIsEditingRationale] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  // Auto-recalculate recommended passMark if totalMarks changes
  useEffect(() => {
    if (passMark > totalMarks && totalMarks > 0) {
      setPassMark(Math.round(totalMarks * 0.6));
    }
  }, [totalMarks]);

  // Keyboard navigation for slider
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept when user is typing
      }
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions]);

  const goToNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection('right');
      setCurrentIndex((prev) => prev + 1);
      setIsEditingQuestion(false);
      setIsEditingRationale(false);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection('left');
      setCurrentIndex((prev) => prev - 1);
      setIsEditingQuestion(false);
      setIsEditingRationale(false);
    }
  };

  const jumpToSlide = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setDirection(index > currentIndex ? 'right' : 'left');
      setCurrentIndex(index);
      setIsEditingQuestion(false);
      setIsEditingRationale(false);
    }
  };

  // Question editing actions
  const handleSelectCorrectOption = (optIdx: number) => {
    const updated = [...questions];
    const q = { ...updated[currentIndex] };
    q.options = q.options.map((opt, i) => ({
      ...opt,
      correct: i === optIdx,
    }));
    updated[currentIndex] = q;
    setQuestions(updated);
  };

  const handleUpdateOptionText = (optIdx: number, newText: string) => {
    const updated = [...questions];
    const q = { ...updated[currentIndex] };
    q.options = [...q.options];
    q.options[optIdx] = { ...q.options[optIdx], optionText: newText };
    updated[currentIndex] = q;
    setQuestions(updated);
  };

  const handleAddOption = () => {
    const updated = [...questions];
    const q = { ...updated[currentIndex] };
    if (q.options.length >= 5) {
      setErrorMsg('Backend rule: A question cannot have more than 5 options.');
      return;
    }
    setErrorMsg('');
    const newOptionNumber = q.options.length + 1;
    q.options = [
      ...q.options,
      {
        id: `opt-${Date.now()}-${newOptionNumber}`,
        optionText: `Alternative option ${newOptionNumber}`,
        correct: false,
        optionOrder: newOptionNumber,
      },
    ];
    updated[currentIndex] = q;
    setQuestions(updated);
  };

  const handleRemoveOption = (optIdx: number) => {
    const updated = [...questions];
    const q = { ...updated[currentIndex] };
    if (q.options.length <= 4) {
      setErrorMsg('Backend rule: A question must have at least 4 options.');
      return;
    }
    setErrorMsg('');
    const wasCorrect = q.options[optIdx].correct;
    q.options = q.options.filter((_, i) => i !== optIdx);
    if (wasCorrect && q.options.length > 0) {
      q.options[0].correct = true;
    }
    // Re-index option orders
    q.options = q.options.map((opt, i) => ({ ...opt, optionOrder: i + 1 }));
    updated[currentIndex] = q;
    setQuestions(updated);
  };

  const handleUpdateQuestionPrompt = (text: string) => {
    const updated = [...questions];
    updated[currentIndex] = { ...updated[currentIndex], questionText: text };
    setQuestions(updated);
  };

  const handleUpdateExplanation = (text: string) => {
    const updated = [...questions];
    updated[currentIndex] = { ...updated[currentIndex], explanation: text };
    setQuestions(updated);
  };

  const handleUpdateMarks = (val: number) => {
    const safeVal = Math.max(1, Math.min(100, val));
    const updated = [...questions];
    updated[currentIndex] = { ...updated[currentIndex], marks: safeVal };
    setQuestions(updated);
  };

  const handleDeleteCurrentQuestion = () => {
    if (questions.length <= 1) {
      setErrorMsg('A quiz must contain at least one question.');
      return;
    }
    const updated = questions.filter((_, i) => i !== currentIndex);
    // Re-index question orders
    const reindexed = updated.map((q, i) => ({ ...q, questionOrder: i + 1 }));
    setQuestions(reindexed);
    if (currentIndex >= reindexed.length) {
      setCurrentIndex(reindexed.length - 1);
    }
    setErrorMsg('');
  };

  // Validation
  const validateQuiz = (): string | null => {
    if (!title.trim()) return 'Quiz title is required (maximum 150 characters).';
    if (title.length > 150) return 'Quiz title cannot exceed 150 characters.';
    if (durationMinutes < 1) return 'Quiz duration must be at least 1 minute.';
    if (questions.length === 0) return 'Quiz must contain at least one question.';
    if (passMark > totalMarks) {
      return `Pass mark (${passMark}) cannot exceed total marks (${totalMarks}).`;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question #${i + 1} prompt cannot be empty.`;
      if (q.options.length < 4 || q.options.length > 5) {
        return `Question #${i + 1} must have between 4 and 5 options (current: ${q.options.length}).`;
      }
      const correctCount = q.options.filter((o) => o.correct).length;
      if (correctCount !== 1) {
        return `Question #${i + 1} must have exactly one correct answer selected.`;
      }
      for (const opt of q.options) {
        if (!opt.optionText.trim()) return `An option in Question #${i + 1} is empty.`;
      }
    }
    return null;
  };

  const buildBackendQuizItem = (status: 'DRAFT' | 'PUBLISHED'): BackendQuizItem => {
    return {
      id: `qiz-${Date.now()}`,
      courseId: draft.courseId,
      courseCode: course?.code || 'CS-201',
      title: title.trim(),
      description: description.trim(),
      durationMinutes,
      totalMarks,
      passMark,
      maxAttempts: 2,
      status,
      creationMethod: 'AI_GENERATED',
      showResultImmediately: true,
      questions: questions.map((q, idx) => ({
        id: q.id || `q-${Date.now()}-${idx}`,
        questionText: q.questionText,
        questionType: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
        marks: q.marks,
        questionOrder: q.questionOrder || idx + 1,
        options: q.options.map((o, oIdx) => ({
          id: o.id || `opt-${idx}-${oIdx}`,
          optionText: o.optionText,
          correct: o.correct,
          optionOrder: o.optionOrder || oIdx + 1,
        })),
        explanation: q.explanation,
      })),
      totalQuestions: questions.length,
      attemptsCount: 0,
      averageScorePercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSaveAsDraft = () => {
    const error = validateQuiz();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    const item = buildBackendQuizItem('DRAFT');
    setSuccessToast('Draft saved successfully!');
    setTimeout(() => {
      onSaveDraft(item);
    }, 600);
  };

  const handlePublishNow = () => {
    const error = validateQuiz();
    if (error) {
      setErrorMsg(error);
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    const item = buildBackendQuizItem('PUBLISHED');
    setSuccessToast('Quiz published successfully for student attempts!');
    setTimeout(() => {
      onPublish(item);
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-quiz-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300"
    >
      {/* Ambient decorative glowing backlights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[860px] flex flex-col bg-slate-900/95 text-white rounded-3xl border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden transition-all">
        {/* TOP GLOW ACCENT LINE */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400" />

        {/* TOP HEADER BAR */}
        <div className="px-5 sm:px-7 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0 border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold uppercase tracking-wider">
                  {draft.provider || 'AI Generated'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {course?.code || 'CS-201'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {draft.difficulty} Difficulty
                </span>
              </div>
              <h1 id="ai-quiz-modal-title" className="text-sm sm:text-base font-bold text-white tracking-tight truncate mt-0.5 flex items-center gap-2">
                <span>{title}</span>
                <button
                  onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
                  className="text-slate-400 hover:text-indigo-300 p-1 rounded-md hover:bg-slate-800 transition-colors"
                  title="Configure Quiz Settings"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </h1>
            </div>
          </div>

          {/* Quick Metrics & Close */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{durationMinutes} min</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pass: {passMark}/{totalMarks} pts</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                showSettingsDrawer
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Toggle Quiz Details Drawer"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden md:inline">Quiz Settings</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 transition-colors"
              title="Close Slider (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COLLAPSIBLE QUIZ METADATA SETTINGS DRAWER */}
        {showSettingsDrawer && (
          <div className="px-5 sm:px-7 py-3.5 bg-slate-800/90 border-b border-slate-700 text-xs animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Quiz Title ({title.length}/150)
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value) || 20))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Pass Mark (out of {totalMarks})
                </label>
                <input
                  type="number"
                  min={1}
                  max={totalMarks}
                  value={passMark}
                  onChange={(e) => setPassMark(Math.max(1, Number(e.target.value) || 10))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-12">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-indigo-500 resize-none text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK & NOTIFICATION BANNERS */}
        {errorMsg && (
          <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg('')}
              className="p-1 hover:bg-rose-500/20 rounded-md text-rose-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successToast && (
          <div className="mx-5 sm:mx-7 mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {/* SLIDER PROGRESS BAR */}
        <div className="px-5 sm:px-7 pt-3 pb-1 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
              Question Card {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-mono text-slate-400">
              {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Reviewed
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="hidden sm:inline">Navigate:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
              →
            </kbd>
          </div>
        </div>

        {/* Progress track */}
        <div className="mx-5 sm:mx-7 h-1 bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* CENTER STAGE: THE CARD SLIDER */}
        <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Previous Slide Chevron Button */}
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Previous Question (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-300" />
          </button>

          {/* Next Slide Chevron Button */}
          <button
            onClick={goToNext}
            disabled={currentIndex === totalQuestions - 1}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 text-white border border-slate-700/80 flex items-center justify-center shadow-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="Next Question (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5 text-indigo-300" />
          </button>

          {/* Active Question Card (The centerpiece) */}
          {currentQuestion && (
            <div
              key={currentIndex}
              className={`w-full max-w-3xl h-full flex flex-col bg-slate-800/90 rounded-2xl border border-slate-700/90 shadow-2xl p-5 sm:p-7 overflow-y-auto backdrop-blur-md transition-all duration-300 ${
                direction === 'right'
                  ? 'animate-in slide-in-from-right-8 fade-in'
                  : 'animate-in slide-in-from-left-8 fade-in'
              }`}
            >
              {/* Question Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/80 gap-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 font-bold font-mono text-xs flex items-center justify-center shadow-xs">
                    Q{currentIndex + 1}
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                      Single Choice Question
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Backend rule: 4–5 choices with 1 verified correct answer
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Marks input */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] text-slate-400 font-medium">Marks:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={currentQuestion.marks}
                      onChange={(e) => handleUpdateMarks(Number(e.target.value) || 1)}
                      className="w-10 text-center bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-hidden"
                    />
                  </div>

                  {/* Delete question */}
                  <button
                    onClick={handleDeleteCurrentQuestion}
                    disabled={totalQuestions <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="py-4 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Question Prompt
                  </label>
                  <button
                    onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingQuestion ? 'Done Editing' : 'Edit Text'}</span>
                  </button>
                </div>

                {isEditingQuestion ? (
                  <textarea
                    rows={3}
                    value={currentQuestion.questionText}
                    onChange={(e) => handleUpdateQuestionPrompt(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900/90 border border-indigo-500/50 text-white text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter question prompt..."
                  />
                ) : (
                  <h2 className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                    {currentQuestion.questionText}
                  </h2>
                )}
              </div>

              {/* Distractor Options List */}
              <div className="space-y-2.5 my-2 flex-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                  <span className="font-bold uppercase tracking-wider">
                    Options ({currentQuestion.options.length}/5) · Click radio to mark correct
                  </span>
                  {currentQuestion.options.length < 5 && (
                    <button
                      onClick={handleAddOption}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>

                {currentQuestion.options.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  return (
                    <div
                      key={opt.id || optIdx}
                      onClick={() => handleSelectCorrectOption(optIdx)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        opt.correct
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/80 text-slate-200'
                      }`}
                    >
                      {/* Radio / Letter Badge */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          opt.correct
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 group-hover:text-white'
                        }`}
                      >
                        {opt.correct ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                      </div>

                      {/* Option Text Input / Display */}
                      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={opt.optionText}
                          onChange={(e) => handleUpdateOptionText(optIdx, e.target.value)}
                          className={`w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-400 rounded px-1.5 py-0.5 ${
                            opt.correct ? 'text-emerald-100 font-semibold' : 'text-slate-200'
                          }`}
                        />
                      </div>

                      {/* Right Tag / Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {opt.correct && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Correct Answer
                          </span>
                        )}

                        {currentQuestion.options.length > 4 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveOption(optIdx);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                            title="Remove option (min 4)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Explanation / Rationale */}
              <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200/90 shrink-0 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Pedagogical Rationale & Concept Invariant</span>
                  </div>
                  <button
                    onClick={() => setIsEditingRationale(!isEditingRationale)}
                    className="text-[10px] text-amber-300 hover:text-amber-100 underline"
                  >
                    {isEditingRationale ? 'Done' : 'Edit Explanation'}
                  </button>
                </div>

                {isEditingRationale ? (
                  <textarea
                    rows={2}
                    value={currentQuestion.explanation || ''}
                    onChange={(e) => handleUpdateExplanation(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-amber-500/40 text-xs text-amber-100 focus:outline-hidden"
                    placeholder="Provide concept justification..."
                  />
                ) : (
                  <p className="text-xs leading-relaxed text-amber-200/90 font-mono">
                    {currentQuestion.explanation ||
                      'Correct answer derived directly from syllabus theorems and invariant verification.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM QUESTION THUMBNAIL TRACK & ACTION TOOLBAR */}
        <div className="px-5 sm:px-7 py-4 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          {/* Question Dots / Quick jump track */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasSingleCorrect = q.options.filter((o) => o.correct).length === 1;
              return (
                <button
                  key={idx}
                  onClick={() => jumpToSlide(idx)}
                  className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400 scale-105'
                      : hasSingleCorrect
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                  title={`Jump to Question ${idx + 1} (${q.marks} marks)`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Discard this draft and return to generator"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Regenerate</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-600/80 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-slate-300" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={handlePublishNow}
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-slate-950 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Quiz Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
