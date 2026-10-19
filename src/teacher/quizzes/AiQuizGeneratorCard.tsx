import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  X,
  Plus,
  Trash2,
  Send,
  Sliders,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import {
  AiQuizDraftResponse,
  CreateQuestionRequest,
  QuizGenerationDifficulty,
  QuestionType,
  BackendQuizItem,
} from './types';
import { quizApi } from './api/quizApi';
import { Course } from '../types';
import { AiQuizCardSliderModal } from './AiQuizCardSliderModal';

interface AiQuizGeneratorCardProps {
  courses: Course[];
  onQuizCreated: (newQuiz: BackendQuizItem) => void;
  onClose?: () => void;
}

export const AiQuizGeneratorCard: React.FC<AiQuizGeneratorCardProps> = ({
  courses,
  onQuizCreated,
  onClose,
}) => {
  // Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'crs-201');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<QuizGenerationDifficulty>('MEDIUM');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sampleDocName, setSampleDocName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Processing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Generated Draft State
  const [draft, setDraft] = useState<AiQuizDraftResponse | null>(null);
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftDescription, setDraftDescription] = useState<string>('');
  const [draftDuration, setDraftDuration] = useState<number>(25);
  const [draftPassMark, setDraftPassMark] = useState<number>(10);
  const [draftQuestions, setDraftQuestions] = useState<CreateQuestionRequest[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate total marks from questions
  const totalDraftMarks = draftQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setSampleDocName('');
      setErrorMsg('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSampleDocName('');
      setErrorMsg('');
    }
  };

  const handleSelectSample = (sampleName: string, promptSuggestion: string) => {
    // Create synthetic sample file
    const blob = new Blob(
      [
        `Academic Document: ${sampleName}\nFocus Areas: ${promptSuggestion}\nInvariants: Strict balance factor, asymptotic boundaries, runtime complexity proofs.`,
      ],
      { type: 'application/pdf' }
    );
    const mockFile = new File([blob], sampleName, { type: 'application/pdf' });
    setSelectedFile(mockFile);
    setSampleDocName(sampleName);
    setUserPrompt(promptSuggestion);
    setErrorMsg('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMsg('Please upload a course document (PDF, DOCX, TXT) or select a sample document.');
      return;
    }

    if (questionCount < 1 || questionCount > 20) {
      setErrorMsg('Question count must be between 1 and 20.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setSaveSuccessMsg('');
    setGenerationProgress(15);
    setGenerationStep('Analyzing document structure and tokenizing sections...');

    try {
      // Simulate step updates for realistic UI feedback
      setTimeout(() => {
        setGenerationProgress(45);
        setGenerationStep('Extracting key concepts, formulas, and learning objectives...');
      }, 700);

      setTimeout(() => {
        setGenerationProgress(75);
        setGenerationStep('Synthesizing 4-5 distractors per question with single correct answers...');
      }, 1400);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('courseId', selectedCourseId);
      formData.append('questionCount', questionCount.toString());
      formData.append('difficulty', difficulty);
      formData.append('questionType', 'MULTIPLE_CHOICE_SINGLE_ANSWER' as QuestionType);
      if (userPrompt.trim()) {
        formData.append('userPrompt', userPrompt.trim());
      }

      const generatedDraft = await quizApi.generateAiQuizDraft(formData);

      setGenerationProgress(100);
      setGenerationStep('Validating backend contract rules & option integrity...');

      setTimeout(() => {
        setDraft(generatedDraft);
        setDraftQuestions(generatedDraft.questions);

        const currentCourse = courses.find((c) => c.id === selectedCourseId);
        const docBaseName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setDraftTitle(
          `${currentCourse?.code || 'Course'} AI Quiz: ${docBaseName} (${difficulty.charAt(0) + difficulty.slice(1).toLowerCase()})`
        );
        setDraftDescription(
          `AI-generated diagnostic assessment formulated from "${selectedFile.name}". Focus areas: ${userPrompt || 'Core foundational invariants and trade-offs.'}`
        );

        const calculatedTotal = generatedDraft.questions.reduce(
          (sum, q) => sum + (Number(q.marks) || 0),
          0
        );
        setDraftPassMark(Math.round(calculatedTotal * 0.6));
        setDraftDuration(Math.max(15, generatedDraft.questions.length * 4));

        setIsGenerating(false);
        setIsSliderOpen(true);
      }, 400);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err?.message || 'Failed to generate quiz draft. Please verify document format.');
    }
  };

  // Question editing handlers
  const handleUpdateQuestionText = (qIdx: number, text: string) => {
    const updated = [...draftQuestions];
    updated[qIdx] = { ...updated[qIdx], questionText: text };
    setDraftQuestions(updated);
  };

  const handleUpdateMarks = (qIdx: number, marksVal: number) => {
    const updated = [...draftQuestions];
    updated[qIdx] = { ...updated[qIdx], marks: Math.max(0.1, marksVal) };
    setDraftQuestions(updated);
  };

  const handleSelectCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...draftQuestions];
    const q = { ...updated[qIdx] };
    q.options = q.options.map((opt, i) => ({
      ...opt,
      correct: i === optIdx,
    }));
    updated[qIdx] = q;
    setDraftQuestions(updated);
  };

  const handleUpdateOptionText = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...draftQuestions];
    const q = { ...updated[qIdx] };
    q.options = [...q.options];
    q.options[optIdx] = { ...q.options[optIdx], optionText: text };
    updated[qIdx] = q;
    setDraftQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...draftQuestions];
    const q = { ...updated[qIdx] };
    if (q.options.length >= 5) return; // Backend max 5 options
    q.options = [
      ...q.options,
      {
        id: `opt-${Date.now()}-${q.options.length}`,
        optionText: `New option ${q.options.length + 1}`,
        correct: false,
        optionOrder: q.options.length + 1,
      },
    ];
    updated[qIdx] = q;
    setDraftQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...draftQuestions];
    const q = { ...updated[qIdx] };
    if (q.options.length <= 4) return; // Backend min 4 options
    const removedWasCorrect = q.options[optIdx].correct;
    q.options = q.options.filter((_, i) => i !== optIdx);
    if (removedWasCorrect && q.options.length > 0) {
      q.options[0].correct = true;
    }
    // Re-index option orders
    q.options = q.options.map((opt, i) => ({ ...opt, optionOrder: i + 1 }));
    updated[qIdx] = q;
    setDraftQuestions(updated);
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (draftQuestions.length <= 1) {
      setErrorMsg('A quiz must contain at least one question.');
      return;
    }
    const updated = draftQuestions
      .filter((_, i) => i !== qIdx)
      .map((q, i) => ({ ...q, questionOrder: i + 1 }));
    setDraftQuestions(updated);
  };

  // Validate draft before saving / publishing
  const validateDraft = (): string | null => {
    if (!draftTitle.trim()) return 'Quiz title is required (maximum 150 characters).';
    if (draftTitle.length > 150) return 'Quiz title cannot exceed 150 characters.';
    if (draftQuestions.length === 0) return 'Quiz must contain at least one question.';
    if (draftPassMark > totalDraftMarks) {
      return `Pass mark (${draftPassMark}) cannot be greater than total marks (${totalDraftMarks}).`;
    }

    for (let i = 0; i < draftQuestions.length; i++) {
      const q = draftQuestions[i];
      if (!q.questionText.trim()) return `Question #${i + 1} prompt cannot be empty.`;
      if (q.options.length < 4 || q.options.length > 5) {
        return `Question #${i + 1} must contain between 4 and 5 options (current: ${q.options.length}).`;
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

  const handleSaveDraft = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const course = courses.find((c) => c.id === selectedCourseId);
      const createdItem: BackendQuizItem = {
        id: `qiz-${Date.now()}`,
        courseId: selectedCourseId,
        courseCode: course?.code || 'CS-201',
        title: draftTitle.trim(),
        description: draftDescription.trim(),
        durationMinutes: draftDuration,
        totalMarks: totalDraftMarks,
        passMark: draftPassMark,
        maxAttempts: 2,
        status: 'DRAFT',
        creationMethod: 'AI_GENERATED',
        showResultImmediately: true,
        questions: draftQuestions.map((q, idx) => ({
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
        totalQuestions: draftQuestions.length,
        attemptsCount: 0,
        averageScorePercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSaveSuccessMsg('Quiz draft created successfully in DRAFT status!');
      setTimeout(() => {
        onQuizCreated(createdItem);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save quiz draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishQuiz = async () => {
    const validationError = validateDraft();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsPublishing(true);
    setErrorMsg('');

    try {
      const course = courses.find((c) => c.id === selectedCourseId);
      const publishedItem: BackendQuizItem = {
        id: `qiz-${Date.now()}`,
        courseId: selectedCourseId,
        courseCode: course?.code || 'CS-201',
        title: draftTitle.trim(),
        description: draftDescription.trim(),
        durationMinutes: draftDuration,
        totalMarks: totalDraftMarks,
        passMark: draftPassMark,
        maxAttempts: 2,
        status: 'PUBLISHED',
        creationMethod: 'AI_GENERATED',
        showResultImmediately: true,
        questions: draftQuestions.map((q, idx) => ({
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
        totalQuestions: draftQuestions.length,
        attemptsCount: 0,
        averageScorePercent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSaveSuccessMsg('Quiz published successfully to enrolled students!');
      setTimeout(() => {
        onQuizCreated(publishedItem);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to publish quiz.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setDraft(null);
    setDraftQuestions([]);
    setSelectedFile(null);
    setSampleDocName('');
    setErrorMsg('');
    setSaveSuccessMsg('');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-md overflow-hidden transition-all">
      {/* Card Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                AI Quiz Generator
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-medium border border-white/25">
                multipart/form-data
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/25 text-emerald-100 font-medium border border-emerald-400/30">
                assignment-service
              </span>
            </div>
            <p className="text-xs text-indigo-100/90 mt-0.5">
              Upload course documents to formulate structured multiple-choice questions with 4–5
              distractors and pedagogical rationales.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors self-start sm:self-center"
            title="Close AI Generator"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 font-medium">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg('')}
              className="text-rose-400 hover:text-rose-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD & GENERATION CONFIGURATION FORM (Shown if draft not yet generated) */}
        {!draft ? (
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Document Upload & Sample Selector */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Source Course Document</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      PDF, DOCX, TXT, PPTX (Max 25MB)
                    </span>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : selectedFile
                          ? 'border-emerald-400 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.txt,.pptx,.ppt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {selectedFile.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {(selectedFile.size / 1024).toFixed(1)} KB · Ready for AI analysis
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setSampleDocName('');
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          Click to browse or drag and drop course documents here
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Multipart upload processed by Mentify assignment-service
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pre-populated Sample Document Selector for Instant Prototyping */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Or pick verified course material:
                    </span>
                    <span className="text-[10px] text-indigo-600 font-medium">1-Click Test</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        name: 'CS-201: AVL Trees & Rotations Syllabus.pdf',
                        prompt: 'Focus on balance factor invariants and double rotations',
                      },
                      {
                        name: 'CS-350: Keycloak JWT & OAuth2 Spec.pdf',
                        prompt: 'Focus on claims validation, 401 vs 403, and token lifetime',
                      },
                      {
                        name: 'CS-420: Backprop & Matrix Calculus.pdf',
                        prompt: 'Focus on gradient checks and Adam momentum equations',
                      },
                    ].map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => handleSelectSample(sample.name, sample.prompt)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all text-left truncate max-w-full ${
                          sampleDocName === sample.name
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border-slate-200'
                        }`}
                      >
                        📄 {sample.name.split(':')[1]?.trim() || sample.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Focus Prompt */}
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Target Focus Area / Prompt (Optional)</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">
                      userPrompt parameter
                    </span>
                  </label>
                  <textarea
                    rows={2}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="e.g. Generate questions focusing on time complexity, edge cases, and rotation invariants..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-800"
                  />
                </div>
              </div>

              {/* Right Column: Parameters (Course, Count, Difficulty, QuestionType) */}
              <div className="md:col-span-5 space-y-4">
                {/* Target Course */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Target Course (courseId)
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Number of Questions (1-20 per backend spec) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Question Count: <span className="text-indigo-600">{questionCount}</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">1 – 20 max</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[3, 5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setQuestionCount(num)}
                        className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                          questionCount === num
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Selector (EASY, MEDIUM, HARD) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Difficulty Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'EASY', label: 'Easy', desc: 'Recall & Defs' },
                      { id: 'MEDIUM', label: 'Medium', desc: 'Application' },
                      { id: 'HARD', label: 'Hard', desc: 'Proofs & Bounds' },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id as QuizGenerationDifficulty)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          difficulty === d.id
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-1 ring-indigo-600 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{d.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Type (Enforced MULTIPLE_CHOICE_SINGLE_ANSWER) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Question Format:</span>
                    <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      MULTIPLE_CHOICE_SINGLE_ANSWER
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Per backend contract: Exactly 4 to 5 options per question with 1 verified correct
                    answer and distractor explanations.
                  </p>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating || !selectedFile}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Generating Quiz Draft ({generationProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate Quiz Draft with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Processing Progress Bar */}
            {isGenerating && (
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    {generationStep}
                  </span>
                  <span className="font-mono">{generationProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-indigo-200 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        ) : (
          /* STEP 2: DRAFT GENERATED CONFIRMATION & SLIDER MODAL LAUNCHER */
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 border border-indigo-100 space-y-5 animate-in fade-in zoom-in-98 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 border border-indigo-400/30">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-bold border border-violet-200 uppercase">
                      {draft.provider}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                      {courses.find((c) => c.id === selectedCourseId)?.code || 'CS-201'}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {draft.difficulty} Difficulty
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                      {draftQuestions.length} Questions · {totalDraftMarks} Marks
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {draftTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Synthesized from "{selectedFile?.name || sampleDocName}". Review questions and options in the high-level Card Slider above the page.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSliderOpen(true)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-500 hover:to-indigo-600 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Open Question Card Slider ({draftQuestions.length})</span>
                </button>
              </div>
            </div>

            {/* Quick overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Questions</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{draftQuestions.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Marks</span>
                <p className="text-lg font-bold font-mono text-indigo-600 mt-0.5">{totalDraftMarks} pts</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Time Limit</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{draftDuration} mins</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pass Mark</span>
                <p className="text-lg font-bold font-mono text-emerald-600 mt-0.5">{draftPassMark} pts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* CARD SLIDER MODAL OVERLAY (Above the page with background blur) */}
      {isSliderOpen && draft && (
        <AiQuizCardSliderModal
          draft={draft}
          initialTitle={draftTitle}
          initialDescription={draftDescription}
          initialDuration={draftDuration}
          initialPassMark={draftPassMark}
          course={courses.find((c) => c.id === selectedCourseId)}
          sourceFileName={selectedFile?.name || sampleDocName}
          onClose={() => setIsSliderOpen(false)}
          onSaveDraft={(savedQuiz) => {
            setIsSliderOpen(false);
            onQuizCreated(savedQuiz);
            handleReset();
          }}
          onPublish={(publishedQuiz) => {
            setIsSliderOpen(false);
            onQuizCreated(publishedQuiz);
            handleReset();
          }}
          onRegenerate={() => {
            setIsSliderOpen(false);
            handleReset();
          }}
        />
      )}
    </>
  );
};
