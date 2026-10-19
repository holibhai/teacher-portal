import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles, Save, AlertCircle } from 'lucide-react';
import { QuizQuestion } from '../types';

interface QuestionBuilderModalProps {
  isOpen: boolean;
  quizId: string;
  onClose: () => void;
  onSaveQuestion: (question: QuizQuestion) => void;
}

export const QuestionBuilderModal: React.FC<QuestionBuilderModalProps> = ({
  isOpen,
  quizId,
  onClose,
  onSaveQuestion,
}) => {
  if (!isOpen) return null;

  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>([
    'O(1) Constant Time',
    'O(log n) Logarithmic Time',
    'O(n) Linear Time',
    'O(n²) Quadratic Time',
  ]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 5) {
      setErrorMsg('A question can contain at most 5 options per backend specification.');
      return;
    }
    setErrorMsg('');
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 4) {
      setErrorMsg('A question must contain at least 4 options per backend specification.');
      return;
    }
    setErrorMsg('');
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    if (correctOptionIdx >= updated.length) {
      setCorrectOptionIdx(0);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('Question prompt is required.');
      return;
    }

    if (options.length < 4 || options.length > 5) {
      setErrorMsg('A question must contain between 4 and 5 options.');
      return;
    }

    for (const opt of options) {
      if (!opt.trim()) {
        setErrorMsg('All option text fields must be filled.');
        return;
      }
    }

    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      quizId,
      type: 'multiple-choice',
      question: questionText.trim(),
      options: options,
      correctAnswer: options[correctOptionIdx] || options[0],
      explanation: explanation.trim(),
      marks: Number(marks) || 5,
    };

    onSaveQuestion(newQuestion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Quiz Question Builder</h3>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                CreateQuestionRequest
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Formulate question prompt with 4–5 answer options and 1 verified correct answer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Question Format
              </label>
              <div className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono font-bold text-indigo-700 flex items-center justify-between">
                <span>MULTIPLE_CHOICE_SINGLE_ANSWER</span>
                <span className="text-[10px] text-slate-400 font-sans font-normal">Backend Contract</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Point Value (Marks) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="50"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Question Prompt <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. What is the tight asymptotic bound for a binary search tree in the worst case without rebalancing?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Options Section: 4 to 5 options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Answer Options ({options.length}/5)
                </label>
                <span className="text-[10px] text-slate-400 block">
                  Select the radio button for the single correct answer
                </span>
              </div>
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Option (Max 5)</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs transition-colors ${
                    correctOptionIdx === idx
                      ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="correct-option"
                    checked={correctOptionIdx === idx}
                    onChange={() => setCorrectOptionIdx(idx)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                    placeholder={`Option ${idx + 1}`}
                    className={`flex-1 bg-transparent border-0 text-xs focus:outline-hidden font-medium ${
                      correctOptionIdx === idx ? 'text-emerald-950 font-bold' : 'text-slate-800'
                    }`}
                  />
                  {options.length > 4 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md"
                      title="Remove option (min 4)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Pedagogical Explanation / Rationale
            </label>
            <textarea
              rows={2}
              placeholder="Explain why the selected option is correct and address common misconceptions..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 resize-none text-slate-800"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
