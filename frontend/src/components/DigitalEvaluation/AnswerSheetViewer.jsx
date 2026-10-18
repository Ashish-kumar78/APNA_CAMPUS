import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Check,
  X,
  Highlighter,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
  Lock,
  ArrowUp,
  ArrowDown,
  Hand,
  MousePointer,
  FileText,
  Layers,
  Sliders,
  Expand,
  Shrink,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

export default function AnswerSheetViewer({
  sheet,
  annotations = [],
  onAddAnnotation,
  onClearAnnotations,
  readOnly = false
}) {
  const [currentPage, setCurrentPage] = useState(2); // Start on Page 2 (Section 1 Answers) as evaluators grade questions
  const [zoomLevel, setZoomLevel] = useState(100); // 50% to 220%
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'continuous'
  const [activeTool, setActiveTool] = useState('tick'); // 'pan', 'tick', 'cross', 'stamp2', 'stamp6', 'stamp8', 'highlight', 'note'
  const [noteInput, setNoteInput] = useState('');
  const [showNotePrompt, setShowNotePrompt] = useState(false);
  const [pendingClickCoord, setPendingClickCoord] = useState(null);
  const [isPanning, setIsPanning] = useState(false);

  const viewportRef = useRef(null);
  const paperRef = useRef(null);
  const pageRefs = useRef({});
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const isMouseDownRef = useRef(false);

  const totalPages = sheet?.totalPages || 8;

  // Zoom handlers
  const handleZoom = useCallback((delta) => {
    setZoomLevel((prev) => Math.max(50, Math.min(220, prev + delta)));
  }, []);

  const handleFitWidth = () => {
    if (!viewportRef.current) return;
    const vpWidth = viewportRef.current.clientWidth - 56; // account for padding & scrollbar
    const calculated = Math.round((vpWidth / 780) * 100);
    setZoomLevel(Math.max(50, Math.min(200, calculated)));
  };

  const handleFitPage = () => {
    setZoomLevel(100);
    setRotation(0);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleScrollToTop = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Wheel zoom when Ctrl/Cmd is pressed, normal vertical/horizontal scroll otherwise
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 8 : -8;
      handleZoom(delta);
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in a textarea or input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowUp') {
        if (viewportRef.current) {
          viewportRef.current.scrollBy({ top: -140, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowDown') {
        if (viewportRef.current) {
          viewportRef.current.scrollBy({ top: 140, behavior: 'smooth' });
        }
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        if (viewportRef.current) {
          viewportRef.current.scrollBy({ top: -viewportRef.current.clientHeight * 0.85, behavior: 'smooth' });
        }
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        if (viewportRef.current) {
          viewportRef.current.scrollBy({ top: viewportRef.current.clientHeight * 0.85, behavior: 'smooth' });
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleScrollToTop();
      } else if (e.key === 'End') {
        e.preventDefault();
        handleScrollToBottom();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoom(15);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoom(-15);
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleFitPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages, handleZoom]);

  // Mouse pan handlers for Hand tool
  const handleMouseDown = (e) => {
    // If middle click or activeTool === 'pan'
    if (e.button === 1 || activeTool === 'pan') {
      e.preventDefault();
      isMouseDownRef.current = true;
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: viewportRef.current ? viewportRef.current.scrollLeft : 0,
        scrollTop: viewportRef.current ? viewportRef.current.scrollTop : 0
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !viewportRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    viewportRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    viewportRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setIsPanning(false);
  };

  // Annotation placement click handler
  const handlePaperClick = (e, targetPageNum = currentPage) => {
    if (readOnly || activeTool === 'pan' || isPanning) return;

    const targetEl = pageRefs.current[targetPageNum] || paperRef.current;
    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const xPct = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPct = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    if (activeTool === 'note') {
      setPendingClickCoord({ x: xPct, y: yPct, page: targetPageNum });
      setShowNotePrompt(true);
      return;
    }

    let markLabel = '';
    let markType = activeTool;

    if (activeTool === 'tick') markLabel = '✓';
    else if (activeTool === 'cross') markLabel = '✗';
    else if (activeTool === 'stamp2') { markLabel = '✓ +2'; markType = 'stamp'; }
    else if (activeTool === 'stamp6') { markLabel = '✓ +6'; markType = 'stamp'; }
    else if (activeTool === 'stamp8') { markLabel = '✓ +8'; markType = 'stamp'; }
    else if (activeTool === 'highlight') markLabel = 'HIGHLIGHT';

    if (onAddAnnotation) {
      onAddAnnotation({
        page: targetPageNum,
        x: xPct,
        y: yPct,
        type: markType,
        label: markLabel,
        id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      });
    }
  };

  const handleSaveNote = () => {
    if (!noteInput.trim() || !pendingClickCoord) {
      setShowNotePrompt(false);
      return;
    }
    if (onAddAnnotation) {
      onAddAnnotation({
        page: pendingClickCoord.page || currentPage,
        x: pendingClickCoord.x,
        y: pendingClickCoord.y,
        type: 'note',
        label: noteInput.trim(),
        id: `ann-${Date.now()}`
      });
    }
    setNoteInput('');
    setPendingClickCoord(null);
    setShowNotePrompt(false);
  };

  // Render authentic page body content
  const renderPageBody = (pNum) => {
    // PAGE 1: COVER
    if (pNum === 1) {
      return (
        <div className="booklet-cover-page">
          <div className="cover-header-crest">
            <div style={{ display: 'inline-flex', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', marginBottom: '8px' }}>
              <img src="/logo.png" alt="Apna Campus Logo" className="cover-crest-img" style={{ height: '48px', width: 'auto', objectFit: 'contain', margin: 0 }} />
            </div>
            <h2>GANDHI INSTITUTE FOR TECHNOLOGY (GIFT)</h2>
            <h3>AUTONOMOUS INSTITUTION · BHUBANESWAR</h3>
            <p>AFFILIATED TO BIJU PATNAIK UNIVERSITY OF TECHNOLOGY (BPUT)</p>
            <div className="cover-exam-badge">
              END SEMESTER EXAMINATION 2025–26 (REGULAR)
            </div>
          </div>

          {/* HIGH SECURITY BLIND ANONYMIZATION MASK */}
          <div className="blind-mask-card">
            <div className="blind-mask-header">
              <Lock size={16} />
              <span>CONFIDENTIAL — SCRIPT BLIND CODED FOR ANONYMOUS EVALUATION</span>
            </div>
            <div className="blind-mask-body">
              <div className="blind-hash-code">
                <span>SECURITY TOKEN HASH:</span>
                <code>SHA256: 8f9b402e1c3a647d9e115082046bcdef31776a943b1850d</code>
              </div>
              <div className="blind-mask-tape">
                <span className="caution-stripe">████████████████████████████████████████████████████████████</span>
                <strong className="tape-text">STUDENT IDENTITY MASKED BY EXAMINATION CONTROLLER</strong>
                <span className="caution-stripe">████████████████████████████████████████████████████████████</span>
              </div>
              <p className="blind-notice">
                Student name, roll number, and registration credentials are strictly masked to ensure 100% unbiased, merit-based blind digital grading.
              </p>
            </div>
          </div>

          {/* Subject & Script Metadata */}
          <table className="cover-meta-table">
            <tbody>
              <tr>
                <th>SUBJECT CODE:</th>
                <td><strong>{sheet?.subjectCode || 'BTCS-T-PC-403'}</strong></td>
                <th>SEMESTER / BRANCH:</th>
                <td>{sheet?.semester || '4th Semester'} · {sheet?.department || 'CSE'}</td>
              </tr>
              <tr>
                <th>COURSE TITLE:</th>
                <td><strong>{sheet?.subjectName || 'Programming with Python'}</strong></td>
                <th>EXAM DATE:</th>
                <td>{sheet?.examDate || '06-05-2026'}</td>
              </tr>
              <tr>
                <th>ANSWER SCRIPT ID:</th>
                <td><span className="script-id-pill">{sheet?.id || 'AS-CSE-0001'}</span></td>
                <th>BUNDLE REFERENCE:</th>
                <td>{sheet?.bundleId || 'BND-2026-04-PY'}</td>
              </tr>
            </tbody>
          </table>

          <div className="cover-instructions-box">
            <h4>NOTICE TO EVALUATOR:</h4>
            <ol>
              <li>Check all attempted questions across Sections 1 to 4 thoroughly.</li>
              <li>In Section 2 and 3, enforce university Best-5 attempt capping rule automatically via the right Marking Panel.</li>
              <li>Click anywhere on answer lines to stamp evaluator verification marks.</li>
              <li>Ensure each evaluated answer carries corresponding section marks before submitting to HOD.</li>
            </ol>
          </div>

          <div className="cover-bottom-stamp">
            <span>DIGITIZED &amp; VERIFIED AT 300 DPI · AUTONOMOUS EXAM VAULT</span>
          </div>
        </div>
      );
    }

    // PAGE 2: SECTION 1 (ALL 10 COMPULSORY QUESTIONS: ANS 1.1 TO ANS 1.10)
    if (pNum === 2) {
      return (
        <div className="booklet-ruled-content">
          <div className="paper-margin-line" />
          <div className="student-written-work">
            <div className="section-divider-banner">
              <strong>SECTION 1: SHORT ANSWER QUESTIONS (COMPULSORY - 10 × 2 = 20 MARKS)</strong>
            </div>

            {/* Ans 1.1 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.1</span>
              <p className="student-handwritten">
                <strong>Time Complexity &amp; Big-O Notation:</strong><br />
                Time complexity measures the execution time required by an algorithm as a function of the input size <em>n</em>.<br />
                Big-O notation denotes the asymptotic <u>upper bound</u> of growth rate:
              </p>
              <div className="math-formula-box">
                O(g(n)) = &#123; f(n) : &exist; c &gt; 0, n<sub>0</sub> &gt; 0 &nbsp;such that&nbsp; 0 &le; f(n) &le; c &middot; g(n) &nbsp;&forall; n &ge; n<sub>0</sub> &#125;
              </div>
            </div>

            {/* Ans 1.2 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.2</span>
              <p className="student-handwritten">
                <strong>Mutable vs Immutable in Python:</strong><br />
                1. <u>Mutable Types:</u> Objects whose internal state or elements can be modified in-place without altering their memory ID. Examples: <code>list</code>, <code>dict</code>, <code>set</code>.<br />
                2. <u>Immutable Types:</u> Objects that cannot be altered once instantiated in memory. Any modification generates a new memory object. Examples: <code>int</code>, <code>float</code>, <code>tuple</code>, <code>str</code>.
              </p>
            </div>

            {/* Ans 1.3 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.3</span>
              <p className="student-handwritten">
                <strong>B-Tree Indexing in Databases:</strong><br />
                An index is a balanced tree data structure (B+ Tree) that stores sorted search keys with disk block pointers. It transforms costly full table sequential scans (O(N)) into logarithmic tree traversals (O(log<sub>B</sub> N)), dramatically accelerating <code>WHERE</code> clause evaluations.
              </p>
            </div>

            {/* Ans 1.4 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.4</span>
              <p className="student-handwritten">
                <strong>Locality of Reference:</strong><br />
                &bull; <em>Temporal Locality:</em> If a memory location is accessed once, it is highly likely to be referenced again in the near future (e.g., loop counters, function calls).<br />
                &bull; <em>Spatial Locality:</em> If a memory location is referenced, adjacent memory locations will likely be referenced soon (e.g., contiguous array traversals, sequential instructions).
              </p>
            </div>

            {/* Ans 1.5 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.5</span>
              <p className="student-handwritten">
                <strong>Pure Virtual Function &amp; Abstract Class:</strong><br />
                A pure virtual function is declared in a base class with syntax <code>virtual void calculate() = 0;</code> with no definition in the base class.<br />
                Any class having at least one pure virtual function becomes an <em>Abstract Class</em>. Objects of an abstract class cannot be instantiated directly; derived classes must implement all pure virtual functions to enable runtime polymorphism.
              </p>
            </div>

            {/* Ans 1.6 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.6</span>
              <p className="student-handwritten">
                <strong>Deadlock &amp; The Four Coffman Conditions:</strong><br />
                A deadlock occurs when a set of concurrent processes are permanently blocked because each process holds resources and waits for others.<br />
                The four simultaneous Coffman conditions are:<br />
                1. <em>Mutual Exclusion:</em> Resources cannot be shared simultaneously.<br />
                2. <em>Hold &amp; Wait:</em> Process holds allocated resources while requesting additional ones.<br />
                3. <em>No Preemption:</em> Resources can only be released voluntarily by the holding process.<br />
                4. <em>Circular Wait:</em> A closed chain exists where P<sub>0</sub> waits for P<sub>1</sub>, ..., and P<sub>n</sub> waits for P<sub>0</sub>.
              </p>
            </div>

            {/* Ans 1.7 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.7</span>
              <p className="student-handwritten">
                <strong>Shannon Channel Capacity Theorem:</strong><br />
                Shannon's theorem defines the theoretical upper bound on error-free data transfer rate over a communication channel with bandwidth <em>B</em> (Hz) and signal-to-noise ratio <em>S/N</em>:
              </p>
              <div className="math-formula-box">
                C = B &middot; log<sub>2</sub>(1 + S / N) &nbsp;[bits per second (bps)]
              </div>
            </div>

            {/* Ans 1.8 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.8</span>
              <p className="student-handwritten">
                <strong>Amdahl's Law of Parallel Speedup:</strong><br />
                Amdahl's law gives the theoretical maximum speedup of a task when using <em>p</em> parallel processors, where <em>f</em> is the fraction of code that can be parallelized:
              </p>
              <div className="math-formula-box">
                Speedup S(p) = 1 / [ (1 - f) + (f / p) ]
              </div>
              <p className="student-handwritten">
                As <em>p</em> &rarr; &infin;, the maximum speedup is strictly limited by the sequential portion: <strong>S<sub>max</sub> &le; 1 / (1 - f)</strong>.
              </p>
            </div>

            {/* Ans 1.9 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.9</span>
              <p className="student-handwritten">
                <strong>Generator Functions &amp; `yield` in Python:</strong><br />
                A generator function returns a lazy iterator instead of computing all values at once into memory. When the <code>yield</code> keyword is encountered, function execution is paused, preserving local variables, and resumed on the next call to <code>next()</code>.
              </p>
              <div className="code-snippet-box">
                <pre>{`def fibonacci_stream():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b`}</pre>
              </div>
            </div>

            {/* Ans 1.10 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 1.10</span>
              <p className="student-handwritten">
                <strong>Third Normal Form (3NF) in Relational Databases:</strong><br />
                A relation schema <em>R</em> is in 3NF if:<br />
                1. It is already in Second Normal Form (2NF).<br />
                2. No non-prime attribute is transitively dependent on any candidate key.<br />
                Equivalently, for every functional dependency <em>X &rarr; Y</em>, either <strong>X is a Superkey</strong> or <strong>Y is a Prime Attribute</strong>.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PAGE 3: SECTION 2 (ANS 2.1 TO ANS 2.4)
    if (pNum === 3) {
      return (
        <div className="booklet-ruled-content">
          <div className="paper-margin-line" />
          <div className="student-written-work">
            <div className="section-divider-banner">
              <strong>SECTION 2: MEDIUM ANALYTICAL &amp; PROBLEM SOLVING QUESTIONS (ANSWER ANY 5 OF 8 × 6M)</strong>
            </div>

            {/* Ans 2.1 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.1</span>
              <p className="student-handwritten">
                <strong>QuickSort Algorithm &amp; Recurrence Analysis:</strong><br />
                QuickSort is a Divide-and-Conquer sorting algorithm. A <em>pivot</em> element is chosen to partition the input list into elements strictly smaller and strictly larger than the pivot.
              </p>
              <div className="code-snippet-box">
                <pre>{`def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`}</pre>
              </div>
              <p className="student-handwritten">
                Average Case Recurrence: T(n) = 2T(n/2) + &Theta;(n).<br />
                Applying Master Theorem: a = 2, b = 2, k = 1 &rarr; log<sub>2</sub>(2) = 1 = k.<br />
                Hence, Average Case Complexity = <strong>&Theta;(n log n)</strong>.<br />
                Worst case occurs when partition is severely unbalanced (sorted array with extreme pivot) &rarr; <strong>O(n<sup>2</sup>)</strong>.
              </p>
            </div>

            {/* Ans 2.2 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.2</span>
              <p className="student-handwritten">
                <strong>Python Decorators (Higher-Order Function Metaprogramming):</strong><br />
                A decorator wraps another callable to extend or inject functionality (e.g., logging, metrics, authentication) without permanently altering the original function's source code.
              </p>
              <div className="code-snippet-box">
                <pre>{`import time

def execution_timer(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
        print(f"[METRIC] {func.__name__} executed in {duration:.5f}s")
        return result
    return wrapper

@execution_timer
def generate_matrix(rows, cols):
    return [[i * j for j in range(cols)] for i in range(rows)]`}</pre>
              </div>
            </div>

            {/* Ans 2.3 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.3</span>
              <p className="student-handwritten">
                <strong>ACID Properties &amp; Two-Phase Locking (2PL) Protocol:</strong><br />
                &bull; <strong>A</strong>tomicity (all-or-nothing execution via write-ahead logging)<br />
                &bull; <strong>C</strong>onsistency (preserves database integrity constraints)<br />
                &bull; <strong>I</strong>solation (concurrent transactions do not interfere)<br />
                &bull; <strong>D</strong>urability (committed changes persist across crashes)<br />
                <strong>2PL Protocol:</strong> Guarantees conflict serializability.<br />
                1. <em>Growing Phase:</em> Transaction acquires locks (Shared or Exclusive) as needed; releases none.<br />
                2. <em>Shrinking Phase:</em> Once the first lock is released, no new locks can ever be acquired.
              </p>
            </div>

            {/* Ans 2.4 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.4</span>
              <p className="student-handwritten">
                <strong>RISC vs CISC Architecture &amp; Pipelining Hazards:</strong><br />
                1. <u>RISC (Reduced Instruction Set Computer):</u> Simple, single-cycle fixed-length instructions, heavy register reliance (e.g. ARM, RISC-V).<br />
                2. <u>CISC (Complex Instruction Set Computer):</u> Variable-length instructions supporting direct memory-to-memory operations (e.g. x86).<br />
                <strong>Pipelining Hazards:</strong><br />
                &bull; <em>Structural Hazard:</em> Hardware resource conflict (e.g., single memory port for instruction and data).<br />
                &bull; <em>Data Hazard (RAW):</em> Instruction depends on uncommitted output of prior instruction (resolved by forwarding / stalling).<br />
                &bull; <em>Control Hazard:</em> Branch instructions alter instruction pointer, causing pipeline flushes.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PAGE 4: SECTION 2 CONTINUED (ANS 2.5 TO ANS 2.8)
    if (pNum === 4) {
      return (
        <div className="booklet-ruled-content">
          <div className="paper-margin-line" />
          <div className="student-written-work">
            <div className="section-divider-banner">
              <strong>SECTION 2 (CONTINUED)</strong>
            </div>

            {/* Ans 2.5 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.5</span>
              <p className="student-handwritten">
                <strong>Banker's Algorithm for Deadlock Avoidance:</strong><br />
                Maintains system in a <em>Safe State</em> where at least one execution sequence exists allowing all processes to finish.<br />
                Data structures: <code>Available[m]</code>, <code>Max[n][m]</code>, <code>Allocation[n][m]</code>, <code>Need[n][m] = Max - Allocation</code>.<br />
                When process P<sub>i</sub> requests resources: safety test checks if <code>Request &le; Need</code> and <code>Request &le; Available</code>. If hypothetical allocation leaves system in a safe sequence &rarr; grant request; else force P<sub>i</sub> to wait.
              </p>
            </div>

            {/* Ans 2.6 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.6</span>
              <p className="student-handwritten">
                <strong>Bellman-Ford Algorithm with Negative Edge Weights:</strong><br />
                Finds single-source shortest paths on directed graphs with arbitrary weights and detects negative weight cycles.
              </p>
              <div className="code-snippet-box">
                <pre>{`def bellman_ford(vertices, edges, source):
    dist = {v: float('inf') for v in vertices}
    dist[source] = 0
    # Relax all edges |V| - 1 times
    for _ in range(len(vertices) - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    # Check for negative weight cycles
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            raise ValueError("Graph contains negative weight cycle!")
    return dist`}</pre>
              </div>
              <p className="student-handwritten">
                Time Complexity: <strong>O(V &middot; E)</strong>.
              </p>
            </div>

            {/* Ans 2.7 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.7</span>
              <p className="student-handwritten">
                <strong>Red-Black Tree Properties &amp; Invariants:</strong><br />
                A self-balancing Binary Search Tree where each node carries a color bit (Red or Black):<br />
                1. Every node is either Red or Black.<br />
                2. Root node is always Black.<br />
                3. Red nodes cannot have Red children (No consecutive red nodes).<br />
                4. Every path from a node to any of its descendant NIL leaves contains the same number of Black nodes (Black-Height).<br />
                Guarantees height <em>h &le; 2 log(n + 1)</em> &rarr; Search, Insert, Delete run in <strong>O(log n)</strong>.
              </p>
            </div>

            {/* Ans 2.8 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 2.8</span>
              <p className="student-handwritten">
                <strong>Python Global Interpreter Lock (GIL) &amp; Concurrency:</strong><br />
                The CPython GIL is a mutex that prevents multiple native OS threads from executing Python bytecode simultaneously, protecting CPython memory management and reference counts.<br />
                &bull; <em>I/O-Bound Workloads:</em> <code>threading</code> or <code>asyncio</code> excels because GIL is released during network/disk wait.<br />
                &bull; <em>CPU-Bound Workloads:</em> <code>multiprocessing</code> or <code>concurrent.futures.ProcessPoolExecutor</code> is required to bypass GIL by spawning independent processes across CPU cores.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PAGE 5: SECTION 3 (ANS 3.1 & ANS 3.2)
    if (pNum === 5) {
      return (
        <div className="booklet-ruled-content">
          <div className="paper-margin-line" />
          <div className="student-written-work">
            <div className="section-divider-banner">
              <strong>SECTION 3: LONG COMPREHENSIVE &amp; ALGORITHMIC DESIGN QUESTIONS (ANSWER ANY 5 OF 8 × 8M)</strong>
            </div>

            {/* Ans 3.1 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 3.1</span>
              <p className="student-handwritten">
                <strong>Thread-Safe Least Recently Used (LRU) Cache:</strong><br />
                Combines a <code>Doubly Linked List</code> (tracks access recency with O(1) node relocation) with a <code>HashMap</code> (provides O(1) key-to-node lookup), protected by a re-entrant <code>Lock</code>.
              </p>
              <div className="diagram-ascii-box">
                [HEAD (MRU)] &lt;===&gt; [Node: K1, V1] &lt;===&gt; [Node: K2, V2] &lt;===&gt; [TAIL (LRU)]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&uarr;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&uarr;<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dict[K1] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dict[K2]
              </div>
              <div className="code-snippet-box">
                <pre>{`from threading import Lock

class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head, self.tail = Node(), Node()
        self.head.next = self.tail
        self.tail.prev = self.head
        self.lock = Lock()

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        with self.lock:
            if key not in self.cache:
                return -1
            node = self.cache[key]
            self._remove(node)
            self._add_to_head(node)
            return node.val`}</pre>
              </div>
            </div>

            {/* Ans 3.2 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 3.2</span>
              <p className="student-handwritten">
                <strong>A* Search Algorithm &amp; 8-Puzzle Solution:</strong><br />
                Evaluation function: <strong>f(n) = g(n) + h(n)</strong>, where <em>g(n)</em> is the actual cost from start to node <em>n</em>, and <em>h(n)</em> is the estimated heuristic cost to goal.<br />
                For the 8-Puzzle, the Manhattan Distance heuristic is:
              </p>
              <div className="math-formula-box">
                h(n) = &Sigma;<sub>i=1..8</sub> [ |x<sub>i</sub> - x<sub>goal</sub>| + |y<sub>i</sub> - y<sub>goal</sub>| ]
              </div>
              <p className="student-handwritten">
                <strong>Admissibility Proof:</strong> Each misplaced tile requires at least its Manhattan distance in orthogonal moves to reach its goal position, assuming no obstacle tiles exist. Therefore, <em>h(n) &le; h*(n)</em> is guaranteed admissible, ensuring A* finds the strictly optimal shortest solution path.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PAGE 6: SECTION 3 CONTINUED (ANS 3.3 & ANS 3.4)
    if (pNum === 6) {
      return (
        <div className="booklet-ruled-content">
          <div className="paper-margin-line" />
          <div className="student-written-work">
            <div className="section-divider-banner">
              <strong>SECTION 3 (CONTINUED)</strong>
            </div>

            {/* Ans 3.3 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 3.3</span>
              <p className="student-handwritten">
                <strong>Distributed Campus ERP Database Partitioning:</strong><br />
                To sustain 50,000+ concurrent student sessions during examination result publishing, the database uses horizontal sharding and multi-tier caching:
              </p>
              <div className="diagram-ascii-box">
                [Client / Portal Apps] &rarr; [Load Balancer NGINX]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;<br />
                [API Gateway] &rarr; [Redis Read Cache (TTL=300s, Hall Tickets &amp; Timetables)]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;<br />
                [PostgreSQL Master Nodes (Synchronous WAL replication for Marks &amp; Grades)]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;<br />
                Shard Key: hash(department_id, batch_year) mod 16
              </div>
              <p className="student-handwritten">
                1. <em>Read Replicas:</em> High-volume read queries (hall tickets, attendance, fee status) hit read-only replicas.<br />
                2. <em>Strict Isolation:</em> Examination marks entry writes directly to master with cryptographic SHA-256 transaction audit logging.
              </p>
            </div>

            {/* Ans 3.4 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 3.4</span>
              <p className="student-handwritten">
                <strong>Convolutional Neural Network (CNN) Feature Hierarchy:</strong><br />
                CNNs extract hierarchical spatial representations using localized weight-sharing kernels:
              </p>
              <div className="math-formula-box">
                Feature Map Output: S(i, j) = (I * K)(i, j) = &Sigma;<sub>m</sub> &Sigma;<sub>n</sub> I(i - m, j - n) &middot; K(m, n)
              </div>
              <p className="student-handwritten">
                &bull; <em>Layer 1 (Conv + ReLU):</em> Detects low-level edges, corners, and gradients.<br />
                &bull; <em>Layer 2 (MaxPool 2x2):</em> Downsamples spatial dimensions while preserving translation invariance.<br />
                &bull; <em>Layer 3 (Deep Conv):</em> Detects complex class-specific motifs and shapes.<br />
                &bull; <em>Dense Softmax Head:</em> Outputs normalized probability distribution across classes.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PAGE 7: SECTION 4 (SYSTEM DESIGN CASE STUDY - ANS 4.1)
    if (pNum === 7) {
      return (
        <div className="booklet-ruled-content">
          <div className="paper-margin-line" />
          <div className="student-written-work">
            <div className="section-divider-banner">
              <strong>SECTION 4: ADVANCED SYSTEM DESIGN CASE STUDY (ANSWER ANY 1 OF 4 × 10M)</strong>
            </div>

            {/* Ans 4.1 */}
            <div className="answer-block">
              <span className="question-no-pill">Ans 4.1</span>
              <p className="student-handwritten">
                <strong>Architecture of Enterprise Digital Answer Sheet Evaluation System:</strong><br />
                The system modernizes paper answer booklet grading into an autonomous, tamper-evident digital workflow with blind anonymization and real-time rubric capping:
              </p>
              <div className="diagram-ascii-box">
                [High-Speed ADF Scanner 300 DPI] &rarr; [Digitization &amp; Barcode Tokenization Engine]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;<br />
                [Blind Anonymizer Vault (Strip Student Credentials &amp; Inject Hash Token AS-CSE-0001)]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;<br />
                [Faculty Evaluation Workspace (65% Scanned Script + 35% Autonomous Marking Panel)]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;<br />
                [Attempt Capping Engine (Best-5 of 8 Algorithm) &rarr; HOD Review &rarr; CoE Audit Seal]
              </div>
              <p className="student-handwritten">
                <strong>Core Architectural Pillars:</strong><br />
                1. <u>Blind Evaluation Security:</u> Faculty members never see candidate name, roll number, or college regd number. Student identity is sealed inside an encrypted vault accessible solely by the Controller of Examinations using master PIN authorization.<br />
                2. <u>Autonomous Rubric &amp; Attempt Capping:</u> When students attempt 6 questions in Section 2 (where only 5 are counted), the engine dynamically selects the top 5 highest-scoring answers, flags the lowest as <em>⚠️ Extra Attempt - Capped</em>, and computes the official 100-mark grand total in real time.<br />
                3. <u>Cryptographic Audit Trail:</u> Every mark change, margin stamp, and qualitative remark generates an immutable audit timestamp with digital evaluator signature.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // PAGE 8: CANDIDATE ROUGH WORK & VERIFICATION LOG
    return (
      <div className="booklet-ruled-content">
        <div className="paper-margin-line" />
        <div className="student-written-work">
          <div className="section-divider-banner">
            <strong>CANDIDATE ROUGH WORK &amp; AUDIT VERIFICATION LOG</strong>
          </div>

          <div className="answer-block">
            <h4 style={{ margin: '0 0 10px', color: '#64748b', fontSize: '13px' }}>ROUGH WORK CALCULATIONS</h4>
            <p className="student-handwritten" style={{ opacity: 0.65, lineHeight: 1.8 }}>
              T(n) = 2T(n/2) + O(n) &rarr; O(n log n).<br />
              QuickSort partition: pivot = 15. L = [4, 9, 11], R = [22, 35].<br />
              LRU Cache: cap = 4. Access: K1, K2, K3, K1, K4, K5 &rarr; Evict K2.<br />
              Shannon capacity: B = 4000 Hz, S/N = 1023 &rarr; C = 4000 * 10 = 40,000 bps.<br />
              Amdahl: f = 0.8, p = 8 &rarr; S = 1 / [0.2 + 0.1] = 1 / 0.3 = 3.33x speedup.<br />
              3NF check: Dept_ID &rarr; Dept_Name (Transitive via Student_ID &rarr; Dept_ID &rarr; Dept_Name). Sharded schema.
            </p>

            <div style={{ marginTop: '50px', borderTop: '2px dashed #cbd5e1', paddingTop: '24px' }}>
              <p style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                I hereby certify that all answers recorded in this booklet are my authentic original work and compliant with BPUT Autonomous Examination Regulations.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', fontSize: '12px', color: '#64748b' }}>
                <span>Candidate Blind Code: <strong>[CRYPTOGRAPHICALLY MASKED]</strong></span>
                <span>Date: <strong>{sheet?.examDate || '06-05-2026'}</strong></span>
                <span style={{ border: '1px solid #94a3b8', padding: '4px 12px', borderRadius: '4px' }}>Candidate Sig: Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render a single sheet page element
  const renderSingleSheet = (pNum) => {
    const pAnnotations = annotations.filter((a) => a.page === pNum);

    return (
      <div
        key={`page-${pNum}`}
        id={`page-anchor-${pNum}`}
        ref={(el) => {
          pageRefs.current[pNum] = el;
          if (pNum === currentPage) paperRef.current = el;
        }}
        className={`eval-scanned-sheet page-${pNum}`}
        style={{
          width: '780px',
          minHeight: '1220px',
          zoom: zoomLevel / 100,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          margin: '0 auto 36px',
          position: 'relative',
          cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair',
          transition: isPanning ? 'none' : 'transform 0.15s ease'
        }}
        onClick={(e) => handlePaperClick(e, pNum)}
      >
        {/* Header Barcode & Security Watermark */}
        <div className="booklet-top-ribbon">
          <div className="booklet-barcode-wrap">
            <span className="barcode-font">|| | | |||| | ||| |||| | | |||| ||</span>
            <strong className="booklet-id-badge">{sheet?.id || 'AS-CSE-0001'}</strong>
          </div>
          <div className="booklet-bput-emblem">
            <span>GIFT AUTONOMOUS · BPUT BATCH 2028-P</span>
            <small>DIGITAL EXAMINATION ANSWER SCRIPT</small>
          </div>
          <div className="booklet-page-stamp">
            PAGE {pNum} OF {totalPages}
          </div>
        </div>

        {/* Page Body Content */}
        {renderPageBody(pNum)}

        {/* DYNAMIC ANNOTATION STAMPS OVERLAY */}
        {pAnnotations.map((ann) => (
          <div
            key={ann.id || `${ann.x}-${ann.y}`}
            className={`eval-stamp-marker stamp-${ann.type}`}
            style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
          >
            {ann.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="eval-viewer-container">
      {/* ── Top Floating Annotation Toolbar ── */}
      <div className="eval-viewer-toolbar">
        {/* Left: View Mode Toggle & Page Navigator */}
        <div className="eval-toolbar-group">
          {/* Mode Switcher */}
          <div className="eval-view-mode-toggle">
            <button
              type="button"
              className={`eval-mode-btn ${viewMode === 'single' ? 'active' : ''}`}
              onClick={() => setViewMode('single')}
              title="Single Page View (Page by Page with Full Height Scrolling)"
            >
              <FileText size={13} /> Single Page
            </button>
            <button
              type="button"
              className={`eval-mode-btn ${viewMode === 'continuous' ? 'active' : ''}`}
              onClick={() => setViewMode('continuous')}
              title="Continuous Scroll View (Scroll through all 8 pages seamlessly)"
            >
              <Layers size={13} /> Continuous Scroll
            </button>
          </div>

          {viewMode === 'single' && (
            <div className="eval-page-nav-controls">
              <button
                type="button"
                className="eval-tool-btn"
                disabled={currentPage <= 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  handleScrollToTop();
                }}
                title="Previous Page (PgUp)"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="eval-page-badge">
                Page <strong>{currentPage}</strong> of {totalPages}
              </span>
              <button
                type="button"
                className="eval-tool-btn"
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  handleScrollToTop();
                }}
                title="Next Page (PgDn)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Center: Evaluator Stamp & Annotation Tools */}
        {!readOnly && (
          <div className="eval-toolbar-group eval-tools-palette">
            <span className="eval-tools-label">Tools:</span>
            {/* Pan / Hand Tool */}
            <button
              type="button"
              className={`eval-palette-btn btn-pan ${activeTool === 'pan' ? 'active' : ''}`}
              onClick={() => setActiveTool(activeTool === 'pan' ? 'tick' : 'pan')}
              title="Hand Tool: Click and drag anywhere to pan / scroll"
            >
              <Hand size={13} /> Pan
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-tick ${activeTool === 'tick' ? 'active' : ''}`}
              onClick={() => setActiveTool('tick')}
              title="Stamp Green Correct Mark (✓)"
            >
              <Check size={13} /> ✓ Correct
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-cross ${activeTool === 'cross' ? 'active' : ''}`}
              onClick={() => setActiveTool('cross')}
              title="Stamp Red Incorrect Mark (✗)"
            >
              <X size={13} /> ✗ Incorrect
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-stamp ${activeTool === 'stamp2' ? 'active' : ''}`}
              onClick={() => setActiveTool('stamp2')}
              title="Stamp +2 Marks in Margin"
            >
              +2M
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-stamp ${activeTool === 'stamp6' ? 'active' : ''}`}
              onClick={() => setActiveTool('stamp6')}
              title="Stamp +6 Marks in Margin"
            >
              +6M
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-stamp ${activeTool === 'stamp8' ? 'active' : ''}`}
              onClick={() => setActiveTool('stamp8')}
              title="Stamp +8 Marks in Margin"
            >
              +8M
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-highlighter ${activeTool === 'highlight' ? 'active' : ''}`}
              onClick={() => setActiveTool('highlight')}
              title="Yellow Highlighter Tool"
            >
              <Highlighter size={13} /> Highlight
            </button>
            <button
              type="button"
              className={`eval-palette-btn btn-note ${activeTool === 'note' ? 'active' : ''}`}
              onClick={() => setActiveTool('note')}
              title="Leave Margin Evaluator Remark"
            >
              <MessageSquare size={13} /> Note
            </button>
            {annotations.length > 0 && (
              <button
                type="button"
                className="eval-tool-btn btn-clear-ann"
                onClick={onClearAnnotations}
                title="Clear All Booklet Stamps"
              >
                <Trash2 size={13} /> Clear
              </button>
            )}
          </div>
        )}

        {/* Right: Comprehensive Zoom & View Controls */}
        <div className="eval-toolbar-group eval-zoom-toolbar">
          <button
            type="button"
            className="eval-tool-btn"
            onClick={() => handleZoom(-10)}
            title="Zoom Out (Ctrl + -)"
          >
            <ZoomOut size={15} />
          </button>

          {/* Zoom Slider */}
          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="eval-zoom-range"
            title={`Zoom: ${zoomLevel}% (Hold Ctrl + Scroll Wheel)`}
          />

          <span className="eval-zoom-label">{zoomLevel}%</span>

          <button
            type="button"
            className="eval-tool-btn"
            onClick={() => handleZoom(10)}
            title="Zoom In (Ctrl + +)"
          >
            <ZoomIn size={15} />
          </button>

          {/* Quick Fit Width */}
          <button
            type="button"
            className="eval-tool-btn btn-fit-width"
            onClick={handleFitWidth}
            title="Fit Width to Viewport"
          >
            <Expand size={13} /> Fit Width
          </button>

          {/* Quick Zoom Presets */}
          <button
            type="button"
            className={`eval-tool-btn btn-zoom-preset ${zoomLevel === 75 ? 'active' : ''}`}
            onClick={() => setZoomLevel(75)}
            title="75% Zoom"
          >
            75%
          </button>
          <button
            type="button"
            className={`eval-tool-btn btn-zoom-preset ${zoomLevel === 100 ? 'active' : ''}`}
            onClick={() => setZoomLevel(100)}
            title="100% Zoom"
          >
            100%
          </button>
          <button
            type="button"
            className={`eval-tool-btn btn-zoom-preset ${zoomLevel === 125 ? 'active' : ''}`}
            onClick={() => setZoomLevel(125)}
            title="125% Zoom"
          >
            125%
          </button>
          <button
            type="button"
            className={`eval-tool-btn btn-zoom-preset ${zoomLevel === 150 ? 'active' : ''}`}
            onClick={() => setZoomLevel(150)}
            title="150% Zoom"
          >
            150%
          </button>

          {/* Reset Zoom & Position */}
          <button
            type="button"
            className="eval-tool-btn"
            onClick={handleFitPage}
            title="Reset Zoom to 100% and Scroll to Top"
          >
            <RotateCcw size={14} />
          </button>

          {/* Rotate Booklet 90 deg */}
          <button
            type="button"
            className="eval-tool-btn"
            onClick={handleRotate}
            title="Rotate Booklet 90° Clockwise"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Main Booklet Viewport (Smooth Vertical & Horizontal Scrolling) ── */}
      <div
        ref={viewportRef}
        className={`eval-booklet-viewport ${isPanning ? 'is-panning' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        tabIndex={0}
      >
        {viewMode === 'single' ? (
          renderSingleSheet(currentPage)
        ) : (
          <div className="eval-continuous-pages-stream">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <div key={`stream-${pNum}`} className="eval-stream-page-wrapper">
                <div className="eval-stream-page-badge">
                  <span>PAGE {pNum} OF {totalPages}</span>
                </div>
                {renderSingleSheet(pNum)}
              </div>
            ))}
          </div>
        )}

        {/* ── Floating Quick Scroll & Zoom HUD (Top, Bottom & Quick Zoom) ── */}
        <div className="eval-scroll-hud">
          <button
            type="button"
            className="eval-hud-btn"
            onClick={handleScrollToTop}
            title="Scroll to Top (Home)"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            className="eval-hud-btn"
            onClick={() => handleZoom(15)}
            title="Zoom In (+)"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            className="eval-hud-btn"
            onClick={() => handleZoom(-15)}
            title="Zoom Out (-)"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            className="eval-hud-btn"
            onClick={handleScrollToBottom}
            title="Scroll to Bottom (End)"
          >
            <ArrowDown size={16} />
          </button>
        </div>
      </div>

      {/* ── Bottom Page Thumbnail Strip ── */}
      <div className="eval-thumbnails-strip">
        {[
          { page: 1, label: 'Cover', sub: 'Masked Identity' },
          { page: 2, label: 'Page 2', sub: 'Sec 1 (Q1.1–Q1.10)' },
          { page: 3, label: 'Page 3', sub: 'Sec 2 (Q2.1–Q2.4)' },
          { page: 4, label: 'Page 4', sub: 'Sec 2 (Q2.5–Q2.8)' },
          { page: 5, label: 'Page 5', sub: 'Sec 3 (Q3.1–Q3.2)' },
          { page: 6, label: 'Page 6', sub: 'Sec 3 (Q3.3–Q3.4)' },
          { page: 7, label: 'Page 7', sub: 'Sec 4 (Q4.1 System)' },
          { page: 8, label: 'Page 8', sub: 'Rough Work & Sig' }
        ].map((item) => (
          <button
            key={item.page}
            type="button"
            className={`eval-thumb-btn ${currentPage === item.page ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage(item.page);
              if (viewMode === 'continuous') {
                const el = document.getElementById(`page-anchor-${item.page}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                handleScrollToTop();
              }
            }}
          >
            <span className="thumb-preview-card">{item.label}</span>
            <small>{item.sub}</small>
          </button>
        ))}
      </div>

      {/* Note input prompt modal */}
      {showNotePrompt && (
        <div className="eval-note-modal-overlay" onClick={() => setShowNotePrompt(false)}>
          <div className="eval-note-modal-box" onClick={(e) => e.stopPropagation()}>
            <h4>Add Margin Remark</h4>
            <p>Enter feedback note to be pinned onto Page {pendingClickCoord?.page || currentPage}:</p>
            <textarea
              rows={3}
              className="eval-note-textarea"
              placeholder="e.g. Excellent proof steps, clear Big-O derivation."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              autoFocus
            />
            <div className="eval-note-modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowNotePrompt(false)}>
                Cancel
              </button>
              <button type="button" className="btn-save-note" onClick={handleSaveNote}>
                Pin Remark ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
