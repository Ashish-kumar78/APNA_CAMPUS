import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Star,
  Trophy,
  X,
} from 'lucide-react'
import './OnlineExamPage.css'
import { api } from '../services/api.js'

export default function OnlineExamPage() {
  const [availableTests, setAvailableTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [view, setView] = useState('list') // list | instructions | exam | result
  const [selectedTest, setSelectedTest] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 min in seconds
  const [score, setScore] = useState(null)
  const [answerReview, setAnswerReview] = useState([])
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    api.getStudentQuizzes()
      .then((response) => {
        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error(response?.message || 'The assigned quiz list was invalid.')
        }
        if (active) {
          setAvailableTests(response.data)
          setLoadError('')
        }
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'Could not load assigned quizzes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (view !== 'exam' || timeLeft <= 0) return undefined
    const timerId = window.setTimeout(() => {
      setTimeLeft((remaining) => Math.max(0, remaining - 1))
    }, 1000)
    return () => window.clearTimeout(timerId)
  }, [view, timeLeft])

  function startExam(test) {
    setSelectedTest(test)
    setCurrentQuestion(0)
    setAnswers({})
    setTimeLeft(test.duration * 60)
    setSubmitError('')
    setView('instructions')
  }

  function beginExam() {
    setView('exam')
  }

  function selectAnswer(qId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }))
  }

  async function submitExam() {
    if (!selectedTest || submitting || view !== 'exam') return
    setSubmitting(true)
    setSubmitError('')
    try {
      const response = await api.submitStudentQuiz(selectedTest.id, answers)
      if (!response?.success || !response.data) {
        throw new Error(response?.message || 'The quiz submission was not recorded.')
      }
      setScore(response.data.score)
      setAnswerReview(response.data.answerReview || [])
      setAvailableTests((tests) => tests.map((test) => (
        test.id === selectedTest.id
          ? { ...test, status: 'completed', score: response.data.score, maxScore: response.data.maxMarks }
          : test
      )))
      setView('result')
    } catch (error) {
      setSubmitError(error.message || 'Could not submit the quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (view === 'exam' && timeLeft === 0) submitExam()
  }, [view, timeLeft])

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (view === 'instructions' && selectedTest) {
    return (
      <div className="online-exam-page">
        <div className="exam-instructions">
          <div className="instructions-header">
            <ClipboardList size={28} />
            <h2>Exam Instructions</h2>
            <p>{selectedTest.title}</p>
          </div>
          <div className="instructions-meta-grid">
            <div><Clock size={14} /><span>Duration</span><strong>{selectedTest.duration} minutes</strong></div>
            <div><BookOpen size={14} /><span>Questions</span><strong>{selectedTest.questions.length}</strong></div>
            <div><Star size={14} /><span>Max Marks</span><strong>{selectedTest.maxMarks}</strong></div>
            <div><AlertCircle size={14} /><span>Attempts</span><strong>{selectedTest.attempts}</strong></div>
          </div>
          <ul className="instructions-list">
            <li><Check size={12} />Read each question carefully before answering.</li>
            <li><Check size={12} />All questions are compulsory. Each carries an equal share of the total marks.</li>
            <li><Check size={12} />Once started, the timer cannot be paused.</li>
            <li><Check size={12} />Do not refresh or close the browser tab during the exam.</li>
            <li><Check size={12} />You can review and change answers before final submission.</li>
            <li><Check size={12} />The exam will auto-submit when the timer expires.</li>
          </ul>
          <div className="instructions-actions">
            <button className="instructions-cancel" onClick={() => setView('list')}>
              <ChevronLeft size={14} />Back
            </button>
            <button className="instructions-start" onClick={beginExam}>
              Start Exam <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'exam' && selectedTest) {
    const questions = selectedTest.questions
    const q = questions[currentQuestion]
    const answered = Object.keys(answers).length
    const progress = (answered / questions.length) * 100

    return (
      <div className="online-exam-page exam-active">
        <div className="exam-topbar">
          <div className="exam-topbar-left">
            <ClipboardList size={16} />
            <span>{selectedTest.title}</span>
          </div>
          <div className="exam-timer">
            <Clock size={14} />
            <strong>{formatTime(timeLeft)}</strong>
          </div>
          <button className="exam-submit-btn" onClick={submitExam} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Exam'}
          </button>
        </div>

        <div className="exam-body">
          <div className="exam-question-area">
            <div className="exam-question-meta">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{answered} answered</span>
            </div>
            {submitError && <p role="alert" style={{ color: '#b91c1c' }}>{submitError}</p>}
            <div className="exam-progress-bar">
              <div className="exam-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="exam-question-card">
              <p className="exam-question-text">
                <span className="q-number">Q{currentQuestion + 1}.</span>
                {q.question}
              </p>
              <div className="exam-options">
                {q.options.map((opt, i) => (
                  <label
                    key={i}
                    className={`exam-option ${answers[q.id] === i ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === i}
                      onChange={() => selectAnswer(q.id, i)}
                    />
                    <span className="opt-letter">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className="exam-nav-buttons">
              <button
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion((c) => c - 1)}
              >
                <ChevronLeft size={14} />Previous
              </button>
              <button
                disabled={currentQuestion === questions.length - 1}
                onClick={() => setCurrentQuestion((c) => c + 1)}
              >
                Next<ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="exam-palette">
            <p>Question Palette</p>
            <div className="palette-grid">
              {questions.map((question, i) => (
                <button
                  key={i}
                  className={`palette-btn ${i === currentQuestion ? 'current' : ''} ${answers[question.id] !== undefined ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestion(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="palette-legend">
              <span className="palette-answered">Answered</span>
              <span className="palette-not-answered">Not Answered</span>
              <span className="palette-current">Current</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'result') {
    const percentage = ((score / selectedTest.maxMarks) * 100).toFixed(0)
    const reviewByQuestion = new Map(answerReview.map((answer) => [answer.questionId, answer]))
    const resultTone = percentage >= 85 ? 'excellent' : percentage >= 60 ? 'good' : 'average'
    return (
      <div className="online-exam-page">
        <div className="exam-result-card">
          <div className={`result-icon ${resultTone}`}>
            <Trophy size={34} />
          </div>
          <h2>Exam Submitted!</h2>
          <p>Your response has been recorded for <strong>{selectedTest?.title}</strong></p>
          <div className="result-score-display">
            <strong>{score}</strong>
            <span>/ {selectedTest.maxMarks}</span>
          </div>
          <div className="result-percentage">{percentage}%</div>
          <div className="result-review">
            {selectedTest.questions.map((q, i) => {
              const review = reviewByQuestion.get(String(q.id))
              return (
              <div key={q.id} className={`result-q-row ${review?.correct ? 'correct' : 'incorrect'}`}>
                <span className="result-q-icon">
                  {review?.correct ? <Check size={12} /> : <X size={12} />}
                </span>
                <span className="result-q-text">Q{i + 1}. {q.question}</span>
              </div>
              )
            })}
          </div>
          <button className="instructions-start" onClick={() => setView('list')}>
            Back to Tests
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="online-exam-page">
      <div className="online-exam-header">
        <div>
          <p className="online-exam-kicker"><ClipboardList size={13} />ONLINE EXAMINATION</p>
          <h2>Online Examination</h2>
          <p className="online-exam-caption">Attempt unit tests, quizzes and practice assessments assigned by faculty.</p>
        </div>
      </div>
      {loadError && <p role="alert" style={{ color: '#b91c1c' }}>{loadError}</p>}
      {!loading && !loadError && availableTests.length === 0 && (
        <p style={{ color: '#64748b' }}>There are no published quizzes assigned to your section yet.</p>
      )}
      {loading && <p style={{ color: '#64748b' }}>Loading your assigned quizzes…</p>}

      <div className="online-exam-list">
        {availableTests.map((test) => (
          <div key={test.id} className={`online-exam-card ${test.status === 'completed' ? 'completed' : 'available'}`}>
            <div className="oec-subject">
              <span className="oec-code">{test.code}</span>
              <span className="oec-subject-name">{test.subject}</span>
            </div>
            <div className="oec-body">
              <h3>{test.title}</h3>
              <div className="oec-meta">
                <span><BookOpen size={11} />{test.questions.length} questions</span>
                <span><Clock size={11} />{test.duration} min</span>
                <span><Star size={11} />{test.maxMarks} marks</span>
                {test.deadline && <span><AlertCircle size={11} />Due: {test.deadline}</span>}
              </div>
            </div>
            <div className="oec-action">
              {test.status === 'completed' ? (
                <div className="oec-completed">
                  <CheckCircle size={16} />
                  <div>
                    <strong>{test.score}/{test.maxMarks}</strong>
                    <small>Completed</small>
                  </div>
                </div>
              ) : (
                <button className="oec-start-btn" onClick={() => startExam(test)}>
                  Start Test <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
