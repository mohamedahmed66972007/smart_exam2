import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Question types enum
export const questionTypes = {
  ESSAY: "essay",
  MULTIPLE_CHOICE: "multipleChoice",
  TRUE_FALSE: "trueFalse",
} as const;

// Exams model
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  duration: integer("duration").notNull(), // in minutes
  creatorId: integer("creator_id").notNull().references(() => users.id),
  attachment: text("attachment"), // file URL/path
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  code: true,
  createdAt: true,
});

// Questions model
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => exams.id),
  type: text("type").notNull(), // "essay", "multipleChoice", "trueFalse"
  text: text("text").notNull(),
  options: json("options"), // For multiple choice: array of options
  correctAnswers: json("correct_answers"), // Array of correct answers (for essay could be multiple)
  marks: integer("marks").notNull().default(1),
  order: integer("order").notNull(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

// Submissions model
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => exams.id),
  userId: integer("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  score: integer("score"),
  completed: boolean("completed").default(false),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  score: true,
  endTime: true,
  completed: true,
});

// Answers model
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  answer: json("answer").notNull(), // Could be string or array depending on question type
  isCorrect: boolean("is_correct"),
  score: integer("score"),
  needsReview: boolean("needs_review").default(false),
  reviewComment: text("review_comment"),
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  isCorrect: true,
  score: true,
  needsReview: true,
  reviewComment: true,
});

// Review Requests model
export const reviewRequests = pgTable("review_requests", {
  id: serial("id").primaryKey(),
  answerId: integer("answer_id").notNull().references(() => answers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by").references(() => users.id),
});

export const insertReviewRequestSchema = createInsertSchema(reviewRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  resolvedAt: true,
  resolvedBy: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type ReviewRequest = typeof reviewRequests.$inferSelect;
export type InsertReviewRequest = z.infer<typeof insertReviewRequestSchema>;
