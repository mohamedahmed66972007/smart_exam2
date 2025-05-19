import {
  users, User, InsertUser,
  exams, Exam, InsertExam,
  questions, Question, InsertQuestion,
  submissions, Submission, InsertSubmission,
  answers, Answer, InsertAnswer,
  reviewRequests, ReviewRequest, InsertReviewRequest
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exam operations
  createExam(exam: InsertExam): Promise<Exam>;
  getExam(id: number): Promise<Exam | undefined>;
  getExamByCode(code: string): Promise<Exam | undefined>;
  getExamsByCreator(creatorId: number): Promise<Exam[]>;
  updateExam(id: number, exam: Partial<Exam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<boolean>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByExam(examId: number): Promise<Question[]>;
  updateQuestion(id: number, question: Partial<Question>): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
  
  // Submission operations
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: number): Promise<Submission | undefined>;
  getSubmissionsByExam(examId: number): Promise<Submission[]>;
  getSubmissionsByUser(userId: number): Promise<Submission[]>;
  completeSubmission(id: number, score: number): Promise<Submission | undefined>;
  
  // Answer operations
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswersBySubmission(submissionId: number): Promise<Answer[]>;
  gradeAnswer(id: number, isCorrect: boolean, score: number): Promise<Answer | undefined>;
  requestReview(id: number): Promise<Answer | undefined>;
  reviewAnswer(id: number, score: number, comment: string): Promise<Answer | undefined>;
  
  // Review request operations
  createReviewRequest(request: InsertReviewRequest): Promise<ReviewRequest>;
  getReviewRequestsByAnswer(answerId: number): Promise<ReviewRequest[]>;
  resolveReviewRequest(id: number, status: string, resolverId: number): Promise<ReviewRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exams: Map<number, Exam>;
  private questions: Map<number, Question>;
  private submissions: Map<number, Submission>;
  private answers: Map<number, Answer>;
  private reviewRequests: Map<number, ReviewRequest>;
  
  private currentUserId: number;
  private currentExamId: number;
  private currentQuestionId: number;
  private currentSubmissionId: number;
  private currentAnswerId: number;
  private currentReviewRequestId: number;

  constructor() {
    this.users = new Map();
    this.exams = new Map();
    this.questions = new Map();
    this.submissions = new Map();
    this.answers = new Map();
    this.reviewRequests = new Map();
    
    this.currentUserId = 1;
    this.currentExamId = 1;
    this.currentQuestionId = 1;
    this.currentSubmissionId = 1;
    this.currentAnswerId = 1;
    this.currentReviewRequestId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Exam methods
  async createExam(insertExam: InsertExam): Promise<Exam> {
    const id = this.currentExamId++;
    const code = nanoid(8); // Create a unique code for the exam
    const now = new Date();
    const exam: Exam = { ...insertExam, id, code, createdAt: now };
    this.exams.set(id, exam);
    return exam;
  }

  async getExam(id: number): Promise<Exam | undefined> {
    return this.exams.get(id);
  }

  async getExamByCode(code: string): Promise<Exam | undefined> {
    return Array.from(this.exams.values()).find(
      (exam) => exam.code === code
    );
  }

  async getExamsByCreator(creatorId: number): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(
      (exam) => exam.creatorId === creatorId
    );
  }

  async updateExam(id: number, examUpdate: Partial<Exam>): Promise<Exam | undefined> {
    const exam = this.exams.get(id);
    if (!exam) return undefined;
    
    const updatedExam = { ...exam, ...examUpdate };
    this.exams.set(id, updatedExam);
    return updatedExam;
  }

  async deleteExam(id: number): Promise<boolean> {
    return this.exams.delete(id);
  }

  // Question methods
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }

  async getQuestionsByExam(examId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter((question) => question.examId === examId)
      .sort((a, b) => a.order - b.order); // Sort by order
  }

  async updateQuestion(id: number, questionUpdate: Partial<Question>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...questionUpdate };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }

  // Submission methods
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const startTime = new Date();
    const submission: Submission = {
      ...insertSubmission,
      id,
      startTime,
      completed: false,
    };
    this.submissions.set(id, submission);
    return submission;
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getSubmissionsByExam(examId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      (submission) => submission.examId === examId
    );
  }

  async getSubmissionsByUser(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      (submission) => submission.userId === userId
    );
  }

  async completeSubmission(id: number, score: number): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = {
      ...submission,
      endTime: new Date(),
      score,
      completed: true,
    };
    this.submissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Answer methods
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = this.currentAnswerId++;
    const answer: Answer = {
      ...insertAnswer,
      id,
      isCorrect: false,
      score: 0,
      needsReview: false,
    };
    this.answers.set(id, answer);
    return answer;
  }

  async getAnswersBySubmission(submissionId: number): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (answer) => answer.submissionId === submissionId
    );
  }

  async gradeAnswer(id: number, isCorrect: boolean, score: number): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer = {
      ...answer,
      isCorrect,
      score,
      needsReview: false,
    };
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }

  async requestReview(id: number): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer = {
      ...answer,
      needsReview: true,
    };
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }

  async reviewAnswer(id: number, score: number, comment: string): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer = {
      ...answer,
      score,
      needsReview: false,
      reviewComment: comment,
    };
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }

  // Review request methods
  async createReviewRequest(insertReviewRequest: InsertReviewRequest): Promise<ReviewRequest> {
    const id = this.currentReviewRequestId++;
    const now = new Date();
    const reviewRequest: ReviewRequest = {
      ...insertReviewRequest,
      id,
      status: "pending",
      createdAt: now,
    };
    this.reviewRequests.set(id, reviewRequest);
    return reviewRequest;
  }

  async getReviewRequestsByAnswer(answerId: number): Promise<ReviewRequest[]> {
    return Array.from(this.reviewRequests.values()).filter(
      (request) => request.answerId === answerId
    );
  }

  async resolveReviewRequest(id: number, status: string, resolverId: number): Promise<ReviewRequest | undefined> {
    const request = this.reviewRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = {
      ...request,
      status,
      resolvedAt: new Date(),
      resolvedBy: resolverId,
    };
    this.reviewRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
