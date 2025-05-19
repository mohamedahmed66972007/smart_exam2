import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertExamSchema, 
  insertQuestionSchema, 
  insertSubmissionSchema, 
  insertAnswerSchema,
  insertReviewRequestSchema
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = `${Date.now()}-${nanoid(6)}`;
      cb(null, `${uniquePrefix}-${file.originalname}`);
    },
  }),
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();
  app.use('/api', apiRouter);
  
  // Create upload directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));
  
  // Auth Routes
  apiRouter.post('/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data', error: error.message });
    }
  });
  
  apiRouter.post('/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // User Route - Get current user
  apiRouter.get('/user', authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Exam Routes
  apiRouter.post('/exams', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examData = insertExamSchema.parse(req.body);
      const exam = await storage.createExam({
        ...examData,
        creatorId: req.user.id
      });
      
      res.status(201).json(exam);
    } catch (error) {
      res.status(400).json({ message: 'Invalid exam data', error: error.message });
    }
  });
  
  apiRouter.get('/exams', authenticateToken, async (req: Request, res: Response) => {
    try {
      const exams = await storage.getExamsByCreator(req.user.id);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.get('/exams/:id', async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.get('/exams/code/:code', async (req: Request, res: Response) => {
    try {
      const code = req.params.code;
      const exam = await storage.getExamByCode(code);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.put('/exams/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this exam' });
      }
      
      const updatedExam = await storage.updateExam(examId, req.body);
      res.json(updatedExam);
    } catch (error) {
      res.status(400).json({ message: 'Invalid exam data', error: error.message });
    }
  });
  
  apiRouter.delete('/exams/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this exam' });
      }
      
      await storage.deleteExam(examId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Exam attachment upload
  apiRouter.post('/exams/:id/attachment', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const examId = parseInt(req.params.id);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this exam' });
      }
      
      const filePath = `/uploads/${req.file.filename}`;
      const updatedExam = await storage.updateExam(examId, { attachment: filePath });
      
      res.json({ file: filePath, exam: updatedExam });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Question Routes
  apiRouter.post('/exams/:examId/questions', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to add questions to this exam' });
      }
      
      const questionData = insertQuestionSchema.parse({
        ...req.body,
        examId
      });
      
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ message: 'Invalid question data', error: error.message });
    }
  });
  
  apiRouter.get('/exams/:examId/questions', async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const questions = await storage.getQuestionsByExam(examId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.put('/questions/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      const question = await storage.updateQuestion(questionId, req.body);
      
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      res.json(question);
    } catch (error) {
      res.status(400).json({ message: 'Invalid question data', error: error.message });
    }
  });
  
  apiRouter.delete('/questions/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const questionId = parseInt(req.params.id);
      await storage.deleteQuestion(questionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Submission Routes
  apiRouter.post('/exams/:examId/submissions', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const userId = req.user.id;
      
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      const submissionData = insertSubmissionSchema.parse({
        examId,
        userId
      });
      
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ message: 'Invalid submission data', error: error.message });
    }
  });
  
  apiRouter.get('/submissions/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      // Check if user is the creator or the one who submitted
      const exam = await storage.getExam(submission.examId);
      if (submission.userId !== req.user.id && exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this submission' });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.get('/exams/:examId/submissions', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.examId);
      const exam = await storage.getExam(examId);
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view these submissions' });
      }
      
      const submissions = await storage.getSubmissionsByExam(examId);
      
      // Get user details for each submission
      const submissionsWithUserDetails = await Promise.all(
        submissions.map(async (submission) => {
          const user = await storage.getUser(submission.userId);
          return {
            ...submission,
            user: user ? {
              id: user.id,
              username: user.username,
              name: user.name
            } : null
          };
        })
      );
      
      res.json(submissionsWithUserDetails);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.get('/user/submissions', authenticateToken, async (req: Request, res: Response) => {
    try {
      const submissions = await storage.getSubmissionsByUser(req.user.id);
      
      // Get exam details for each submission
      const submissionsWithExamDetails = await Promise.all(
        submissions.map(async (submission) => {
          const exam = await storage.getExam(submission.examId);
          return {
            ...submission,
            exam: exam || null
          };
        })
      );
      
      res.json(submissionsWithExamDetails);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.post('/submissions/:id/complete', authenticateToken, async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      if (submission.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to complete this submission' });
      }
      
      // Calculate score from answers
      const answers = await storage.getAnswersBySubmission(submissionId);
      const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
      
      const completedSubmission = await storage.completeSubmission(submissionId, totalScore);
      res.json(completedSubmission);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Answer Routes
  apiRouter.post('/submissions/:submissionId/answers', authenticateToken, async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.submissionId);
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      if (submission.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to add answers to this submission' });
      }
      
      const answerData = insertAnswerSchema.parse({
        ...req.body,
        submissionId
      });
      
      // Get the question to check correct answer
      const question = await storage.getQuestionById(answerData.questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      
      let isCorrect = false;
      let score = 0;
      let needsReview = false;
      
      // Automatic grading based on question type
      if (question.type === 'multipleChoice' || question.type === 'trueFalse') {
        // For objective questions, compare answers directly
        isCorrect = JSON.stringify(answerData.answer) === JSON.stringify(question.correctAnswers);
        score = isCorrect ? question.marks : 0;
      } else if (question.type === 'essay') {
        // Essay questions need manual review
        needsReview = true;
      }
      
      const answer = await storage.createAnswer({
        ...answerData,
        isCorrect,
        score,
        needsReview
      });
      
      res.status(201).json(answer);
    } catch (error) {
      res.status(400).json({ message: 'Invalid answer data', error: error.message });
    }
  });
  
  apiRouter.get('/submissions/:submissionId/answers', authenticateToken, async (req: Request, res: Response) => {
    try {
      const submissionId = parseInt(req.params.submissionId);
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      // Check if user is the creator or the one who submitted
      const exam = await storage.getExam(submission.examId);
      if (submission.userId !== req.user.id && exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view these answers' });
      }
      
      const answers = await storage.getAnswersBySubmission(submissionId);
      res.json(answers);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  apiRouter.post('/answers/:id/review-request', authenticateToken, async (req: Request, res: Response) => {
    try {
      const answerId = parseInt(req.params.id);
      const answer = await storage.getAnswerById(answerId);
      
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }
      
      const submission = await storage.getSubmission(answer.submissionId);
      if (submission.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to request review for this answer' });
      }
      
      const reviewRequestData = insertReviewRequestSchema.parse({
        ...req.body,
        answerId,
        userId: req.user.id
      });
      
      // Mark answer for review
      await storage.requestReview(answerId);
      
      // Create review request
      const reviewRequest = await storage.createReviewRequest(reviewRequestData);
      res.status(201).json(reviewRequest);
    } catch (error) {
      res.status(400).json({ message: 'Invalid review request data', error: error.message });
    }
  });
  
  apiRouter.post('/answers/:id/review', authenticateToken, async (req: Request, res: Response) => {
    try {
      const answerId = parseInt(req.params.id);
      const { score, comment } = req.body;
      
      if (score === undefined || comment === undefined) {
        return res.status(400).json({ message: 'Score and comment are required' });
      }
      
      const answer = await storage.getAnswerById(answerId);
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }
      
      // Check if user is the exam creator
      const submission = await storage.getSubmission(answer.submissionId);
      const exam = await storage.getExam(submission.examId);
      
      if (exam.creatorId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to review this answer' });
      }
      
      const reviewedAnswer = await storage.reviewAnswer(answerId, score, comment);
      
      // Resolve any pending review requests
      const reviewRequests = await storage.getReviewRequestsByAnswer(answerId);
      for (const request of reviewRequests) {
        if (request.status === 'pending') {
          await storage.resolveReviewRequest(request.id, 'resolved', req.user.id);
        }
      }
      
      res.json(reviewedAnswer);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Export Routes
  apiRouter.get('/exams/:id/export', authenticateToken, async (req: Request, res: Response) => {
    try {
      const examId = parseInt(req.params.id);
      const format = req.query.format as string;
      
      if (!format || (format !== 'pdf' && format !== 'docx')) {
        return res.status(400).json({ message: 'Invalid format. Use "pdf" or "docx"' });
      }
      
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      const questions = await storage.getQuestionsByExam(examId);
      
      if (format === 'pdf') {
        // Generate PDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Set right-to-left for Arabic
        doc.setR2L(true);
        
        // Add title
        doc.setFontSize(24);
        doc.text(exam.title, 105, 20, { align: 'center' });
        
        // Add subject
        doc.setFontSize(16);
        doc.text(`المادة: ${exam.subject}`, 105, 30, { align: 'center' });
        
        // Add instructions if available
        if (exam.instructions) {
          doc.setFontSize(12);
          doc.text('تعليمات:', 190, 45, { align: 'right' });
          doc.text(exam.instructions, 190, 55, { align: 'right' });
        }
        
        // Add questions
        let y = 80;
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          
          // Check if we need a new page
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFontSize(14);
          doc.text(`السؤال ${i + 1} (${q.marks} درجة):`, 190, y, { align: 'right' });
          y += 10;
          
          doc.setFontSize(12);
          doc.text(q.text, 190, y, { align: 'right' });
          y += 15;
          
          // Add options for multiple choice questions
          if (q.type === 'multipleChoice' && q.options) {
            const options = q.options as string[];
            for (let j = 0; j < options.length; j++) {
              doc.text(`${String.fromCharCode(97 + j)}) ${options[j]}`, 180, y, { align: 'right' });
              y += 10;
            }
            y += 5;
          } else if (q.type === 'trueFalse') {
            doc.text('صح (   )     خطأ (   )', 180, y, { align: 'right' });
            y += 15;
          } else if (q.type === 'essay') {
            // Add space for essay answer
            doc.text('الإجابة:', 190, y, { align: 'right' });
            y += 40; // Space for answer
          }
        }
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${exam.title.replace(/\s+/g, '_')}.pdf`);
        
        // Send the PDF as buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return res.send(pdfBuffer);
      } else if (format === 'docx') {
        // Generate DOCX
        const doc = new Document({
          sections: [
            {
              properties: { 
                page: { 
                  size: { width: 12240, height: 15840 } // Letter size in twips
                } 
              },
              children: [
                new Paragraph({
                  text: exam.title,
                  heading: HeadingLevel.HEADING_1,
                  alignment: 'center',
                  bidirectional: true,
                }),
                new Paragraph({
                  text: `المادة: ${exam.subject}`,
                  alignment: 'center',
                  bidirectional: true,
                }),
                new Paragraph({ text: "" }),
                // Instructions
                ...(exam.instructions ? [
                  new Paragraph({
                    text: 'تعليمات:',
                    alignment: 'right',
                    bidirectional: true,
                  }),
                  new Paragraph({
                    text: exam.instructions,
                    alignment: 'right',
                    bidirectional: true,
                  }),
                  new Paragraph({ text: "" }),
                ] : []),
                // Questions
                ...questions.flatMap((q, i) => {
                  const questionParagraphs = [
                    new Paragraph({
                      text: `السؤال ${i + 1} (${q.marks} درجة):`,
                      alignment: 'right',
                      bidirectional: true,
                      spacing: { before: 300 },
                    }),
                    new Paragraph({
                      text: q.text,
                      alignment: 'right',
                      bidirectional: true,
                    })
                  ];
                  
                  if (q.type === 'multipleChoice' && q.options) {
                    const options = q.options as string[];
                    options.forEach((option, j) => {
                      questionParagraphs.push(
                        new Paragraph({
                          text: `${String.fromCharCode(97 + j)}) ${option}`,
                          alignment: 'right',
                          bidirectional: true,
                          indent: { start: 720 }, // 0.5 inch indent
                        })
                      );
                    });
                  } else if (q.type === 'trueFalse') {
                    questionParagraphs.push(
                      new Paragraph({
                        text: 'صح (   )     خطأ (   )',
                        alignment: 'right',
                        bidirectional: true,
                      })
                    );
                  } else if (q.type === 'essay') {
                    questionParagraphs.push(
                      new Paragraph({
                        text: 'الإجابة:',
                        alignment: 'right',
                        bidirectional: true,
                      }),
                      new Paragraph({
                        text: '_'.repeat(70),
                        alignment: 'right',
                      }),
                      new Paragraph({
                        text: '_'.repeat(70),
                        alignment: 'right',
                      }),
                      new Paragraph({
                        text: '_'.repeat(70),
                        alignment: 'right',
                      })
                    );
                  }
                  
                  return questionParagraphs;
                })
              ]
            }
          ]
        });
        
        // Generate buffer
        const buffer = await Packer.toBuffer(doc);
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=${exam.title.replace(/\s+/g, '_')}.docx`);
        
        return res.send(buffer);
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
