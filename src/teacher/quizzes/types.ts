/**
 * Quiz Types based directly on Mentify Backend
 * Service: assignment-service (package com.mentify.quiz)
 * Source repository: https://github.com/SENG-34213/Mentify-backend
 */

export type QuestionType = 'MULTIPLE_CHOICE_SINGLE_ANSWER';

export type QuizCreationMethod = 'MANUAL' | 'AI_GENERATED';

export type QuizGenerationDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface QuestionOptionRequest {
  id?: string;
  optionText: string;
  correct: boolean;
  optionOrder: number;
}

export interface CreateQuestionRequest {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  questionOrder: number;
  options: QuestionOptionRequest[]; // min 4, max 5, exactly 1 correct
  explanation?: string;
}

export interface CreateQuizRequest {
  courseId: string; // UUID
  title: string; // max 150 chars
  description?: string;
  durationMinutes: number; // min 1
  passMark: number; // DecimalMin 0.00
  startTime?: string; // LocalDateTime ISO
  endTime?: string; // LocalDateTime ISO
  maxAttempts: number; // min 1
  showResultImmediately?: boolean;
  creationMethod?: QuizCreationMethod;
}

export interface UpdateQuizRequest {
  title: string;
  description?: string;
  durationMinutes: number;
  passMark: number;
  startTime?: string;
  endTime?: string;
  maxAttempts: number;
  showResultImmediately?: boolean;
}

export interface AiQuizGenerateFormData {
  file: File;
  courseId: string;
  questionCount: number; // 1 to 20
  difficulty: QuizGenerationDifficulty;
  questionType: QuestionType;
  userPrompt?: string;
}

export interface AiQuizDraftResponse {
  courseId: string;
  questionCount: number;
  difficulty: QuizGenerationDifficulty;
  questionType: QuestionType;
  creationMethod: QuizCreationMethod;
  questions: CreateQuestionRequest[];
  provider: string;
  model: string;
  generatedAt: string;
  saved: boolean;
  published: boolean;
}

export interface TeacherOptionResponse {
  id: string;
  optionText: string;
  correct: boolean;
  optionOrder: number;
}

export interface TeacherQuestionResponse {
  id: string;
  questionText: string;
  questionType: QuestionType;
  marks: number;
  questionOrder: number;
  options: TeacherOptionResponse[];
  explanation?: string;
}

export interface BackendQuizItem {
  id: string;
  courseId: string;
  courseCode: string;
  teacherId?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passMark: number;
  startTime?: string;
  endTime?: string;
  maxAttempts: number;
  status: QuizStatus;
  creationMethod: QuizCreationMethod;
  showResultImmediately: boolean;
  questions: TeacherQuestionResponse[];
  totalQuestions: number;
  attemptsCount: number;
  averageScorePercent: number;
  createdAt: string;
  updatedAt: string;
}
