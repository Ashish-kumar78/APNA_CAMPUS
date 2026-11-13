/**
 * BPUT Autonomous College Management ERP — Student Online Quizzes Store
 * Provides robust offline-first fallback and persistence for online examination assessments.
 */

const STORAGE_SUBMISSIONS_KEY = 'bput_student_quiz_submissions_v1';

export const DEFAULT_STUDENT_QUIZZES = [
  {
    id: 'quiz-cs501-01',
    title: 'Data Structures & Algorithms — Quiz 1 (Trees & Graphs)',
    subject: 'Data Structures & Algorithms',
    code: 'CS501',
    subjectCode: 'CS501',
    section: 'Section A',
    semester: 'Semester 5',
    deadline: '15 Nov 2026, 11:59 PM',
    duration: 30,
    maxMarks: 10,
    attempts: 1,
    status: 'available',
    score: null,
    submittedAt: null,
    questions: [
      {
        id: '1',
        question: 'What is the worst-case time complexity of searching in an AVL Tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct: 1,
      },
      {
        id: '2',
        question: 'Which graph traversal algorithm primarily uses a FIFO Queue data structure?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Topological Sort', "Dijkstra's Algorithm"],
        correct: 1,
      },
      {
        id: '3',
        question: 'In a Min-Heap with N elements, the root node always contains:',
        options: ['The largest element', 'The smallest element', 'The median element', 'The last inserted element'],
        correct: 1,
      },
      {
        id: '4',
        question: 'Which of the following collision resolution techniques is an Open Addressing method in Hashing?',
        options: ['Separate Chaining', 'Linear Probing', 'Red-Black Balancing', 'Splay Operation'],
        correct: 1,
      },
      {
        id: '5',
        question: 'What is the minimum number of edges in a connected undirected graph with V vertices?',
        options: ['V', 'V - 1', 'V + 1', 'V * (V - 1) / 2'],
        correct: 1,
      },
    ],
  },
  {
    id: 'quiz-cs502-01',
    title: 'Operating Systems — Quiz 1 (Process Scheduling & Deadlocks)',
    subject: 'Operating Systems',
    code: 'CS502',
    subjectCode: 'CS502',
    section: 'Section A',
    semester: 'Semester 5',
    deadline: '18 Nov 2026, 11:59 PM',
    duration: 30,
    maxMarks: 10,
    attempts: 1,
    status: 'available',
    score: null,
    submittedAt: null,
    questions: [
      {
        id: '1',
        question: 'Which CPU scheduling algorithm gives minimum average waiting time for a given set of processes?',
        options: ['First-Come, First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin', 'Multilevel Queue'],
        correct: 1,
      },
      {
        id: '2',
        question: 'Which of the following is NOT one of Coffman’s four necessary conditions for Deadlock?',
        options: ['Mutual Exclusion', 'Preemption Allowed', 'Hold and Wait', 'Circular Wait'],
        correct: 1,
      },
      {
        id: '3',
        question: 'Banker’s algorithm is used in operating systems for:',
        options: ['Deadlock Prevention', 'Deadlock Avoidance', 'Deadlock Detection', 'Deadlock Recovery'],
        correct: 1,
      },
      {
        id: '4',
        question: 'Belady’s anomaly can occur in which page replacement algorithm?',
        options: ['Least Recently Used (LRU)', 'First-In, First-Out (FIFO)', 'Optimal Page Replacement', 'Least Frequently Used (LFU)'],
        correct: 1,
      },
      {
        id: '5',
        question: 'The Translation Lookaside Buffer (TLB) is primarily used to:',
        options: ['Cache page table entries for fast address translation', 'Buffer dirty disk blocks', 'Manage process thread contexts', 'Queue network socket packets'],
        correct: 0,
      },
    ],
  },
  {
    id: 'quiz-cs503-01',
    title: 'Computer Networks — Quiz 1 (OSI Layers & TCP/IP Protocols)',
    subject: 'Computer Networks',
    code: 'CS503',
    subjectCode: 'CS503',
    section: 'Section A',
    semester: 'Semester 5',
    deadline: '22 Nov 2026, 11:59 PM',
    duration: 30,
    maxMarks: 10,
    attempts: 1,
    status: 'available',
    score: null,
    submittedAt: null,
    questions: [
      {
        id: '1',
        question: 'Which OSI layer is responsible for end-to-end reliable data delivery, flow control, and error recovery?',
        options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'],
        correct: 1,
      },
      {
        id: '2',
        question: 'What is the default subnet mask for a standard Class C IPv4 address network?',
        options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'],
        correct: 2,
      },
      {
        id: '3',
        question: 'Which protocol is used to map a known IP address to a hardware MAC address on a local area network?',
        options: ['DNS', 'DHCP', 'ARP (Address Resolution Protocol)', 'ICMP'],
        correct: 2,
      },
      {
        id: '4',
        question: 'Which of the following characteristics accurately describes UDP (User Datagram Protocol)?',
        options: ['Connection-oriented with acknowledgment', 'Guarantees in-order packet delivery', 'Connectionless, lightweight, and low-latency', 'Performs three-way handshake'],
        correct: 2,
      },
      {
        id: '5',
        question: 'What is the standard port number utilized for HTTPS secure web communication?',
        options: ['80', '8080', '443', '22'],
        correct: 2,
      },
    ],
  },
];

function getStoredSubmissions() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[studentQuizStore] Failed reading submissions:', err);
    return {};
  }
}

function saveStoredSubmissions(submissions) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.warn('[studentQuizStore] Failed saving submissions:', err);
  }
}

/**
 * Returns all available student quizzes with completed status merged from localStorage
 */
export function getOfflineStudentQuizzes() {
  const submissions = getStoredSubmissions();
  return DEFAULT_STUDENT_QUIZZES.map((quiz) => {
    const sub = submissions[quiz.id];
    if (sub) {
      return {
        ...quiz,
        status: 'completed',
        score: sub.score,
        submittedAt: sub.submittedAt,
        answerReview: sub.answerReview,
      };
    }
    return { ...quiz };
  });
}

/**
 * Evaluates a quiz submission locally and persists result
 */
export function submitOfflineStudentQuiz(quizId, answers = {}) {
  const quiz = DEFAULT_STUDENT_QUIZZES.find((q) => q.id === quizId) || DEFAULT_STUDENT_QUIZZES[0];
  const questions = quiz.questions || [];
  let correctCount = 0;

  const answerReview = questions.map((q) => {
    const selected = answers[q.id];
    const isCorrect = Number(selected) === Number(q.correct);
    if (isCorrect) correctCount++;
    return {
      questionId: String(q.id),
      question: q.question,
      options: q.options,
      selectedOption: selected !== undefined ? Number(selected) : -1,
      correctOption: q.correct,
      correct: isCorrect,
    };
  });

  const maxMarks = quiz.maxMarks || 10;
  const marksPerQuestion = maxMarks / (questions.length || 1);
  const score = Math.round(correctCount * marksPerQuestion);
  const percentage = Math.round((score / maxMarks) * 100);
  const submittedAt = new Date().toISOString();

  const submissionResult = {
    quizId,
    score,
    maxMarks,
    percentage,
    answerReview,
    submittedAt,
  };

  const submissions = getStoredSubmissions();
  submissions[quizId] = submissionResult;
  saveStoredSubmissions(submissions);

  return {
    success: true,
    message: 'Quiz submitted and marks recorded successfully.',
    data: {
      score,
      maxMarks,
      percentage,
      answerReview,
      submittedAt,
    },
  };
}

