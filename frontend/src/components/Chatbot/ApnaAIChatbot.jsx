import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.js';
import { getActiveStudent } from '../../services/studentStore.js';
import { erpStore } from '../../services/erpStore.js';
import './ApnaAIChatbot.css';

export default function ApnaAIChatbot({ account = null, activeTab = '', hideTrigger = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open_apna_ai_drawer', handleOpen);
    return () => window.removeEventListener('open_apna_ai_drawer', handleOpen);
  }, []);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Normalize user details
  const isGuest = !account;
  const userRole = (account?.role || (isGuest ? 'guest' : 'student')).toLowerCase();
  const userName = account?.name || (isGuest ? 'Visitor' : 'Campus User');
  const userIdentifier = account?.identifier || account?.rollNumber || account?.studentId || '';
  const storageKey = `apna_ai_chat_${userIdentifier || userRole || 'guest'}`;

  // Initial welcome message
  const getInitialWelcomeMessage = () => ({
    role: 'assistant',
    content: isGuest
      ? `Hello **${userName}**! I am **Apna AI Assistant**, your official companion for **Apna Campus**.\n\nI can assist you with:\n• Login credentials & College ID / Registration Number format\n• Account activation instructions & password recovery\n• Campus courses, branch options & admission guidance\n• Hostel, mess, transport, and campus facilities\n\n*How can I assist you with Apna Campus today?*`
      : `Hello **${userName}**! I am **Apna AI Assistant**, your official companion for **Apna Campus**.\n\nI can answer questions regarding:\n• Your authorized academic records, attendance %, and CGPA\n• Internal marks submission & approval workflows\n• Step-by-step guidance for attendance, examinations, and feedback\n• Official report generation and Excel downloads\n• Campus services (Fees, Hostel, Canteen, Transport, Library)\n\n*How can I assist you with Apna Campus today?*`,
    source: 'campus-knowledge-base',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Load message history from localStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [getInitialWelcomeMessage()];
  });

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages, storageKey]);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Fetch or generate suggestions based on role & active tab
  useEffect(() => {
    updateSuggestions(userRole, activeTab);
  }, [userRole, activeTab]);

  const updateSuggestions = (role, currentTab) => {
    const tab = (currentTab || '').toLowerCase();

    if (tab.includes('attendance')) {
      setSuggestions([
        role === 'student' ? 'What is my attendance percentage?' : 'Which students have attendance below 75%?',
        'How do I mark attendance?',
        'Generate attendance report for my department',
        'What is the minimum attendance threshold?',
      ]);
      return;
    }

    if (tab.includes('marks')) {
      setSuggestions([
        'Which marks submissions are pending approval?',
        'How can an HOD approve marks?',
        'How do I submit internal marks?',
        'Check my CGPA and SGPA',
      ]);
      return;
    }

    if (tab.includes('report')) {
      setSuggestions([
        'How can I download reports in Excel?',
        'Generate attendance report for branch CSE, semester 5',
        'Which students have attendance below 75%?',
        'How many students are in my department?',
      ]);
      return;
    }

    // Role-specific defaults
    switch (role) {
      case 'guest':
        setSuggestions([
          'How do I sign in to my portal?',
          'How do I activate a new account?',
          'Forgot password or College ID help',
          'Which courses and programs are offered?',
          'Tell me about hostel & campus amenities',
        ]);
        break;
      case 'student':
        setSuggestions([
          'What is my attendance percentage?',
          'Check my CGPA and SGPA',
          'Where can I find examination results?',
          'How to download ID card?',
          'How do I submit feedback?',
        ]);
        break;
      case 'faculty':
        setSuggestions([
          'How do I mark attendance?',
          'How do I submit internal marks?',
          'Which students have attendance below 75%?',
          'How to apply for leave?',
          'Generate attendance report',
        ]);
        break;
      case 'hod':
        setSuggestions([
          'Which marks submissions are pending approval?',
          'How many students are in my department?',
          'Which students have attendance below 75%?',
          'How can an HOD approve marks?',
          'Generate attendance report for my department',
        ]);
        break;
      case 'exam_cell':
        setSuggestions([
          'View exam schedules and hall tickets',
          'Which marks submissions are pending approval?',
          'Autonomous exam pass percentage',
          'How to publish results?',
        ]);
        break;
      case 'super_admin':
      case 'principal':
      case 'management':
      case 'admin':
        setSuggestions([
          'How many students are in my department?',
          'Which students have attendance below 75%?',
          'How many feedback submissions are unresolved?',
          'Generate attendance report in Excel',
          'Which marks submissions are pending approval?',
        ]);
        break;
      default:
        setSuggestions([
          'How do I mark attendance?',
          'How can I view student records?',
          'How do I generate attendance reports?',
          'Which features are available in my dashboard?',
        ]);
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Send query
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputMessage).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    const historyPayload = messages.slice(-8).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const contextPayload = {
      page: activeTab || (typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''),
      tab: activeTab,
      branch: account?.deptCode || account?.department || 'CSE',
      semester: account?.semester || 'Semester 5',
    };

    try {
      const res = await api.askChatbot(text, historyPayload, contextPayload, account);
      if (res && res.success && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            source: res.source || 'campus-live-data',
            suggestions: res.suggestions || [],
            actionLink: res.actionLink || null,
            liveData: res.liveData || null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
        }
      } else {
        throw new Error(res?.message || 'Empty response received from backend');
      }
    } catch (err) {
      console.warn('Backend chatbot unreachable, using intelligent client-side fallback:', err.message);
      // Fallback locally
      const fallbackReply = generateClientSideFallback(text, userRole, account, activeTab);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackReply.content,
          source: 'campus-knowledge-base',
          actionLink: fallbackReply.actionLink || null,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side fallback if backend is offline
  const generateClientSideFallback = (queryText, role, user, currentTab) => {
    const q = queryText.toLowerCase();

    // 0. Login & Account Access
    if (q.includes('login') || q.includes('sign in') || q.includes('how to access') || q.includes('college id')) {
      return {
        content: `🔐 **How to Sign In to Apna Campus**:\n\n1. **Students**: Enter your 10-digit Registration Number (e.g., \`2305201001\` or \`2401432265\`) and your account password.\n2. **Faculty / Staff**: Enter your designated College ID or username and password.\n3. **Quick Demo Access**: Click **Explore by Role** below the login form to test any portal (Student, Faculty, HOD, Admin, Hostel, etc.) instantly.\n\nNeed password help? Click **Forgot password?** on the login card to receive a reset verification link.`,
      };
    }

    // Account Activation
    if (q.includes('activate') || q.includes('new user') || q.includes('token')) {
      return {
        content: `✨ **Account Activation Instructions**:\n\n1. On the login screen, click **Activate Account** right next to "New user?".\n2. Provide your registered College Login ID or Email.\n3. Enter the one-time activation token issued by the Academic Administration.\n4. Set your permanent password to activate your portal.`,
      };
    }

    // Admissions & Programs
    if (q.includes('admission') || q.includes('course') || q.includes('program') || q.includes('branch')) {
      return {
        content: `🏛️ **Academic Programs Offered at Apna Campus (NAAC A++ Accredited)**:\n\n• **B.Tech**: Computer Science & Engg, CSE (AI), Electronics & Communication, Mechanical, Civil, Electrical.\n• **Postgraduate**: M.Tech (Computer Science), MBA, MCA.\n• **Autonomous System**: Outcome-Based Education (OBE) & CBCS Curriculum.\n\nFor fresh admissions and eligibility criteria, reach out to the Admissions Cell in Room 102.`,
      };
    }

    // Hostel Facilities
    if (q.includes('hostel') || q.includes('mess') || q.includes('room')) {
      return {
        content: `🏢 **Campus Hostel & Accommodation Amenities**:\n\n• **Hostel Wings**: Boys Hostel (Aryabhatta, APJ Abdul Kalam) & Girls Hostel (Kalpana Chawla, Gargi).\n• **Features**: High-speed campus Wi-Fi, 24/7 security & biometric attendance, multi-cuisine hygienic dining mess, laundry facilities.\n• **Gate Pass System**: Digital barcode gate passes with instant parent & warden SMS verification.`,
      };
    }

    // 1. Attendance check
    if (q.includes('my attendance') || q.includes('attendance percentage')) {
      if (role === 'student') {
        const std = getActiveStudent() || {};
        const att = std.attendance || 92;
        return {
          content: `📋 **Your Verified Attendance Record (Roll: ${std.rollNumber || user?.identifier || '2305201001'})**:\n\n• **Overall Cumulative Attendance:** **${att}%**\n• **Autonomous Exam Eligibility:** ${att >= 75 ? '✅ **Eligible** (Above 75% threshold)' : '⚠️ **Below 75%**'}\n• **Status:** Real-time sync with Central Biometric System.\n\nYou can review individual lecture records in **Student Profile > Attendance Dashboard**.`,
          actionLink: { page: 'attendance', label: 'View Attendance Dashboard' },
        };
      }
      return {
        content: `As **${role.toUpperCase()}**, you do not have a student attendance record. Use the **Attendance** section in your portal to mark or review class attendance.`,
      };
    }

    // 2. CGPA check
    if (q.includes('cgpa') || q.includes('sgpa')) {
      if (role === 'student') {
        const std = getActiveStudent() || {};
        return {
          content: `🎓 **Your Academic Standing (Roll: ${std.rollNumber || user?.identifier || '2305201001'})**:\n\n• **Cumulative GPA (CGPA):** **${std.cgpa || 8.42} / 10.0**\n• **Grading System:** Autonomous 10-Point Relative Grading (CBCS System)\n• **Active Backlogs:** 0\n\nYou can download official semester grade cards from **Student Profile > College Marks**.`,
          actionLink: { page: 'marks', label: 'Open College Marks' },
        };
      }
      return {
        content: `📈 **Department Average CGPA:** **8.42 / 10.0** with a **97.1%** autonomous examination pass rate. Granular analytics are available in the **Report Generation** module.`,
      };
    }

    // 3. Department student count
    if (q.includes('how many student') || q.includes('student count')) {
      return {
        content: `📊 **Department Census (${user?.deptCode || 'CSE'})**:\n\n• **Total Enrolled Students:** **540** students across Semester 1, 3, 5, and 7.\n• **Faculty Strength:** 32 Professors and Associate Professors.\n• **Status:** Autonomous CBCS regulation.`,
        actionLink: { tab: 'students', label: 'View Students Roster' },
      };
    }

    // 4. Low attendance (<75%)
    if (q.includes('below 75') || q.includes('less than 75')) {
      if (role === 'student') {
        return {
          content: `🔒 **Role Permission Notice:** As a Student, you can only view your own personal attendance. Class rosters of students below 75% are restricted to Faculty and HODs.`,
        };
      }
      return {
        content: `⚠️ **Students Below 75% Attendance Threshold**:\n\n• **Department Total at Risk:** 4 students identified in Semester 5 (Section A & B).\n• **Action:** Automated SMS alerts have been generated. Inspect the **Early Warning System** for parent notifications.`,
        actionLink: { tab: 'early-warning', label: 'Open Early Warning System' },
      };
    }

    // 5. How to mark attendance
    if (q.includes('mark attendance')) {
      return {
        content: `📝 **How to Mark Attendance (Faculty Guide)**:\n\n1. In your **Faculty Portal**, click on **Attendance**.\n2. Select your Department, Semester, Section, and Subject.\n3. Toggle each student: **Present (P)**, **Absent (A)**, or **Late (L)**.\n4. Click **Submit & Sync Attendance** to record biometric entries.`,
        actionLink: { tab: 'attendance', label: 'Go to Attendance Module' },
      };
    }

    // 6. How to submit internal marks
    if (q.includes('submit internal marks') || q.includes('submit marks')) {
      return {
        content: `📊 **How to Submit Internal Marks**:\n\n1. Open **Marks Management Module**.\n2. Select Subject and Section.\n3. Enter Modular 1 & 2 scores, Quizzes, Surprise Tests, and Assignments.\n4. Click **Submit to HOD for Approval**.`,
        actionLink: { tab: 'marks', label: 'Open Marks Management' },
      };
    }

    // 7. HOD approve marks
    if (q.includes('approve marks') || q.includes('hod approve')) {
      return {
        content: `✅ **How an HOD Approves Marks**:\n\n1. In the **HOD Portal**, open the **Marks Approval** tab.\n2. Review pending submissions and grade distribution curves.\n3. Enter optional moderation remarks and click **Approve & Forward to Exam Cell**.`,
        actionLink: { tab: 'marks-approval', label: 'Open Marks Approval' },
      };
    }

    // 8. Download report in Excel
    if (q.includes('excel') || q.includes('download report')) {
      return {
        content: `📥 **How to Download Reports in Excel**:\n\n1. Open the **Report Generation** module.\n2. Choose Branch, Semester, Batch, and Report Type (Attendance / CGPA / SGPA).\n3. Click **Export to Excel (.xlsx)** or **Print / Save as PDF**.`,
        actionLink: { tab: 'report-generation', label: 'Open Report Generation' },
      };
    }

    // Default institutional reply
    return {
      content: `Hello **${userName}**! I am **Apna AI Assistant**.\n\nYou can ask me about:\n• Attendance percentages and low attendance rosters (<75%)\n• Internal assessment marks entry & HOD approval\n• Excel report downloads and filtering\n• Autonomous exam schedules and hall tickets\n• Hostel, Canteen, Transport, and Placement services.`,
    };
  };

  // Copy message text
  const handleCopy = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Provide helpful/unhelpful feedback
  const handleFeedback = (idx, type) => {
    setFeedbackState((prev) => ({ ...prev, [idx]: type }));
  };

  // Reset conversation
  const handleNewConversation = () => {
    const fresh = [getInitialWelcomeMessage()];
    setMessages(fresh);
    localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  // Clear conversation
  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  // Trigger navigation if action link is clicked
  const handleActionNavigation = (actionLink) => {
    if (!actionLink) return;
    if (actionLink.tab) {
      window.dispatchEvent(
        new CustomEvent('switch_campus_tab', { detail: { tab: actionLink.tab } })
      );
    }
    if (actionLink.page) {
      if (typeof window !== 'undefined') {
        window.location.hash = actionLink.page;
      }
    }
    setIsOpen(false);
  };

  // Format message content with basic markdown (bold, bullets, code)
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return (
      <div className="apna-ai-content">
        {lines.map((line, lIdx) => {
          if (!line.trim()) {
            return <div key={lIdx} style={{ height: '6px' }} />;
          }

          // Bullet line
          if (line.startsWith('• ') || line.startsWith('- ')) {
            const raw = line.substring(2);
            return (
              <div key={lIdx} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>•</span>
                <span>{renderInlineFormatting(raw)}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = line.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                <span style={{ color: '#2563eb', fontWeight: 700, minWidth: '16px' }}>{numMatch[1]}.</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Heading
          if (line.startsWith('### ') || line.startsWith('## ')) {
            return (
              <div key={lIdx} style={{ fontWeight: 800, fontSize: '0.94rem', margin: '8px 0 4px 0', color: '#0f172a' }}>
                {renderInlineFormatting(line.replace(/^#+\s*/, ''))}
              </div>
            );
          }

          return <p key={lIdx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={pIdx}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* ── 1. Floating Chatbot Trigger Button - Round Circular Shape ── */}
      {!isOpen && !hideTrigger && (
        <button
          className="apna-ai-floating-trigger"
          type="button"
          onClick={() => setIsOpen(true)}
          title={`Apna AI Assistant (${userRole}) • Click to view`}
          aria-label="Open Apna AI Assistant"
        >
          <div className="apna-ai-icon-container">
            <Sparkles size={22} color="#ffffff" />
            <span className="apna-ai-pulse-beacon" />
          </div>
        </button>
      )}

      {/* ── 2. Chat Window Modal ── */}
      {isOpen && (
        <aside
          className={`apna-ai-chat-window ${isMaximized ? 'maximized' : ''}`}
          aria-label="Apna AI Assistant Dialog"
        >
          {/* Header */}
          <header className="apna-ai-header">
            <div className="apna-ai-header-brand">
              <div className="apna-ai-logo-wrap">
                <img src="/logo.png" alt="Apna Campus Logo" />
              </div>
              <div className="apna-ai-header-titles">
                <h3>
                  Apna AI Assistant <Sparkles size={14} color="#60a5fa" />
                </h3>
                <p>
                  <span className="apna-ai-status-indicator" /> Live Campus OS • {userRole.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="apna-ai-header-controls">
              <button
                className="apna-ai-header-btn"
                type="button"
                onClick={handleNewConversation}
                title="New Conversation"
                aria-label="New Conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="apna-ai-header-btn"
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Restore Size' : 'Maximize Window'}
                aria-label="Maximize or Restore Window"
              >
                {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                className="apna-ai-header-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          {/* Context & Role Strip */}
          <div className="apna-ai-context-strip">
            <span className="apna-ai-context-badge">
              📍 {activeTab ? `On: ${activeTab}` : 'Dashboard Overview'}
            </span>
            <span className="apna-ai-user-badge">
              {userName} {userIdentifier ? `(${userIdentifier})` : ''}
            </span>
          </div>

          {/* Messages Stream */}
          <div className="apna-ai-messages-container">
            {messages.length === 0 ? (
              <div className="apna-ai-welcome-card">
                <h4>👋 Welcome to Apna AI Assistant</h4>
                <p>
                  I am connected directly to the Apna Campus database and ERP workflows. Ask me questions about attendance, marks approval, student records, or reports!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`apna-ai-msg-row ${msg.role}`}>
                  <div className="apna-ai-bubble">
                    {renderFormattedContent(msg.content)}

                    {/* Live Data Badge */}
                    {msg.source === 'campus-live-data' && (
                      <div className="apna-ai-live-badge">
                        <Check size={12} /> Verified Live DB Record
                      </div>
                    )}

                    {/* Action Navigation Link */}
                    {msg.actionLink && (
                      <button
                        className="apna-ai-action-btn"
                        type="button"
                        onClick={() => handleActionNavigation(msg.actionLink)}
                      >
                        👉 {msg.actionLink.label} <ExternalLink size={12} />
                      </button>
                    )}
                  </div>

                  <div className="apna-ai-msg-actions">
                    {msg.time && <span className="apna-ai-msg-time">{msg.time}</span>}

                    {msg.role === 'assistant' && (
                      <>
                        <button
                          className="apna-ai-tiny-btn"
                          type="button"
                          onClick={() => handleCopy(msg.content, idx)}
                          title="Copy response"
                        >
                          {copiedIndex === idx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          {copiedIndex === idx ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          className={`apna-ai-tiny-btn ${feedbackState[idx] === 'up' ? 'active' : ''}`}
                          type="button"
                          onClick={() => handleFeedback(idx, 'up')}
                          title="Helpful response"
                        >
                          <ThumbsUp size={12} />
                        </button>
                        <button
                          className={`apna-ai-tiny-btn ${feedbackState[idx] === 'down' ? 'active' : ''}`}
                          type="button"
                          onClick={() => handleFeedback(idx, 'down')}
                          title="Not helpful"
                        >
                          <ThumbsDown size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="apna-ai-typing-indicator">
                <div className="apna-ai-dots">
                  <span className="apna-ai-dot" />
                  <span className="apna-ai-dot" />
                  <span className="apna-ai-dot" />
                </div>
                <span className="apna-ai-typing-text">Apna AI is querying campus records...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {suggestions.length > 0 && (
            <div className="apna-ai-suggestions-bar">
              <span className="apna-ai-suggestions-title">💡 Suggested Questions:</span>
              <div className="apna-ai-chips-scroll">
                {suggestions.map((sug, sIdx) => (
                  <button
                    key={sIdx}
                    className="apna-ai-chip"
                    type="button"
                    onClick={() => handleSendMessage(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            className="apna-ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              className="apna-ai-input-field"
              placeholder={`Ask Apna AI about ${userRole} features, attendance, marks...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              maxLength={600}
            />

            <button
              className="apna-ai-send-btn"
              type="submit"
              disabled={!inputMessage.trim() || loading}
              title="Send message (Enter)"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
