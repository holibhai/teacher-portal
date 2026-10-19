import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  BarChart3,
  ChevronRight,
  Layers,
  Sparkles,
  BookOpen,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Eye,
  Sliders,
  Award,
  Users,
} from 'lucide-react';
import { Quiz, QuizQuestion, NavigationTab, Course } from '../types';
import { mockQuizzes, mockCourses } from '../data/mockData';
import { StatusBadge } from '../components/StatusBadge';
import { QuestionBuilderModal } from './QuestionBuilderModal';
import { CreateQuizModal } from './CreateQuizModal';
import { AiQuizGeneratorCard } from './AiQuizGeneratorCard';
import { AiQuizCardSliderModal } from './AiQuizCardSliderModal';
import { BackendQuizItem } from './types';
import { quizApi } from './api/quizApi';

interface QuizDashboardViewProps {
  onOpenCreateQuiz?: () => void;
  onNavigate?: (tab: NavigationTab) => void;
  onOpenAIWithPrompt?: (prompt: string) => void;
}

export const QuizDashboardView: React.FC<QuizDashboardViewProps> = ({
  onNavigate,
}) => {
  // State for Quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(mockQuizzes[0] || null);

  // Filters
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Active' | 'Completed'>('All');

  // Modals & Panels
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const [isQuestionBuilderOpen, setIsQuestionBuilderOpen] = useState(false);
  const [sliderPreviewQuiz, setSliderPreviewQuiz] = useState<Quiz | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Convert BackendQuizItem to frontend Quiz
  const handleQuizCreated = (newBackendQuiz: BackendQuizItem) => {
    const course = mockCourses.find((c) => c.id === newBackendQuiz.courseId);

    const convertedQuestions: QuizQuestion[] = newBackendQuiz.questions.map((q, idx) => ({
      id: q.id || `q-${Date.now()}-${idx}`,
      quizId: newBackendQuiz.id,
      type: 'multiple-choice',
      question: q.questionText,
      options: q.options.map((o) => o.optionText),
      correctAnswer: q.options.find((o) => o.correct)?.optionText || q.options[0]?.optionText || '',
      explanation: q.explanation || 'Verified concept rationale.',
      marks: Number(q.marks) || 5,
    }));

    const convertedQuiz: Quiz = {
      id: newBackendQuiz.id,
      courseId: newBackendQuiz.courseId,
      courseCode: newBackendQuiz.courseCode || course?.code || 'CS-201',
      title: newBackendQuiz.title,
      description: newBackendQuiz.description || '',
      durationMinutes: newBackendQuiz.durationMinutes,
      totalQuestions: convertedQuestions.length,
      totalMarks: newBackendQuiz.totalMarks,
      status: newBackendQuiz.status === 'PUBLISHED' ? 'Active' : 'Draft',
      dueDate: newBackendQuiz.endTime ? new Date(newBackendQuiz.endTime).toLocaleDateString() : 'Nov 05, 2026',
      attemptsCount: 0,
      totalEligible: 48,
      averageScorePercent: 0,
      questions: convertedQuestions,
    };

    setQuizzes((prev) => [convertedQuiz, ...prev]);
    setSelectedQuiz(convertedQuiz);
    setIsAiGeneratorOpen(false);
    setIsCreateQuizOpen(false);
    showToast(
      `Quiz "${convertedQuiz.title}" created successfully as ${convertedQuiz.status}!`,
      'success'
    );
  };

  const handleSaveQuestion = (newQuestion: QuizQuestion) => {
    if (!selectedQuiz) return;
    const updatedQuestions = [...selectedQuiz.questions, newQuestion];
    const updatedQuiz: Quiz = {
      ...selectedQuiz,
      questions: updatedQuestions,
      totalQuestions: updatedQuestions.length,
      totalMarks: selectedQuiz.totalMarks + newQuestion.marks,
    };

    setQuizzes((prev) => prev.map((q) => (q.id === selectedQuiz.id ? updatedQuiz : q)));
    setSelectedQuiz(updatedQuiz);
    showToast(`Question added (${newQuestion.marks} marks). Total marks: ${updatedQuiz.totalMarks}`, 'success');
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedQuiz) return;
    const questionToRemove = selectedQuiz.questions.find((q) => q.id === questionId);
    if (!questionToRemove) return;

    const updatedQuestions = selectedQuiz.questions.filter((q) => q.id !== questionId);
    const updatedQuiz: Quiz = {
      ...selectedQuiz,
      questions: updatedQuestions,
      totalQuestions: updatedQuestions.length,
      totalMarks: Math.max(0, selectedQuiz.totalMarks - questionToRemove.marks),
    };

    setQuizzes((prev) => prev.map((q) => (q.id === selectedQuiz.id ? updatedQuiz : q)));
    setSelectedQuiz(updatedQuiz);
    showToast('Question removed from quiz.', 'success');
  };

  const handlePublishQuiz = async (quiz: Quiz) => {
    if (quiz.questions.length === 0) {
      showToast('Cannot publish: Quiz must contain at least one question.', 'error');
      return;
    }

    try {
      await quizApi.publishQuiz(quiz.id);
      const updated: Quiz = {
        ...quiz,
        status: 'Active',
      };
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? updated : q)));
      setSelectedQuiz(updated);
      showToast(`Quiz "${quiz.title}" published! Students can now access it.`, 'success');
    } catch {
      showToast('Failed to publish quiz.', 'error');
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizApi.deleteQuiz(quizId);
      const remaining = quizzes.filter((q) => q.id !== quizId);
      setQuizzes(remaining);
      setSelectedQuiz(remaining[0] || null);
      showToast('Quiz deleted successfully.', 'success');
    } catch {
      showToast('Failed to delete quiz.', 'error');
    }
  };

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'All' || q.courseId === courseFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Draft' && q.status === 'Draft') ||
      (statusFilter === 'Active' && q.status === 'Active') ||
      (statusFilter === 'Completed' && q.status === 'Completed');
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Quiz & Assessment Workspace
            </h1>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              assignment-service
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Formulate automated grading quizzes, diagnostic concept checks, and AI-generated assessments from course documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Quiz Button (Maintains internal card section per prompt!) */}
          <button
            onClick={() => setIsAiGeneratorOpen((prev) => !prev)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              isAiGeneratorOpen
                ? 'bg-violet-700 text-white border-violet-800 shadow-md ring-2 ring-violet-500/20'
                : 'text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200 shadow-xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isAiGeneratorOpen ? 'Hide AI Generator' : 'AI Quiz from Docs'}</span>
          </button>

          {/* New Manual Quiz Modal */}
          <button
            onClick={() => setIsCreateQuizOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quiz</span>
          </button>
        </div>
      </div>

      {/* DEDICATED AI QUIZ GENERATOR CARD SECTION (When opened) */}
      {isAiGeneratorOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-200">
          <AiQuizGeneratorCard
            courses={mockCourses}
            onQuizCreated={handleQuizCreated}
            onClose={() => setIsAiGeneratorOpen(false)}
          />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Quizzes</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            {quizzes.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Across authorized courses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Published & Active</span>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1 tabular-nums">
            {quizzes.filter((q) => q.status === 'Active').length}
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Open for student attempts</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Avg Class Score</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">
            82.3%
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">+4.2% benchmark growth</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Completion Rate</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">
            95.8%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">110 total attempts logged</p>
        </div>
      </div>

      {/* Main 2-Column Split: Quizzes List & Selected Quiz Question Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quiz Directory */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filters */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title or course code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Courses</option>
                {mockCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Published / Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Quiz Cards */}
          <div className="space-y-2.5">
            {filtered.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                No quizzes match the search or filter criteria.
              </div>
            ) : (
              filtered.map((quiz) => {
                const isSelected = selectedQuiz?.id === quiz.id;
                return (
                  <div
                    key={quiz.id}
                    onClick={() => setSelectedQuiz(quiz)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {quiz.courseCode}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={quiz.status} />
                      </div>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{quiz.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>
                        {quiz.questions.length} Questions · {quiz.totalMarks} Marks
                      </span>
                      <span className="text-indigo-600 font-semibold">
                        {quiz.durationMinutes} mins
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quiz Question Breakdown & Questions Builder */}
        <div className="lg:col-span-7">
          {selectedQuiz ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Selected Quiz Top Bar */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded">
                      {selectedQuiz.courseCode}
                    </span>
                    <h2 className="text-sm font-bold text-slate-900">{selectedQuiz.title}</h2>
                    <StatusBadge status={selectedQuiz.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: <strong className="text-slate-700">{selectedQuiz.durationMinutes} mins</strong> · Total Marks: <strong className="text-slate-700">{selectedQuiz.totalMarks}</strong> · {selectedQuiz.attemptsCount} student attempts
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Card Slider Preview Button */}
                  {selectedQuiz.questions.length > 0 && (
                    <button
                      onClick={() => setSliderPreviewQuiz(selectedQuiz)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Preview quiz questions in Card Slider view"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Card Slider</span>
                    </button>
                  )}

                  {/* Publish button if in Draft */}
                  {selectedQuiz.status === 'Draft' && (
                    <button
                      onClick={() => handlePublishQuiz(selectedQuiz)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {/* Add Question Button */}
                  <button
                    onClick={() => setIsQuestionBuilderOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>

                  {/* Delete Quiz */}
                  <button
                    onClick={() => handleDeleteQuiz(selectedQuiz.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Delete quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Question Bank ({selectedQuiz.questions.length})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Contract: MULTIPLE_CHOICE_SINGLE_ANSWER with 4–5 options & single verified correct answer
                    </p>
                  </div>

                  <span className="text-xs font-mono text-slate-500">
                    Total Marks: <strong className="text-indigo-600">{selectedQuiz.totalMarks}</strong>
                  </span>
                </div>

                {selectedQuiz.questions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-3">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">No questions in this quiz yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Click &quot;Add Question&quot; to manually add multiple-choice questions or use the AI Generator above to formulate questions from course files.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        onClick={() => setIsQuestionBuilderOpen(true)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Question</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuiz.questions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5 bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                                {q.question}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono uppercase mt-0.5 block">
                                MULTIPLE CHOICE SINGLE ANSWER
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              {q.marks} marks
                            </span>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Options */}
                        {q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.includes(opt)
                                : q.correctAnswer === opt;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 border transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold ring-1 ring-emerald-400/30'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {isCorrect ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                                  )}
                                  <span className="truncate">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 pl-8 leading-relaxed">
                            <strong className="text-slate-700">Pedagogical Rationale: </strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a quiz to view question details
            </div>
          )}
        </div>
      </div>

      {/* Manual Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        courses={mockCourses}
        onClose={() => setIsCreateQuizOpen(false)}
        onQuizCreated={handleQuizCreated}
      />

      {/* Question Builder Modal */}
      {selectedQuiz && (
        <QuestionBuilderModal
          isOpen={isQuestionBuilderOpen}
          quizId={selectedQuiz.id}
          onClose={() => setIsQuestionBuilderOpen(false)}
          onSaveQuestion={handleSaveQuestion}
        />
      )}

      {/* Card Slider Modal for Previewing / Editing Any Quiz */}
      {sliderPreviewQuiz && (
        <AiQuizCardSliderModal
          draft={{
            courseId: sliderPreviewQuiz.courseId,
            questionCount: sliderPreviewQuiz.questions.length,
            difficulty: 'MEDIUM',
            questionType: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
            creationMethod: 'AI_GENERATED',
            questions: sliderPreviewQuiz.questions.map((q, idx) => ({
              id: q.id,
              questionText: q.question,
              questionType: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
              marks: q.marks,
              questionOrder: idx + 1,
              options: (q.options || []).map((optText, optIdx) => ({
                id: `opt-${idx}-${optIdx}`,
                optionText: optText,
                correct: optText === q.correctAnswer,
                optionOrder: optIdx + 1,
              })),
              explanation: q.explanation,
            })),
            provider: 'Mentify Assessment Engine',
            model: 'assignment-service',
            generatedAt: new Date().toISOString(),
            saved: true,
            published: sliderPreviewQuiz.status === 'Active',
          }}
          initialTitle={sliderPreviewQuiz.title}
          initialDescription={sliderPreviewQuiz.description || ''}
          initialDuration={sliderPreviewQuiz.durationMinutes}
          initialPassMark={Math.round(sliderPreviewQuiz.totalMarks * 0.6)}
          course={mockCourses.find((c) => c.id === sliderPreviewQuiz.courseId)}
          onClose={() => setSliderPreviewQuiz(null)}
          onSaveDraft={(updated) => {
            handleQuizCreated(updated);
            setSliderPreviewQuiz(null);
          }}
          onPublish={(updated) => {
            handleQuizCreated(updated);
            setSliderPreviewQuiz(null);
          }}
        />
      )}
    </div>
  );
};
