import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Clock,
  Award,
  Calendar,
  Layers,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Course } from '../types';
import { CreateQuizRequest, CreateQuestionRequest, BackendQuizItem } from './types';
import { quizApi } from './api/quizApi';

interface CreateQuizModalProps {
  isOpen: boolean;
  courses: Course[];
  onClose: () => void;
  onQuizCreated: (quiz: BackendQuizItem) => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  courses,
  onClose,
  onQuizCreated,
}) => {
  if (!isOpen) return null;

  // Form states based on CreateQuizRequest DTO
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || 'crs-201');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [passMark, setPassMark] = useState<number>(15);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [showResultImmediately, setShowResultImmediately] = useState<boolean>(true);

  // Initial Questions builder inside creation modal
  const [questions, setQuestions] = useState<CreateQuestionRequest[]>([
    {
      id: `q-init-1`,
      questionText: 'What is the balance factor invariant in an AVL tree for any internal node?',
      questionType: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
      marks: 5,
      questionOrder: 1,
      options: [
        { optionText: 'balance_factor ∈ {-1, 0, 1}', correct: true, optionOrder: 1 },
        { optionText: 'balance_factor strictly = 0', correct: false, optionOrder: 2 },
        { optionText: 'balance_factor >= 2', correct: false, optionOrder: 3 },
        { optionText: 'balance_factor <= -2', correct: false, optionOrder: 4 },
      ],
      explanation: 'AVL trees enforce |height(left) - height(right)| <= 1 at every node.',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeStep, setActiveStep] = useState<'config' | 'questions'>('config');

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleAddQuestion = () => {
    const newQ: CreateQuestionRequest = {
      id: `q-${Date.now()}-${questions.length + 1}`,
      questionText: '',
      questionType: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
      marks: 5,
      questionOrder: questions.length + 1,
      options: [
        { optionText: 'Choice A', correct: true, optionOrder: 1 },
        { optionText: 'Choice B', correct: false, optionOrder: 2 },
        { optionText: 'Choice C', correct: false, optionOrder: 3 },
        { optionText: 'Choice D', correct: false, optionOrder: 4 },
      ],
      explanation: '',
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (idx: number, updated: CreateQuestionRequest) => {
    const list = [...questions];
    list[idx] = updated;
    setQuestions(list);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setErrorMsg('A quiz must contain at least one question.');
      return;
    }
    const list = questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, questionOrder: i + 1 }));
    setQuestions(list);
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title.trim()) {
      setErrorMsg('Quiz title is required.');
      return;
    }
    if (title.length > 150) {
      setErrorMsg('Quiz title cannot exceed 150 characters.');
      return;
    }
    if (durationMinutes < 1) {
      setErrorMsg('Duration must be at least 1 minute.');
      return;
    }
    if (maxAttempts < 1) {
      setErrorMsg('Maximum attempts must be at least 1.');
      return;
    }
    if (passMark > totalMarks && questions.length > 0) {
      setErrorMsg(`Pass mark (${passMark}) cannot be greater than total marks (${totalMarks}).`);
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setErrorMsg(`Question #${i + 1} prompt cannot be blank.`);
        setActiveStep('questions');
        return;
      }
      if (q.options.length < 4 || q.options.length > 5) {
        setErrorMsg(`Question #${i + 1} must have between 4 and 5 options.`);
        setActiveStep('questions');
        return;
      }
      const correctCount = q.options.filter((o) => o.correct).length;
      if (correctCount !== 1) {
        setErrorMsg(`Question #${i + 1} must have exactly one correct answer selected.`);
        setActiveStep('questions');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const requestPayload: CreateQuizRequest = {
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes,
        passMark,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        maxAttempts,
        showResultImmediately,
        creationMethod: 'MANUAL',
      };

      const course = courses.find((c) => c.id === courseId);
      const createdQuiz: BackendQuizItem = {
        id: `qiz-${Date.now()}`,
        courseId,
        courseCode: course?.code || 'CS-201',
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes,
        totalMarks,
        passMark,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        maxAttempts,
        status: publishImmediately ? 'PUBLISHED' : 'DRAFT',
        creationMethod: 'MANUAL',
        showResultImmediately,
        questions: questions.map((q, idx) => ({
          id: q.id || `q-${Date.now()}-${idx}`,
          questionText: q.questionText,
          questionType: 'MULTIPLE_CHOICE_SINGLE_ANSWER',
          marks: q.marks,
          questionOrder: idx + 1,
          options: q.options.map((o, oIdx) => ({
            id: o.id || `opt-${idx}-${oIdx}`,
            optionText: o.optionText,
            correct: o.correct,
            optionOrder: oIdx + 1,
          })),
          explanation: q.explanation,
        })),
        totalQuestions: questions.length,
        attemptsCount: 0,
        averageScorePercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onQuizCreated(createdQuiz);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Create New Academic Quiz</h3>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                CreateQuizRequest
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure parameters, time boundaries, and question banks matching backend assignment-service
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveStep('config')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeStep === 'config'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            1. Quiz Settings & Constraints
          </button>
          <button
            type="button"
            onClick={() => setActiveStep('questions')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeStep === 'questions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>2. Question Bank</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px]">
              {questions.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeStep === 'config' ? (
            <div className="space-y-4">
              {/* Course Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Target Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title with 150 char counter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Quiz Title <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono ${title.length > 140 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {title.length}/150
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={150}
                  placeholder="e.g. Quiz 3: AVL Tree Rotations & Invariants"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Description & Student Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide test instructions, topics covered, and calculator/note policies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-none text-slate-800"
                />
              </div>

              {/* Grid: Duration, Pass Mark, Max Attempts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Duration (Minutes) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Pass Mark (Points) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={passMark}
                    onChange={(e) => setPassMark(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Max Attempts <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Availability Start Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Availability End Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Boolean Option: Show result immediately */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Show Results Immediately</span>
                  <p className="text-[11px] text-slate-500">
                    If enabled, students see their score and rationales immediately upon submission.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showResultImmediately}
                  onChange={(e) => setShowResultImmediately(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            /* QUESTIONS STEP */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Questions ({questions.length}) · Total Marks: {totalMarks}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Backend rule: 4 to 5 options per question with exactly 1 correct answer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Enter question prompt..."
                          value={q.questionText}
                          onChange={(e) => {
                            const updated = { ...q, questionText: e.target.value };
                            handleUpdateQuestion(qIdx, updated);
                          }}
                          className="w-full px-3 py-1.5 text-xs font-semibold text-slate-900 border border-slate-200 rounded-lg bg-white focus:outline-hidden"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 font-mono">Marks:</span>
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={q.marks}
                          onChange={(e) => {
                            const updated = { ...q, marks: Number(e.target.value) || 1 };
                            handleUpdateQuestion(qIdx, updated);
                          }}
                          className="w-16 px-2 py-1 text-xs font-mono font-bold text-indigo-700 border border-slate-200 rounded-md bg-white text-center"
                        />

                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(qIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.correct
                              ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400/30'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`create-radio-${qIdx}`}
                            checked={opt.correct}
                            onChange={() => {
                              const updatedOptions = q.options.map((o, i) => ({
                                ...o,
                                correct: i === oIdx,
                              }));
                              handleUpdateQuestion(qIdx, { ...q, options: updatedOptions });
                            }}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <input
                            type="text"
                            value={opt.optionText}
                            onChange={(e) => {
                              const updatedOptions = [...q.options];
                              updatedOptions[oIdx] = { ...opt, optionText: e.target.value };
                              handleUpdateQuestion(qIdx, { ...q, options: updatedOptions });
                            }}
                            className="flex-1 bg-transparent text-xs font-medium text-slate-800 focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total: <strong className="text-slate-900 font-mono">{questions.length} Questions · {totalMarks} Marks</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-colors"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish Quiz</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
