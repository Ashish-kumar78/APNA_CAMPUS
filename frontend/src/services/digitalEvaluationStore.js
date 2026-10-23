
// ── Exam Marking Scheme Configuration ──
export const EVALUATION_SCHEME = {
  totalQuestions: 30,
  requiredAttempts: 21,
  totalMarks: 100,
  sections: [
    {
      id: 'sec1',
      title: 'Section 1: Short Answer Questions (Compulsory)',
      description: 'Answer all 10 questions. Each question carries 2 marks.',
      questionsAvailable: 10,
      requiredAttempts: 10,
      marksPerQuestion: 2,
      maxMarks: 20,
      isCompulsory: true,
      questions: Array.from({ length: 10 }, (_, i) => ({
        id: `q1_${i + 1}`,
        label: `Q1.${i + 1}`,
        num: i + 1,
        maxMarks: 2,
        desc: [
          'Define Time Complexity and Big-O notation.',
          'Differentiate between mutable and immutable data types in Python.',
          'What is the purpose of an index in relational databases (B-Tree)?',
          'Explain the principle of Locality of Reference in cache memory.',
          'What is a pure virtual function and abstract class in OOP?',
          'Define Deadlock and list the four Coffman conditions.',
          'What is Shannon Channel Capacity theorem in communication?',
          'State Amdahl\'s Law of parallel speedup.',
          'Explain the concept of Generator functions and yield in Python.',
          'What is 3NF (Third Normal Form) in Database Normalization?'
        ][i]
      }))
    },
    {
      id: 'sec2',
      title: 'Section 2: Medium Analytical & Problem Solving Questions',
      description: 'Answer any 5 out of 8 questions. Each question carries 6 marks.',
      questionsAvailable: 8,
      requiredAttempts: 5,
      marksPerQuestion: 6,
      maxMarks: 30,
      isCompulsory: false,
      questions: Array.from({ length: 8 }, (_, i) => ({
        id: `q2_${i + 1}`,
        label: `Q2.${i + 1}`,
        num: i + 1,
        maxMarks: 6,
        desc: [
          'Design an algorithm for QuickSort and derive its average-case recurrence.',
          'Explain Python Decorators with an authentic practical code example.',
          'Describe ACID properties and 2-Phase Locking (2PL) Protocol in DBMS.',
          'Compare RISC vs CISC architectural pipelining hazards.',
          'Solve Banker\'s Algorithm for Deadlock Avoidance given resource matrices.',
          'Explain Bellman-Ford shortest path algorithm for graphs with negative edges.',
          'Construct a Red-Black Tree insertion step-by-step for key sequences.',
          'Explain Python GIL (Global Interpreter Lock) and multiprocessing alternatives.'
        ][i]
      }))
    },
    {
      id: 'sec3',
      title: 'Section 3: Long Comprehensive & Algorithmic Design Questions',
      description: 'Answer any 5 out of 8 questions. Each question carries 8 marks.',
      questionsAvailable: 8,
      requiredAttempts: 5,
      marksPerQuestion: 8,
      maxMarks: 40,
      isCompulsory: false,
      questions: Array.from({ length: 8 }, (_, i) => ({
        id: `q3_${i + 1}`,
        label: `Q3.${i + 1}`,
        num: i + 1,
        maxMarks: 8,
        desc: [
          'Implement a thread-safe LRU Cache in Python using Doubly Linked List & Hash Map.',
          'Explain A* Search heuristic admissibility and solve the 8-puzzle problem.',
          'Design a distributed relational database schema for an ERP Campus with partition keys.',
          'Derive Dijkstra algorithm and analyze time complexity with Min-Heap vs Fibonacci Heap.',
          'Explain Virtual Memory management, Page Fault handling, and LRU Page Replacement.',
          'Design Convolutional Neural Network (CNN) architecture with feature maps & pooling.',
          'Explain Byzantine Generals Problem and Paxos consensus in distributed systems.',
          'Solve Dynamic Programming Matrix Chain Multiplication for sequence optimal parens.'
        ][i]
      }))
    },
    {
      id: 'sec4',
      title: 'Section 4: Advanced System Design & Engineering Case Study',
      description: 'Answer any 1 out of 4 case study questions. Each question carries 10 marks.',
      questionsAvailable: 4,
      requiredAttempts: 1,
      marksPerQuestion: 10,
      maxMarks: 10,
      isCompulsory: false,
      questions: Array.from({ length: 4 }, (_, i) => ({
        id: `q4_${i + 1}`,
        label: `Q4.${i + 1}`,
        num: i + 1,
        maxMarks: 10,
        desc: [
          'Architect an end-to-end Enterprise ERP Digital Answer Sheet Evaluation System with blind barcode anonymization, real-time rubric calculation, and HOD moderation gateway.',
          'Design a high-throughput Distributed Message Queue supporting at-least-once delivery, partition consumer groups, and write-ahead logs.',
          'Design an Autonomous Examination Proctoring system using WebRTC, OpenCV face landmark tracking, and audio anomaly classification.',
          'Architect a Low-Latency Real-Time Collaborative Canvas and Annotation engine with Operational Transformation (OT) / CRDT algorithms.'
        ][i]
      }))
    }
  ]
};
export function calculateEvaluationSummary(marks = {}) {
  const result = {
    sections: {},
    grandTotal: 0,
    maxPossibleMarks: 100,
    totalAttemptedQuestions: 0,
    totalCountedQuestions: 0,
    percentage: 0,
    grade: 'F',
    hasViolation: false,
    violationMessages: []
  };

  let cumulativeMarks = 0;
  let cumulativeAttempts = 0;

  EVALUATION_SCHEME.sections.forEach((section) => {
    const secId = section.id;
    const attemptedQuestions = [];

    section.questions.forEach((q) => {
      const val = marks[q.id];
      if (val !== undefined && val !== null && val !== '' && !isNaN(val)) {
        const score = Math.max(0, Math.min(Number(val), q.maxMarks));
        attemptedQuestions.push({
          id: q.id,
          label: q.label,
          num: q.num,
          score,
          maxMarks: q.maxMarks
        });
      }
    });

    const attemptCount = attemptedQuestions.length;
    cumulativeAttempts += attemptCount;

    // Rule: Sort attempts by score descending to pick the BEST N attempts!
    const sortedAttempts = [...attemptedQuestions].sort((a, b) => b.score - a.score);

    const countedAttempts = sortedAttempts.slice(0, section.requiredAttempts);
    const extraAttempts = sortedAttempts.slice(section.requiredAttempts);

    // Sum counted scores
    let sectionTotal = countedAttempts.reduce((sum, item) => sum + item.score, 0);

    // Cap strictly at section maxMarks
    sectionTotal = Math.min(sectionTotal, section.maxMarks);

    // Create a lookup for UI badging
    const countedIds = new Set(countedAttempts.map(a => a.id));
    const extraIds = new Set(extraAttempts.map(a => a.id));

    result.sections[secId] = {
      sectionId: secId,
      title: section.title,
      maxMarks: section.maxMarks,
      requiredAttempts: section.requiredAttempts,
      questionsAvailable: section.questionsAvailable,
      attemptCount,
      countedAttemptsCount: countedAttempts.length,
      extraAttemptsCount: extraAttempts.length,
      countedIds,
      extraIds,
      sectionTotal: parseFloat(sectionTotal.toFixed(2)),
      isCapped: extraAttempts.length > 0
    };

    cumulativeMarks += sectionTotal;
    result.totalCountedQuestions += countedAttempts.length;
  });

  result.totalAttemptedQuestions = cumulativeAttempts;
  result.grandTotal = parseFloat(cumulativeMarks.toFixed(2));
  result.percentage = parseFloat(((result.grandTotal / 100) * 100).toFixed(1));

  // Determine Letter Grade (BPUT Standard)
  if (result.percentage >= 90) result.grade = 'O (Outstanding)';
  else if (result.percentage >= 80) result.grade = 'E (Excellent)';
  else if (result.percentage >= 70) result.grade = 'A (Very Good)';
  else if (result.percentage >= 60) result.grade = 'B (Good)';
  else if (result.percentage >= 50) result.grade = 'C (Fair)';
  else if (result.percentage >= 40) result.grade = 'D (Pass)';
  else result.grade = 'F (Fail)';

  return result;
}
