import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare, Users, Send, Paperclip, Search, Plus, Check,
  CheckCheck, Clock, FileText, Download, Eye, AlertCircle, ShieldCheck,
  Award, Flag, ThumbsUp, Heart, Sparkles, Filter, ChevronRight, X,
  ExternalLink, Bell, Pin, MoreVertical, ArrowLeft, BookOpen, Share2,
  Lock, CheckCircle2, AlertTriangle, Layers, Megaphone, HelpCircle,
  Maximize2, Mic, MicOff, CornerUpLeft,
  CornerUpRight, Star, Copy, Trash2, Play, Pause, UserPlus, UserMinus,
  UserX, UserCheck, Image as ImageIcon, Camera, Smile, Info, Volume2,
  VolumeX, ChevronDown
} from 'lucide-react';
import './CampusConnect.css';
import { campusConnectStore } from '../../services/campusConnectStore';
import {
  playSentSound,
  playReceivedSound
} from '../../services/soundEffects.js';
import AcademicResourcesSection from './AcademicResourcesSection.jsx';
import LeadershipScoreboardSection from './LeadershipScoreboardSection.jsx';
import AnonymousComplaintsSection from './AnonymousComplaintsSection.jsx';

export default function CampusConnect({
  account,
  initialConversationId,
  initialCategory = 'All',
  initialView = 'chats',
  isDrawerMode = false,
  onNavigateToModule,
  onBack
}) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigateToModule) {
      onNavigateToModule('dashboard');
    } else if (typeof window !== 'undefined') {
      window.location.hash = 'dashboard';
    }
  };

  const [conversations, setConversations] = useState([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeView, setActiveView] = useState(() => {
    if (initialView) return initialView;
    if (initialCategory === 'Announcements') return 'announcements';
    return 'chats';
  });
  const [allAcademicRequests, setAllAcademicRequests] = useState([]);
  const [requestsFilter, setRequestsFilter] = useState('ALL');
  const [announcementsFilter, setAnnouncementsFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConvId, setActiveConvId] = useState(initialConversationId || 'conv-ds');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(Boolean(initialConversationId));
  
  // Modals & Drawers
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetRequestToUpload, setTargetRequestToUpload] = useState(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState(null);
  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [showMediaDrawer, setShowMediaDrawer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const [reportReason, setReportReason] = useState('Unverified information');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // WhatsApp States: Reply, Forward, Search In Chat, Dropdown Menu
  const [replyingTo, setReplyingTo] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [selectedForwardConvs, setSelectedForwardConvs] = useState([]);
  const [searchInChatOpen, setSearchInChatOpen] = useState(false);
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  // Voice Note Recording & Playback States
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordTime, setVoiceRecordTime] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const voiceAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const voiceTimerRef = useRef(null);
  const audioChunksRef = useRef([]);

  // File Upload Hidden Element Refs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const docInputRef = useRef(null);



  // Contacts Directory & Group Management States
  const [contactsSearch, setContactsSearch] = useState('');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupInfoDrawer, setShowGroupInfoDrawer] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);

  // Forms
  const [newContactForm, setNewContactForm] = useState({
    name: '',
    role: 'student',
    department: 'Computer Science & Engineering',
    phone: '',
    email: '',
    registrationNumber: ''
  });
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    category: 'Groups',
    description: '',
    selectedMemberIds: []
  });

  // Academic Request Form State
  const [requestForm, setRequestForm] = useState({
    subject: 'Data Structures',
    classTime: '10:00 AM',
    date: new Date().toISOString().split('T')[0],
    requestType: 'Request Notes',
    requestText: 'I missed today\'s class. Could someone please upload the verified lecture notes?'
  });

  // Resource Upload Form State (for fulfilling a request)
  const [uploadForm, setUploadForm] = useState({
    topic: '',
    fileName: 'Lecture_Notes.pdf',
    fileSize: '2.5 MB'
  });

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Format Helpers
  const formatVoiceTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatCallDuration = (secs = 0) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Load conversations & messages
  const loadData = () => {
    const role = account?.role || 'student';
    const list = campusConnectStore.getConversations(role, activeCategory, searchQuery);
    setConversations(list);

    if (activeConvId) {
      const msgs = campusConnectStore.getMessages(activeConvId);
      setMessages(msgs);
    }
  };

  const loadRequests = () => {
    if (campusConnectStore.getAllAcademicRequests) {
      setAllAcademicRequests(campusConnectStore.getAllAcademicRequests());
    }
  };

  useEffect(() => {
    loadData();
    loadRequests();

    const handleUpdate = () => {
      loadData();
      loadRequests();
    };

    window.addEventListener('campus_connect_updated', handleUpdate);
    return () => window.removeEventListener('campus_connect_updated', handleUpdate);
  }, [activeCategory, searchQuery, activeConvId]);

  // Real-time typing indicators
  useEffect(() => {
    const handleTypingEvent = (e) => {
      if (e.detail?.convId === activeConvId) {
        const users = campusConnectStore.getTypingUsers(activeConvId);
        const myName = account?.name || 'Student';
        setTypingUsers(users.filter(u => u !== myName));
      }
    };
    window.addEventListener('campus_connect_typing', handleTypingEvent);
    return () => window.removeEventListener('campus_connect_typing', handleTypingEvent);
  }, [activeConvId, account?.name]);



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      setMobileChatOpen(true);
    }
  }, [initialConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  }, [conversations]);

  const pendingRequestsCount = useMemo(() => {
    return allAcademicRequests.filter(r => r.status === 'WAITING_FOR_RESOURCE').length;
  }, [allAcademicRequests]);

  const activeConversation = useMemo(() => {
    return campusConnectStore.getConversationById(activeConvId) || conversations[0];
  }, [activeConvId, conversations]);

  // Categories list with Direct included
  const categories = [
    { id: 'All', label: 'All' },
    { id: 'Unread', label: 'Unread' },
    { id: 'Direct', label: 'Direct' },
    { id: 'Classes', label: 'Classes' },
    { id: 'Faculty', label: 'Faculty' },
    { id: 'Departments', label: 'Departments' },
    { id: 'Groups', label: 'Groups' },
    { id: 'Announcements', label: 'Announcements' },
    { id: 'Clubs', label: 'Clubs' },
  ];

  const handleSelectConversation = (conv) => {
    setActiveConvId(conv.id);
    setMobileChatOpen(true);
    setSearchInChatOpen(false);
    setChatSearchTerm('');
    campusConnectStore.markConversationRead(conv.id);
  };

  // Broadcast typing indicator
  const handleTyping = () => {
    const senderName = account?.name || 'Student';
    const senderId = account?.registrationNumber || account?.identity || '2305201001';
    campusConnectStore.setTyping(activeConvId, senderId, senderName, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      campusConnectStore.setTyping(activeConvId, senderId, senderName, false);
    }, 2500);
  };

  // Send text message (with reply support)
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const senderName = account?.name || 'Student';
    const senderRole = account?.role || 'student';
    const senderId = account?.registrationNumber || account?.identity || '2305201001';

    if (replyingTo) {
      campusConnectStore.replyMessage(activeConvId, inputText.trim(), replyingTo, {
        sender: senderName,
        senderRole,
        senderId,
        type: 'text'
      });
      setReplyingTo(null);
    } else {
      campusConnectStore.sendMessage(activeConvId, {
        sender: senderName,
        senderRole,
        senderId,
        text: inputText.trim(),
        type: 'text'
      });
    }

    campusConnectStore.setTyping(activeConvId, senderId, senderName, false);
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // File Upload Handler (Camera, Gallery Media, Documents)
  const handleFileUpload = (e, fileCategory = 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const senderName = account?.name || 'Student';
    const senderRole = account?.role || 'student';
    const senderId = account?.registrationNumber || account?.identity || '2305201001';
    const fileSizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      const resultDataUrl = reader.result;
      let msgType = 'document';
      if (file.type.startsWith('image/')) msgType = 'image';
      else if (file.type.startsWith('video/')) msgType = 'video';

      campusConnectStore.sendMessage(activeConvId, {
        sender: senderName,
        senderRole,
        senderId,
        text: file.name,
        type: msgType,
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileUrl: resultDataUrl,
        replyTo: replyingTo ? {
          id: replyingTo.id,
          sender: replyingTo.sender,
          text: replyingTo.text || 'Attachment'
        } : null
      });

      setReplyingTo(null);
      triggerToast(`✓ Sent ${fileCategory}: ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice Note Recording
  const startVoiceRecording = async () => {
    setIsRecordingVoice(true);
    setVoiceRecordTime(0);
    audioChunksRef.current = [];

    voiceTimerRef.current = setInterval(() => {
      setVoiceRecordTime(prev => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start();
      }
    } catch (err) {
      console.warn('Microphone access simulation:', err);
    }
  };

  const stopVoiceRecording = (shouldSend = true) => {
    if (voiceTimerRef.current) {
      clearInterval(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }

    const durationStr = formatVoiceTime(voiceRecordTime);
    const mr = mediaRecorderRef.current;

    const finalizeAndSend = (audioBlobOrData) => {
      if (shouldSend) {
        const senderName = account?.name || 'Student';
        const senderRole = account?.role || 'student';
        const senderId = account?.registrationNumber || account?.identity || '2305201001';

        campusConnectStore.sendMessage(activeConvId, {
          sender: senderName,
          senderRole,
          senderId,
          text: `🎤 Voice note (${durationStr})`,
          type: 'voice',
          duration: durationStr,
          audioUrl: audioBlobOrData || '',
          replyTo: replyingTo ? {
            id: replyingTo.id,
            sender: replyingTo.sender,
            text: replyingTo.text || 'Attachment'
          } : null
        });
        setReplyingTo(null);
        triggerToast('✓ Voice note sent!');
      }
      setIsRecordingVoice(false);
      setVoiceRecordTime(0);
      mediaRecorderRef.current = null;
    };

    if (mr && mr.state !== 'inactive') {
      mr.onstop = () => {
        let blobUrl = '';
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          blobUrl = URL.createObjectURL(blob);
        }
        finalizeAndSend(blobUrl);
        try {
          mr.stream?.getTracks().forEach(t => t.stop());
        } catch (e) {}
      };
      mr.stop();
    } else {
      finalizeAndSend('');
    }
  };

  const cancelVoiceRecording = () => {
    stopVoiceRecording(false);
    triggerToast('✕ Voice recording cancelled');
  };

  const handleTogglePlayVoice = (msg) => {
    if (playingVoiceId === msg.id) {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }

    if (msg.audioUrl) {
      const audio = new Audio(msg.audioUrl);
      voiceAudioRef.current = audio;
      setPlayingVoiceId(msg.id);
      audio.onended = () => setPlayingVoiceId(null);
      audio.onerror = () => {
        playSentSound();
        setTimeout(() => setPlayingVoiceId(null), 2500);
      };
      audio.play().catch(() => {
        playSentSound();
        setTimeout(() => setPlayingVoiceId(null), 2500);
      });
    } else {
      playSentSound();
      setPlayingVoiceId(msg.id);
      setTimeout(() => setPlayingVoiceId(null), 2500);
    }
  };



  // Message Actions (Reply, Forward, Star, Pin, Delete, Copy)
  const handleStartReply = (msg) => {
    setReplyingTo(msg);
  };

  const handleStartForward = (msg) => {
    setForwardingMessage(msg);
    setSelectedForwardConvs([]);
  };

  const handleSubmitForward = () => {
    if (!forwardingMessage || selectedForwardConvs.length === 0) return;
    campusConnectStore.forwardMessage(forwardingMessage, selectedForwardConvs);
    setForwardingMessage(null);
    setSelectedForwardConvs([]);
    triggerToast(`✓ Forwarded message to ${selectedForwardConvs.length} conversation(s)!`);
  };

  const handleToggleStar = (msg) => {
    const isStarred = campusConnectStore.toggleStarMessage(activeConvId, msg.id);
    triggerToast(isStarred ? '⭐ Message starred!' : 'Star removed');
  };

  const handleTogglePin = (msg) => {
    const isPinned = campusConnectStore.togglePinMessage(activeConvId, msg.id);
    triggerToast(isPinned ? '📌 Message pinned to channel banner!' : 'Message unpinned');
  };

  const handleDeleteMessage = (msg) => {
    campusConnectStore.deleteMessage(activeConvId, msg.id, true);
    triggerToast('🗑️ Message deleted for everyone');
  };

  const handleCopyMessage = (msg) => {
    if (msg.text) {
      navigator.clipboard.writeText(msg.text).catch(() => {});
      triggerToast('✓ Copied message to clipboard');
    }
  };

  const handleBlockUser = (targetId, targetName) => {
    campusConnectStore.blockUser(targetId);
    setChatMenuOpen(false);
    triggerToast(`🚫 Blocked ${targetName || 'user'}`);
  };

  const handleUnblockUser = (targetId) => {
    campusConnectStore.unblockUser(targetId);
    triggerToast('✓ Contact unblocked');
  };

  const handleStartDirectChat = (contact) => {
    const conv = campusConnectStore.getOrCreateDirectChat(contact);
    setActiveConvId(conv.id);
    setActiveView('chats');
    setMobileChatOpen(true);
    triggerToast(`Opened chat with ${contact.name}`);
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupForm.name.trim()) return;
    const group = campusConnectStore.createGroup({
      name: newGroupForm.name.trim(),
      category: newGroupForm.category,
      description: newGroupForm.description,
      memberIds: newGroupForm.selectedMemberIds,
      createdBy: account?.name || 'Student'
    });
    setShowCreateGroupModal(false);
    setNewGroupForm({ name: '', category: 'Groups', description: '', selectedMemberIds: [] });
    setActiveConvId(group.id);
    setActiveView('chats');
    setMobileChatOpen(true);
    triggerToast(`✓ Group "${group.name}" created successfully!`);
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactForm.name.trim() || !newContactForm.phone.trim()) return;
    const created = campusConnectStore.addContact(newContactForm);
    setShowAddContactModal(false);
    setNewContactForm({ name: '', role: 'student', department: 'Computer Science & Engineering', phone: '', email: '', registrationNumber: '' });
    triggerToast(`✓ Contact "${created.name}" added to Campus Directory!`);
  };

  // Add reaction
  const handleReaction = (msgId, emoji) => {
    campusConnectStore.addReaction(activeConvId, msgId, emoji);
  };

  // Submit Academic Request
  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const senderName = account?.name || 'Rakesh Das';
    const senderRoll = account?.registrationNumber || '2305201001';

    campusConnectStore.createAcademicRequest(activeConvId, {
      subject: requestForm.subject,
      classTime: requestForm.classTime,
      date: requestForm.date,
      requestType: requestForm.requestType,
      requestText: requestForm.requestText,
      studentName: senderName,
      studentRoll: senderRoll
    });

    setShowRequestModal(false);
    triggerToast('✓ Academic request posted in class group! Eligible classmates can upload notes.');
  };

  // Open Upload modal for specific request
  const handleOpenUploadForRequest = (reqMsg) => {
    setTargetRequestToUpload(reqMsg);
    setUploadForm({
      topic: `${reqMsg.academicRequest.subject} Lecture Notes (${reqMsg.academicRequest.date})`,
      fileName: `${reqMsg.academicRequest.subject.replace(/\s+/g, '_')}_Notes.pdf`,
      fileSize: '3.1 MB'
    });
    setShowUploadModal(true);
  };

  // Submit upload to fulfill request -> AUTOMATIC UPLOAD LOCK TRIGGERED
  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!targetRequestToUpload) return;

    const convId = targetRequestToUpload.conversationId || activeConvId;
    const reqMsgId = targetRequestToUpload.id;
    const innerReqId = targetRequestToUpload.academicRequest?.id || targetRequestToUpload.id;

    const uploaderName = account?.name || 'Rahul Sharma';
    const uploaderRoll = account?.registrationNumber || '2305201012';

    campusConnectStore.fulfillAcademicRequest(
      convId,
      reqMsgId,
      innerReqId,
      {
        uploaderName,
        uploaderRoll,
        fileTitle: uploadForm.fileName,
        fileUrl: '/sample_documents/sample_document.pdf',
        fileSize: uploadForm.fileSize,
        topicNotes: uploadForm.topic
      }
    );

    setShowUploadModal(false);
    setTargetRequestToUpload(null);
    triggerToast('🔒 Resource uploaded! Upload button is now locked to prevent duplicates. Awaiting faculty verification.');
  };

  const handleOpenUploadForReqItem = (req) => {
    setTargetRequestToUpload({
      id: req.id,
      conversationId: req.conversationId,
      academicRequest: {
        id: req.id,
        subject: req.subject,
        date: req.date
      }
    });
    setUploadForm({
      topic: `${req.subject} Lecture Notes (${req.date})`,
      fileName: `${req.subject.replace(/\s+/g, '_')}_Notes.pdf`,
      fileSize: '3.1 MB'
    });
    setShowUploadModal(true);
  };

  const handleVerifyRequestItem = (req) => {
    const facultyName = account?.name || 'Dr. S. Mohanty';
    campusConnectStore.verifyAcademicRequest(
      req.conversationId,
      req.id,
      req.id,
      facultyName
    );
    triggerToast('✓ Resource verified! Contributor received +10 Contribution Points on the Leaderboard.');
  };

  const handleRejectRequestItem = (req) => {
    const facultyName = account?.name || 'Dr. S. Mohanty';
    campusConnectStore.rejectAcademicRequest(
      req.conversationId,
      req.id,
      req.id,
      facultyName,
      'Resource requires clearer diagrams'
    );
    triggerToast('✕ Resource rejected and reopened for other students to contribute.');
  };

  // Faculty Verify
  const handleVerifyRequest = (msg) => {
    const facultyName = account?.name || 'Dr. S. Mohanty';
    campusConnectStore.verifyAcademicRequest(
      activeConvId,
      msg.id,
      msg.academicRequest.id,
      facultyName
    );
    triggerToast('✓ Resource verified! Contributor received +10 Contribution Points on the Leaderboard.');
  };

  // Faculty Reject
  const handleRejectRequest = (msg) => {
    const facultyName = account?.name || 'Dr. S. Mohanty';
    campusConnectStore.rejectAcademicRequest(
      activeConvId,
      msg.id,
      msg.academicRequest.id,
      facultyName,
      'Resource requires clearer diagrams'
    );
    triggerToast('✕ Resource rejected. Request reopened for other students to upload.');
  };


  // Global search execution
  const handleGlobalSearch = (val) => {
    setGlobalSearchTerm(val);
    if (!val.trim()) {
      setGlobalSearchResults(null);
      return;
    }
    const res = campusConnectStore.globalSearch(val);
    setGlobalSearchResults(res);
  };

  // Report message submit
  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportingMessage) return;

    campusConnectStore.reportContent({
      type: 'message',
      targetId: reportingMessage.id,
      conversation: activeConversation?.name || 'Channel',
      reason: reportReason
    });

    setShowReportModal(false);
    setReportingMessage(null);
    triggerToast('✓ Report recorded securely for administrator and faculty moderator review.');
  };

  const isFacultyOrAdmin = account?.role === 'faculty' || account?.role === 'admin' || account?.role === 'hod';

  return (
    <div className={`cc-container ${mobileChatOpen ? 'mobile-active-chat' : ''} ${isDrawerMode ? 'in-drawer' : ''}`}>
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 20,
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          color: '#38bdf8',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: 10,
          padding: '10px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 9999,
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          NAV RAIL: UNIFIED ACCESS TO ALL WHATSAPP CLONE MODULES
          ───────────────────────────────────────────────────────────── */}
      <nav className="cc-nav-rail">
        <div className="cc-rail-top">
          {!isDrawerMode && (
            <button
              type="button"
              className="cc-rail-btn cc-rail-back-btn"
              onClick={handleBack}
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={19} />
              <span className="cc-rail-tip">Back</span>
            </button>
          )}

          <div className="cc-rail-brand" title="Apna Campus Connect">
            <div className="cc-rail-brand-logo" style={{ background: '#ffffff', padding: '2px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Apna Campus" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
            </div>
          </div>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveView('chats')}
            title="Chats & Class Groups"
          >
            <MessageSquare size={19} />
            <span className="cc-rail-tip">Chats</span>
            {totalUnreadCount > 0 && <span className="cc-rail-pill">{totalUnreadCount}</span>}
          </button>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'announcements' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('announcements');
              setActiveCategory('Announcements');
            }}
            title="Official Announcements"
          >
            <Megaphone size={19} />
            <span className="cc-rail-tip">Notices</span>
            <span className="cc-rail-pill official">1</span>
          </button>



          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveView('contacts')}
            title="Campus Contacts Directory"
          >
            <Users size={19} />
            <span className="cc-rail-tip">Contacts</span>
          </button>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'starred' ? 'active' : ''}`}
            onClick={() => setActiveView('starred')}
            title="Starred Messages"
          >
            <Star size={19} />
            <span className="cc-rail-tip">Starred</span>
          </button>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveView('requests')}
            title="Missed Class & Academic Requests"
          >
            <Sparkles size={19} />
            <span className="cc-rail-tip">Requests</span>
            {pendingRequestsCount > 0 && <span className="cc-rail-pill amber">{pendingRequestsCount}</span>}
          </button>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveView('resources')}
            title="Shared Verified Resources"
          >
            <FileText size={19} />
            <span className="cc-rail-tip">Resources</span>
          </button>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'leadership' ? 'active' : ''}`}
            onClick={() => setActiveView('leadership')}
            title="Student Leadership Scoreboard"
          >
            <Award size={19} />
            <span className="cc-rail-tip">Rankings</span>
          </button>

          <button
            type="button"
            className={`cc-rail-btn ${activeView === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveView('complaints')}
            title="Secure Anonymous Grievances"
          >
            <ShieldCheck size={19} />
            <span className="cc-rail-tip">Grievance</span>
          </button>
        </div>

        <div className="cc-rail-bottom">
          <div className="cc-rail-user-avatar" title={`${account?.name || 'User'} (${account?.role || 'student'})`}>
            {account?.name ? account.name[0] : 'U'}
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          1. CHATS WORKSPACE (TWO-PANEL INTERFACE)
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'chats' && (
        <>
          <aside className="cc-left-panel">
        <div className="cc-left-header">
          <div className="cc-brand-row">
            {!isDrawerMode && (
              <button
                type="button"
                className="cc-back-btn-header"
                onClick={handleBack}
                title="Back to Dashboard"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="cc-brand-title">
              <div className="cc-brand-logo" style={{ background: '#ffffff', padding: '2px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="Apna Campus" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div className="cc-brand-text">
                <h2>Campus Connect</h2>
                <p>Apna Campus Connected Hub</p>
              </div>
            </div>
            <div className="cc-left-actions">
              <button
                type="button"
                className="cc-action-icon-btn"
                title="Global Search Everything"
                onClick={() => setShowGlobalSearch(true)}
              >
                <Search size={16} />
              </button>
              <button
                type="button"
                className="cc-action-icon-btn"
                title="Campus Directory"
                onClick={() => setActiveView('contacts')}
              >
                <Users size={16} />
              </button>
              <button
                type="button"
                className="cc-action-icon-btn"
                title="Create New Group"
                onClick={() => setShowCreateGroupModal(true)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="cc-search-wrap">
            <Search size={15} className="cc-search-icon" />
            <input
              type="text"
              className="cc-search-input"
              placeholder="Search conversations, classes, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="cc-search-clear" onClick={() => setSearchQuery('')}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="cc-categories-scroll">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cc-category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="cc-conv-list">
          {conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '0.85rem' }}>
              <p>No conversations found in this category.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  className={`cc-conv-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="cc-conv-avatar-wrap">
                    <div className="cc-conv-avatar" style={{ background: conv.avatarBg || '#2563eb' }}>
                      {conv.avatar || '💬'}
                    </div>
                    {conv.onlineCount > 0 && <span className="cc-online-dot" />}
                  </div>

                  <div className="cc-conv-info">
                    <div className="cc-conv-top-line">
                      <h4 className="cc-conv-name">{conv.name}</h4>
                      {conv.lastMessage?.time && (
                        <span className="cc-conv-time">{conv.lastMessage.time}</span>
                      )}
                    </div>

                    <div className="cc-conv-bottom-line">
                      <p className="cc-conv-snippet">
                        {conv.lastMessage?.sender && (
                          <strong style={{ color: '#94a3b8' }}>{conv.lastMessage.sender.split(' ')[0]}: </strong>
                        )}
                        {conv.lastMessage?.text || 'Tap to view conversation'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="cc-unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>

                    <div className="cc-conv-tags">
                      {conv.code && <span className="cc-conv-tag">{conv.code}</span>}
                      {conv.semester && <span className="cc-conv-tag">{conv.semester}</span>}
                      {conv.isBroadcast && <span className="cc-conv-tag" style={{ color: '#f87171' }}>Official</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: ACTIVE CONVERSATION WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      <main className="cc-right-panel">
        {/* Chat Header */}
        <header className="cc-chat-header">
          <div className="cc-header-left">
            <button
              type="button"
              className="cc-mobile-back-btn"
              onClick={() => setMobileChatOpen(false)}
              title="Back to conversation list"
            >
              <ArrowLeft size={17} />
            </button>
            <div
              className="cc-chat-avatar"
              style={{ background: activeConversation?.avatarBg || '#2563eb', cursor: 'pointer' }}
              onClick={() => setShowGroupInfoDrawer(true)}
              title="View Group/Contact Details"
            >
              {activeConversation?.avatar || '💬'}
            </div>
            <div className="cc-chat-title-group" onClick={() => setShowGroupInfoDrawer(true)} style={{ cursor: 'pointer' }}>
              <h3>
                {activeConversation?.name || 'Class Group'}
                {activeConversation?.isClass && (
                  <span style={{ fontSize: '0.68rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    {activeConversation?.code || 'COURSE'}
                  </span>
                )}
                {activeConversation?.isBroadcast && (
                  <span style={{ fontSize: '0.68rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    BROADCAST CHANNEL
                  </span>
                )}
              </h3>
              <p className="cc-chat-sub">
                {typingUsers.length > 0 ? (
                  <span style={{ color: '#06b6d4', fontWeight: 600 }}>{typingUsers.join(', ')} is typing...</span>
                ) : (activeConversation?.isDirect || activeConversation?.category === 'Faculty' || activeConversation?.category === 'Direct') ? (
                  activeConversation?.status === 'online' ? (
                    <span className="cc-online-chip">Online</span>
                  ) : (
                    <span>Last seen today at 10:45 AM</span>
                  )
                ) : (
                  <>
                    {activeConversation?.membersCount && (
                      <span>{activeConversation?.membersCount} members</span>
                    )}
                    {activeConversation?.onlineCount && (
                      <span className="cc-online-chip">{activeConversation?.onlineCount} online</span>
                    )}
                    {activeConversation?.faculty && (
                      <span>• Faculty: {activeConversation?.faculty}</span>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="cc-header-actions">

            <button
              type="button"
              className={`cc-header-btn ${searchInChatOpen ? 'active' : ''}`}
              title="Search in this chat"
              onClick={() => setSearchInChatOpen(prev => !prev)}
            >
              <Search size={14} />
            </button>
            {activeConversation?.pinned && (
              <button
                type="button"
                className="cc-header-btn"
                title="View Pinned Deadlines"
                onClick={() => setShowPinnedDrawer(prev => !prev)}
              >
                <Pin size={14} /> Pinned
              </button>
            )}
            <button
              type="button"
              className="cc-header-btn"
              title="Shared Academic Resources"
              onClick={() => setShowMediaDrawer(prev => !prev)}
            >
              <FileText size={14} /> Resources
            </button>
            <button
              type="button"
              className="cc-header-btn highlight"
              title="Post Missed Class / Academic Request"
              onClick={() => {
                if (activeConversation?.subject) {
                  setRequestForm(prev => ({ ...prev, subject: activeConversation.subject }));
                }
                setShowRequestModal(true);
              }}
            >
              <Plus size={14} /> + Academic Request
            </button>

            {/* 3-dots Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="cc-header-btn"
                title="More Options"
                onClick={() => setChatMenuOpen(prev => !prev)}
              >
                <MoreVertical size={14} />
              </button>
              {chatMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 6,
                  background: '#1e293b',
                  border: '1px solid var(--cc-border)',
                  borderRadius: 10,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  zIndex: 200,
                  width: 200,
                  padding: '6px 0',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#f8fafc', padding: '8px 14px', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => { setChatMenuOpen(false); setShowGroupInfoDrawer(true); }}
                  >
                    <Info size={14} /> {activeConversation?.isDirect ? 'Contact Info' : 'Group Info'}
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#f8fafc', padding: '8px 14px', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => { setChatMenuOpen(false); setActiveView('starred'); }}
                  >
                    <Star size={14} /> Starred Messages
                  </button>

                  {activeConversation?.isDirect && (
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#f87171', padding: '8px 14px', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}
                      onClick={() => {
                        setChatMenuOpen(false);
                        const blocked = campusConnectStore.isUserBlocked(activeConversation?.id);
                        if (blocked) {
                          handleUnblockUser(activeConversation?.id);
                        } else {
                          handleBlockUser(activeConversation?.id, activeConversation?.name);
                        }
                      }}
                    >
                      <UserX size={14} /> {campusConnectStore.isUserBlocked(activeConversation?.id) ? 'Unblock User' : 'Block User'}
                    </button>
                  )}
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#f87171', padding: '8px 14px', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => {
                      setChatMenuOpen(false);
                      setReportingMessage({ id: 'channel-report', sender: activeConversation?.name || 'Channel', text: 'Report conversation or user' });
                      setShowReportModal(true);
                    }}
                  >
                    <Flag size={14} /> Report User/Channel
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* In-Chat Search Bar */}
        {searchInChatOpen && (
          <div className="cc-chat-search-bar">
            <div className="cc-chat-search-input-wrap">
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                className="cc-chat-search-input"
                placeholder="Search messages in this conversation..."
                value={chatSearchTerm}
                onChange={(e) => setChatSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            {chatSearchTerm && (
              <span className="cc-search-matches-chip">
                {campusConnectStore.searchMessagesInConversation(activeConvId, chatSearchTerm).length} matches
              </span>
            )}
            <button
              type="button"
              className="cc-action-icon-btn"
              onClick={() => {
                setSearchInChatOpen(false);
                setChatSearchTerm('');
              }}
              title="Close in-chat search"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Pinned Information Banner */}
        {activeConversation?.pinned && (
          <div className="cc-pinned-banner">
            <div className="cc-pinned-content">
              <span className="cc-pinned-tag">Pinned Deadlines</span>
              <span>{activeConversation?.pinned}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPinnedDrawer(true)}
              style={{ background: 'none', border: 'none', color: '#fde68a', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}
            >
              View all →
            </button>
          </div>
        )}

        {/* Message Scroll Area */}
        <div className="cc-messages-scroll">
          <div className="cc-date-separator">
            <span>Today · Academic Session 2026–27</span>
          </div>

          {(() => {
            const displayMessages = (searchInChatOpen && chatSearchTerm.trim())
              ? campusConnectStore.searchMessagesInConversation(activeConvId, chatSearchTerm)
              : messages;

            if (displayMessages.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <BookOpen size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    {searchInChatOpen && chatSearchTerm ? 'No matching messages found in this chat.' : 'No messages in this channel yet.'}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#475569' }}>
                    {searchInChatOpen && chatSearchTerm ? 'Try searching another keyword.' : 'Ask a question, share verified notes, or request missed lecture material.'}
                  </p>
                </div>
              );
            }

            return displayMessages.map((msg) => {
              const isOutgoing = msg.senderRole === (account?.role || 'student') && (
                msg.sender === account?.name || msg.senderId === (account?.registrationNumber || account?.identity)
              );

              // 1. Official University Announcement Card
              if (msg.type === 'official_announcement' && msg.announcement) {
                return (
                  <div key={msg.id} className="cc-msg-row broadcast-full">
                    <div className="cc-announcement-card">
                      <div className="cc-announcement-header">
                        <span className="cc-announcement-dept">
                          <Megaphone size={14} /> {msg.announcement.department}
                        </span>
                        <span className="cc-announcement-badge">{msg.announcement.badge}</span>
                      </div>
                      <h4 className="cc-announcement-title">{msg.announcement.title}</h4>
                      <p className="cc-announcement-body">{msg.announcement.body}</p>
                      <div className="cc-announcement-footer">
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Published on {msg.announcement.date} • {msg.sender}
                        </span>
                        <a
                          href={msg.announcement.actionUrl || '#'}
                          className="cc-announcement-btn"
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (msg.announcement.actionUrl?.startsWith('#') && onNavigateToModule) {
                              e.preventDefault();
                              onNavigateToModule(msg.announcement.actionUrl.replace('#', ''));
                            }
                          }}
                        >
                          <FileText size={14} /> {msg.announcement.actionLabel || 'View Document'}
                        </a>
                      </div>

                      {/* Reactions */}
                      <div className="cc-reactions-bar">
                        {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            type="button"
                            className="cc-reaction-chip"
                            onClick={() => handleReaction(msg.id, emoji)}
                          >
                            <span>{emoji}</span> <span>{count}</span>
                          </button>
                        ))}
                        <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '📢')}>+📢</button>
                        <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '👍')}>+👍</button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. Academic Resource Sharing Card
              if (msg.type === 'academic_resource' && msg.resource) {
                const res = msg.resource;
                return (
                  <div key={msg.id} className={`cc-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                    {!isOutgoing && (
                      <div className="cc-sender-avatar" style={{ background: '#0284c7' }}>
                        {msg.sender?.[0] || 'A'}
                      </div>
                    )}
                    <div className="cc-msg-bubble">
                      <div className="cc-msg-sender-line">
                        <span>{msg.sender}</span>
                        {msg.senderRole === 'faculty' && <span className="cc-role-badge faculty">Faculty</span>}
                      </div>
                      <p className="cc-msg-text">{msg.text}</p>

                      {/* Resource Card */}
                      <div className="cc-resource-card">
                        <div className="cc-resource-header">
                          <div className="cc-resource-icon">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h5 className="cc-resource-title">{res.title}</h5>
                            <p className="cc-resource-sub">{res.fileSize} • {res.fileType}</p>
                          </div>
                        </div>

                        <div className="cc-resource-meta-grid">
                          <div className="cc-resource-meta-item">
                            <strong>Subject</strong>
                            <span>{res.subject}</span>
                          </div>
                          <div className="cc-resource-meta-item">
                            <strong>Topic</strong>
                            <span>{res.topic}</span>
                          </div>
                          <div className="cc-resource-meta-item">
                            <strong>Uploaded By</strong>
                            <span>{res.uploadedBy}</span>
                          </div>
                          <div className="cc-resource-meta-item">
                            <strong>Verification</strong>
                            {res.verified ? (
                              <span className="cc-verification-badge verified">
                                <ShieldCheck size={12} /> Verified by {res.verifiedBy?.split(' ')[0]}
                              </span>
                            ) : (
                              <span className="cc-verification-badge pending">
                                <Clock size={12} /> Awaiting Faculty Review
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="cc-resource-actions">
                          <a
                            href={res.downloadUrl || '/sample_documents/sample_document.pdf'}
                            download={res.title}
                            className="cc-btn-download"
                          >
                            <Download size={14} /> Download Verified Resource
                          </a>
                        </div>
                      </div>

                      <div className="cc-msg-meta">
                        <span>{msg.time}</span>
                        {isOutgoing && <CheckCheck size={14} color="#38bdf8" />}
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                          title="Report content"
                          onClick={() => { setReportingMessage(msg); setShowReportModal(true); }}
                        >
                          <Flag size={11} />
                        </button>
                      </div>

                      {/* Reactions */}
                      <div className="cc-reactions-bar">
                        {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            type="button"
                            className="cc-reaction-chip"
                            onClick={() => handleReaction(msg.id, emoji)}
                          >
                            <span>{emoji}</span> <span>{count}</span>
                          </button>
                        ))}
                        <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '❤️')}>+❤️</button>
                        <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '👏')}>+👏</button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. Missed Class / Academic Request Card (With AUTOMATIC UPLOAD LOCK)
              if (msg.type === 'academic_request' && msg.academicRequest) {
                const req = msg.academicRequest;
                const isWaiting = req.status === 'WAITING_FOR_RESOURCE';
                const isUploaded = req.status === 'RESOURCE_UPLOADED';
                const isVerified = req.status === 'VERIFIED';

                return (
                  <div key={msg.id} className={`cc-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                    {!isOutgoing && (
                      <div className="cc-sender-avatar" style={{ background: '#d97706' }}>
                        {msg.sender?.[0] || 'S'}
                      </div>
                    )}
                    <div className="cc-msg-bubble" style={{ minWidth: 320 }}>
                      <div className="cc-msg-sender-line">
                        <span>{msg.sender}</span>
                        <span className="cc-role-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                          Academic Request
                        </span>
                      </div>

                      {/* Rich Request Box */}
                      <div className="cc-academic-request-card">
                        <div className="cc-request-top">
                          <span className="cc-request-kicker">
                            <BookOpen size={13} /> {req.requestType}
                          </span>
                          {isWaiting && (
                            <span className="cc-status-pill waiting">
                              <Clock size={12} /> 🟡 Waiting for Resource
                            </span>
                          )}
                          {isUploaded && (
                            <span className="cc-status-pill uploaded">
                              <Lock size={12} /> ⏳ Awaiting Faculty Verification
                            </span>
                          )}
                          {isVerified && (
                            <span className="cc-status-pill verified">
                              <CheckCircle2 size={12} /> ✓ Verified & Available
                            </span>
                          )}
                        </div>

                        <div className="cc-request-details-grid">
                          <div className="cc-req-meta-col">
                            <strong>Subject</strong>
                            <span>{req.subject}</span>
                          </div>
                          <div className="cc-req-meta-col">
                            <strong>Class Time</strong>
                            <span>{req.classTime}</span>
                          </div>
                          <div className="cc-req-meta-col">
                            <strong>Date</strong>
                            <span>{req.date}</span>
                          </div>
                        </div>

                        <p className="cc-request-message-quote">
                          "{req.requestText}"
                        </p>

                        {/* Automatic Upload Lock & Status Action Section */}
                        {isWaiting && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                              Eligible classmates who attended this class can upload the notes:
                            </p>
                            <button
                              type="button"
                              className="cc-btn-upload-notes"
                              onClick={() => handleOpenUploadForRequest(msg)}
                            >
                              <Plus size={15} /> [UPLOAD NOTES]
                            </button>
                          </div>
                        )}

                        {isUploaded && (
                          <div className="cc-lock-info-box">
                            <div>
                              <div className="cc-lock-badge locked">
                                <Lock size={14} />
                                <strong>Upload Locked: Resource uploaded by {req.uploadedBy?.name}</strong>
                              </div>
                              <p style={{ margin: '3px 0 0', fontSize: '0.71rem', color: '#94a3b8' }}>
                                File: <em>{req.uploadFile?.title}</em> • Duplicate uploads are disabled.
                              </p>
                            </div>
                            <span className="cc-upload-locked-btn" title="Upload disabled because resource was already submitted">
                              <Lock size={13} /> Locked
                            </span>
                          </div>
                        )}

                        {/* Faculty Verification Controls */}
                        {isUploaded && isFacultyOrAdmin && (
                          <div className="cc-faculty-verification-controls">
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', flex: 1 }}>
                              Faculty Review Required:
                            </span>
                            <button
                              type="button"
                              className="cc-btn-verify"
                              onClick={() => handleVerifyRequest(msg)}
                            >
                              <Check size={14} /> [VERIFY]
                            </button>
                            <button
                              type="button"
                              className="cc-btn-reject"
                              onClick={() => handleRejectRequest(msg)}
                            >
                              <X size={14} /> [REJECT]
                            </button>
                          </div>
                        )}

                        {/* When Verified */}
                        {isVerified && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 8, padding: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <ShieldCheck size={15} /> ✓ Faculty Verified by {req.verifiedBy}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Award size={13} /> 🏆 +10 Contribution Points
                              </span>
                            </div>
                            <a
                              href={req.uploadFile?.url || '/sample_documents/sample_document.pdf'}
                              download={req.uploadFile?.title}
                              className="cc-btn-download"
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              <Download size={14} /> Download Verified Notes ({req.uploadFile?.title})
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="cc-msg-meta">
                        <span>{msg.time}</span>
                        {isOutgoing && <CheckCheck size={14} color="#38bdf8" />}
                        <button
                          type="button"
                          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                          title="Report content"
                          onClick={() => { setReportingMessage(msg); setShowReportModal(true); }}
                        >
                          <Flag size={11} />
                        </button>
                      </div>

                      {/* Reactions */}
                      <div className="cc-reactions-bar">
                        {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            type="button"
                            className="cc-reaction-chip"
                            onClick={() => handleReaction(msg.id, emoji)}
                          >
                            <span>{emoji}</span> <span>{count}</span>
                          </button>
                        ))}
                        <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '💡')}>+💡</button>
                        <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '👍')}>+👍</button>
                      </div>
                    </div>
                  </div>
                );
              }

              // 4. Standard Text / Attachment / Voice Message
              return (
                <div key={msg.id} id={`msg-${msg.id}`} className={`cc-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                  {!isOutgoing && (
                    <div className="cc-sender-avatar" style={{ background: '#3b82f6' }}>
                      {msg.sender?.[0] || 'U'}
                    </div>
                  )}
                  <div className="cc-msg-bubble">
                    {/* Hover Action Menu */}
                    <div className="cc-msg-hover-actions">
                      <button type="button" className="cc-msg-action-btn" title="Reply" onClick={() => handleStartReply(msg)}>
                        <CornerUpLeft size={13} />
                      </button>
                      <button type="button" className="cc-msg-action-btn" title="Star message" onClick={() => handleToggleStar(msg)}>
                        <Star size={13} color={msg.starred ? '#facc15' : 'currentColor'} fill={msg.starred ? '#facc15' : 'none'} />
                      </button>
                      <button type="button" className="cc-msg-action-btn" title="Forward message" onClick={() => handleStartForward(msg)}>
                        <CornerUpRight size={13} />
                      </button>
                      <button type="button" className="cc-msg-action-btn" title="Copy text" onClick={() => handleCopyMessage(msg)}>
                        <Copy size={13} />
                      </button>
                      {isOutgoing && (
                        <button type="button" className="cc-msg-action-btn" title="Delete message" onClick={() => handleDeleteMessage(msg)}>
                          <Trash2 size={13} color="#f87171" />
                        </button>
                      )}
                    </div>

                    <div className="cc-msg-sender-line">
                      <span>{msg.sender}</span>
                      {msg.senderRole === 'faculty' && <span className="cc-role-badge faculty">Faculty</span>}
                      {msg.senderRole === 'admin' && <span className="cc-role-badge admin">Admin</span>}
                    </div>

                    {/* Forwarded Tag */}
                    {msg.forwarded && (
                      <div className="cc-msg-forwarded-tag">
                        <CornerUpRight size={11} /> Forwarded
                      </div>
                    )}

                    {/* Quoted Reply Block */}
                    {msg.replyTo && (
                      <div
                        className="cc-msg-quoted"
                        onClick={() => {
                          const el = document.getElementById(`msg-${msg.replyTo.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className="cc-msg-quoted-sender">{msg.replyTo.sender}</span>
                        <span className="cc-msg-quoted-text">{msg.replyTo.text}</span>
                      </div>
                    )}

                    {/* Deleted Message */}
                    {msg.deleted ? (
                      <p className="cc-msg-text" style={{ fontStyle: 'italic', color: '#64748b' }}>
                        {msg.text || '🚫 This message was deleted'}
                      </p>
                    ) : (
                      <>
                        {/* Voice Note Player */}
                        {(msg.type === 'voice' || msg.voiceNote) && (
                          <div className="cc-voice-player">
                            <button
                              type="button"
                              className="cc-voice-play-btn"
                              onClick={() => handleTogglePlayVoice(msg)}
                            >
                              {playingVoiceId === msg.id ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <div className="cc-voice-waveform">
                              {[10, 18, 14, 24, 12, 22, 16, 26, 20, 14, 18, 22, 15, 12].map((h, idx) => (
                                <div
                                  key={idx}
                                  className={`cc-voice-bar ${playingVoiceId === msg.id && idx < 7 ? 'active' : ''}`}
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>
                            <div className="cc-voice-meta">
                              <span>{msg.duration || '0:14'}</span>
                              <button type="button" className="cc-voice-speed-btn">1x</button>
                            </div>
                          </div>
                        )}

                        {/* Image Attachment Card */}
                        {(msg.type === 'image' || (msg.fileUrl && msg.type === 'image')) && (
                          <div
                            className="cc-msg-attachment-image"
                            onClick={() => setLightboxMedia({ url: msg.fileUrl, type: 'image', title: msg.text || 'Photo' })}
                          >
                            <img src={msg.fileUrl} alt={msg.text || 'Attached image'} />
                          </div>
                        )}

                        {/* Video Attachment Card */}
                        {msg.type === 'video' && (
                          <div className="cc-msg-attachment-video">
                            <video src={msg.fileUrl} controls />
                          </div>
                        )}

                        {/* Document Attachment Card */}
                        {(msg.type === 'document' || msg.type === 'file') && (
                          <div className="cc-msg-attachment-doc">
                            <div className="cc-doc-info">
                              <FileText size={20} color="#38bdf8" />
                              <div>
                                <div className="cc-doc-name">{msg.fileName || msg.text || 'Document.pdf'}</div>
                                <div className="cc-doc-size">{msg.fileSize || '1.5 MB'}</div>
                              </div>
                            </div>
                            <a
                              href={msg.fileUrl || '/sample_documents/sample_document.pdf'}
                              download={msg.fileName || 'document.pdf'}
                              className="cc-action-icon-btn"
                              title="Download document"
                            >
                              <Download size={14} />
                            </a>
                          </div>
                        )}

                        {/* Regular Text */}
                        {msg.type !== 'voice' && msg.text && (
                          <p className="cc-msg-text">{msg.text}</p>
                        )}
                      </>
                    )}

                    <div className="cc-msg-meta">
                      <span>{msg.time}</span>
                      {msg.starred && (
                        <Star size={11} className="cc-msg-starred-icon" fill="#facc15" color="#facc15" title="Starred message" />
                      )}
                      {isOutgoing && (
                        msg.status === 'read' ? (
                          <CheckCheck size={14} color="#38bdf8" title="Read (Double blue ticks)" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={14} color="#94a3b8" title="Delivered (Double grey ticks)" />
                        ) : (
                          <Check size={14} color="#94a3b8" title="Sent (Single grey tick)" />
                        )
                      )}
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'padding', padding: 0 }}
                        title="Report message"
                        onClick={() => { setReportingMessage(msg); setShowReportModal(true); }}
                      >
                        <Flag size={11} />
                      </button>
                    </div>

                    {/* Reactions */}
                    <div className="cc-reactions-bar">
                      {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          type="button"
                          className="cc-reaction-chip"
                          onClick={() => handleReaction(msg.id, emoji)}
                        >
                          <span>{emoji}</span> <span>{count}</span>
                        </button>
                      ))}
                      <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '👍')}>+👍</button>
                      <button type="button" className="cc-add-reaction-btn" onClick={() => handleReaction(msg.id, '❤️')}>+❤️</button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}

          {/* Typing Indicator Bubble at bottom of chat */}
          {typingUsers.length > 0 && (
            <div className="cc-typing-bubble">
              <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                {typingUsers.join(', ')} is typing
              </span>
              <div className="cc-typing-dots">
                <div className="cc-typing-dot" />
                <div className="cc-typing-dot" />
                <div className="cc-typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer */}
        <footer className="cc-composer">
          {/* Hidden File Inputs for Camera, Media Gallery, Documents */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, 'Camera Photo')}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, 'Gallery Media')}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e, 'Document')}
          />

          {/* Quoted Reply Bar Above Composer */}
          {replyingTo && (
            <div className="cc-composer-reply-bar">
              <div className="cc-reply-bar-content">
                <span className="cc-reply-bar-sender">Replying to {replyingTo.sender}</span>
                <span className="cc-reply-bar-text">{replyingTo.text || 'Attachment'}</span>
              </div>
              <button
                type="button"
                className="cc-reply-bar-close"
                onClick={() => setReplyingTo(null)}
                title="Cancel reply"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div className="cc-composer-top-actions">
            <button
              type="button"
              className="cc-comp-action-btn accent-request"
              onClick={() => {
                if (activeConversation?.subject) {
                  setRequestForm(prev => ({ ...prev, subject: activeConversation?.subject }));
                }
                setShowRequestModal(true);
              }}
            >
              <Sparkles size={13} /> + Academic Request (Missed Notes)
            </button>
            <button
              type="button"
              className="cc-comp-action-btn"
              onClick={() => docInputRef.current?.click()}
            >
              <Paperclip size={13} /> Document / PDF
            </button>
            <button
              type="button"
              className="cc-comp-action-btn"
              onClick={() => galleryInputRef.current?.click()}
            >
              <ImageIcon size={13} /> Photos & Videos
            </button>
            <button
              type="button"
              className="cc-comp-action-btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={13} /> Camera
            </button>
            <button
              type="button"
              className="cc-comp-action-btn"
              onClick={() => setShowEmojiPicker(prev => !prev)}
            >
              😊 Emoji
            </button>
          </div>

          {/* Quick Emoji Bar */}
          {showEmojiPicker && (
            <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
              {['👍', '❤️', '👏', '💡', '🔥', '📚', '🎯', '🙌', '✅'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6, fontSize: '1.1rem', cursor: 'pointer', padding: '4px 8px' }}
                  onClick={() => setInputText(prev => prev + ' ' + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Composer Body: Live Voice Recorder OR Blocked Notice OR Normal Input */}
          {isRecordingVoice ? (
            <div className="cc-recording-bar">
              <div className="cc-rec-indicator">
                <span className="cc-rec-dot" />
                <span className="cc-rec-timer">{formatVoiceTime(voiceRecordTime)}</span>
              </div>
              <div className="cc-rec-waveform-live">
                <span className="cc-rec-live-bar" />
                <span className="cc-rec-live-bar" />
                <span className="cc-rec-live-bar" />
                <span className="cc-rec-live-bar" />
                <span className="cc-rec-live-bar" />
                <span className="cc-rec-live-bar" />
              </div>
              <div className="cc-rec-actions">
                <button type="button" className="cc-rec-cancel-btn" onClick={cancelVoiceRecording}>
                  <X size={14} /> Cancel
                </button>
                <button type="button" className="cc-rec-send-btn" onClick={() => stopVoiceRecording(true)}>
                  <Send size={14} /> Send
                </button>
              </div>
            </div>
          ) : (activeConversation?.isDirect || activeConversation?.category === 'Faculty' || activeConversation?.category === 'Direct') && campusConnectStore.isUserBlocked(activeConversation?.id) ? (
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, textAlign: 'center', color: '#f87171', fontSize: '0.84rem' }}>
              You have blocked this contact. <button type="button" onClick={() => handleUnblockUser(activeConversation?.id)} style={{ background: 'none', border: 'none', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Tap to Unblock</button> to send messages.
            </div>
          ) : (
            <div className="cc-composer-input-row">
              <textarea
                className="cc-composer-textarea"
                placeholder={`Message ${activeConversation?.name || 'group'}... (Press Enter to send, Shift+Enter for new line)`}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              {!inputText.trim() ? (
                <button
                  type="button"
                  className="cc-btn-send"
                  style={{ background: '#0284c7' }}
                  onClick={startVoiceRecording}
                  title="Click to Record Voice Note"
                >
                  <Mic size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="cc-btn-send"
                  onClick={handleSendMessage}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          )}
        </footer>
      </main>
      </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. ANNOUNCEMENTS WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'announcements' && (
        <div className="cc-standalone-workspace">
          <div className="cc-announcements-hub">
            <div className="cc-requests-hero" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.05))', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
              <div className="cc-requests-hero-info">
                <div className="cc-requests-hero-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                  <Megaphone size={24} />
                </div>
                <div className="cc-requests-hero-text">
                  <h2>Official University Announcements & Broadcasts</h2>
                  <p>
                    Verified broadcast feeds from Examination Cell, Placement & Career Cell, Central Library, and Academic Departments.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cc-req-filter-btn active"
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => {
                  setActiveView('chats');
                  setActiveCategory('Announcements');
                }}
              >
                <MessageSquare size={15} /> Open Announcement Chats
              </button>
            </div>

            <div className="cc-requests-filters">
              {['ALL', 'EXAMINATION CELL', 'PLACEMENT & CAREER CELL', 'CENTRAL LIBRARY', 'CSE DEPARTMENT'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`cc-req-filter-btn ${announcementsFilter === f ? 'active' : ''}`}
                  onClick={() => setAnnouncementsFilter(f)}
                >
                  {f === 'ALL' ? 'All Broadcasts' : f}
                </button>
              ))}
            </div>

            <div className="cc-requests-list">
              {[
                {
                  id: 'ann-1',
                  dept: 'EXAMINATION CELL',
                  tag: 'URGENT CIRCULAR',
                  title: 'Midterm Examination Schedule Released - Fall 2026',
                  date: '06 October 2026',
                  body: 'All B.Tech Semester 5 students are advised that the midterm exam timetable is finalized. Reporting time: 09:30 AM in examination hall Block-C.',
                  attachment: 'Midterm_Exam_Schedule_Fall2026.pdf',
                  size: '1.8 MB',
                  convId: 'conv-exam-cell'
                },
                {
                  id: 'ann-2',
                  dept: 'PLACEMENT & CAREER CELL',
                  tag: 'CAMPUS DRIVE',
                  title: 'TCS Digital & Microsoft R&D On-Campus Drive Registration',
                  date: '05 October 2026',
                  body: 'Eligible candidates with CGPA >= 7.5 must submit their updated resume and portfolio before Friday 05:00 PM.',
                  attachment: 'TCS_Microsoft_Job_Description.pdf',
                  size: '2.4 MB',
                  convId: 'conv-placement'
                },
                {
                  id: 'ann-3',
                  dept: 'CENTRAL LIBRARY',
                  tag: 'RESOURCE ACCESS',
                  title: 'IEEE Xplore & Springer Digital Library Remote Access Credentials',
                  date: '04 October 2026',
                  body: 'Remote institutional credentials for IEEE Xplore, Springer Nature, and ACM Digital Library have been updated for 2026–27.',
                  attachment: 'Library_Digital_Access_Guide.pdf',
                  size: '1.2 MB',
                  convId: 'conv-library'
                },
                {
                  id: 'ann-4',
                  dept: 'CSE DEPARTMENT',
                  tag: 'ACADEMIC CIRCULAR',
                  title: 'Data Structures & Algorithms Laboratory Project Phase 1 Submission',
                  date: '03 October 2026',
                  body: 'All Section A & Section B teams must push their Git repository URL and design documentation for AVL Tree & Graph practicals.',
                  attachment: 'Lab_Project_Phase1_Guidelines.pdf',
                  size: '3.1 MB',
                  convId: 'conv-ds'
                }
              ]
                .filter(item => announcementsFilter === 'ALL' || item.dept === announcementsFilter)
                .map(ann => (
                  <div key={ann.id} className="cc-req-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="cc-req-card-top">
                      <div className="cc-req-subject-group">
                        <span className="cc-req-subject-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}>
                          <Megaphone size={12} style={{ display: 'inline', marginRight: 4 }} />
                          {ann.dept}
                        </span>
                        <h4 className="cc-req-title">{ann.title}</h4>
                      </div>
                      <span className="cc-req-meta-chip">
                        <Clock size={13} /> {ann.date}
                      </span>
                    </div>

                    <div className="cc-req-body">
                      <p className="cc-req-text" style={{ fontStyle: 'normal', color: '#e2e8f0' }}>{ann.body}</p>
                    </div>

                    {ann.attachment && (
                      <div className="cc-req-status-banner verified">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText size={18} color="#10b981" />
                          <div>
                            <strong style={{ fontSize: '0.84rem', color: '#f8fafc' }}>{ann.attachment}</strong>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{ann.size} • Official Verified Circular</span>
                          </div>
                        </div>
                        <a
                          href="/sample_documents/sample_document.pdf"
                          download={ann.attachment}
                          className="cc-res-card-btn"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700 }}
                        >
                          <Download size={14} /> Download
                        </a>
                      </div>
                    )}

                    <div className="cc-req-card-actions">
                      <button
                        type="button"
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#60a5fa', padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          setActiveView('chats');
                          setActiveConvId(ann.convId);
                          setMobileChatOpen(true);
                        }}
                      >
                        <MessageSquare size={13} /> Open Discussion Channel →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ACADEMIC REQUESTS HUB (MISSED CLASS NOTES & AUTOMATIC LOCK)
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'requests' && (
        <div className="cc-standalone-workspace">
          <div className="cc-requests-hub">
            <div className="cc-requests-hero">
              <div className="cc-requests-hero-info">
                <div className="cc-requests-hero-icon">
                  <Sparkles size={24} />
                </div>
                <div className="cc-requests-hero-text">
                  <h2>Missed Class & Academic Resource Requests</h2>
                  <p>
                    Missed a lecture? Request notes here without leaving the college system. Features the <strong>Automatic Upload Lock</strong> to prevent duplicate uploads until faculty verification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cc-header-btn highlight"
                style={{ padding: '10px 18px', fontSize: '0.84rem' }}
                onClick={() => setShowRequestModal(true)}
              >
                <Plus size={16} /> + Academic Request
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="cc-requests-stats-grid">
              <div className="cc-stat-card">
                <div className="cc-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <Layers size={18} />
                </div>
                <div className="cc-stat-info">
                  <p>Total Requests</p>
                  <h3>{allAcademicRequests.length}</h3>
                </div>
              </div>
              <div className="cc-stat-card">
                <div className="cc-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                  <Clock size={18} />
                </div>
                <div className="cc-stat-info">
                  <p>Waiting for Notes</p>
                  <h3>{allAcademicRequests.filter(r => r.status === 'WAITING_FOR_RESOURCE').length}</h3>
                </div>
              </div>
              <div className="cc-stat-card">
                <div className="cc-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd' }}>
                  <Lock size={18} />
                </div>
                <div className="cc-stat-info">
                  <p>Upload Locked</p>
                  <h3>{allAcademicRequests.filter(r => r.status === 'RESOURCE_UPLOADED').length}</h3>
                </div>
              </div>
              <div className="cc-stat-card">
                <div className="cc-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div className="cc-stat-info">
                  <p>Faculty Verified</p>
                  <h3>{allAcademicRequests.filter(r => r.status === 'VERIFIED').length}</h3>
                </div>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="cc-requests-filters">
              {[
                { id: 'ALL', label: `All Requests (${allAcademicRequests.length})` },
                { id: 'WAITING_FOR_RESOURCE', label: `Waiting for Notes (${allAcademicRequests.filter(r => r.status === 'WAITING_FOR_RESOURCE').length})` },
                { id: 'RESOURCE_UPLOADED', label: `Upload Locked (${allAcademicRequests.filter(r => r.status === 'RESOURCE_UPLOADED').length})` },
                { id: 'VERIFIED', label: `Faculty Verified (${allAcademicRequests.filter(r => r.status === 'VERIFIED').length})` },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`cc-req-filter-btn ${requestsFilter === f.id ? 'active' : ''}`}
                  onClick={() => setRequestsFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Request Cards List */}
            <div className="cc-requests-list">
              {allAcademicRequests
                .filter(r => requestsFilter === 'ALL' || r.status === requestsFilter)
                .map(req => (
                  <div key={req.id} className="cc-req-card">
                    <div className="cc-req-card-top">
                      <div className="cc-req-subject-group">
                        <span className="cc-req-subject-badge">{req.subject}</span>
                        <h4 className="cc-req-title">{req.requestType}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="cc-req-meta-chip">
                          <Clock size={13} /> {req.classTime} • {req.date}
                        </span>
                        <span className="cc-req-meta-chip">
                          <BookOpen size={13} /> {req.conversationName}
                        </span>
                      </div>
                    </div>

                    <div className="cc-req-body">
                      <p className="cc-req-text">"{req.requestText}"</p>
                      <p className="cc-req-author">
                        Requested by: <strong>{req.requesterName}</strong> {req.requesterRoll ? `(${req.requesterRoll})` : ''}
                      </p>
                    </div>

                    {/* Status Banner with Automatic Upload Lock Logic */}
                    {req.status === 'WAITING_FOR_RESOURCE' && (
                      <div className="cc-req-status-banner waiting">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={16} />
                          <div>
                            <strong>🟡 Waiting for Resource</strong>
                            <span style={{ fontSize: '0.74rem', display: 'block', opacity: 0.85 }}>
                              {req.requesterName} missed this class and requested notes.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="cc-req-upload-btn"
                          style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                          onClick={() => handleOpenUploadForReqItem(req)}
                        >
                          <Plus size={14} /> [UPLOAD NOTES]
                        </button>
                      </div>
                    )}

                    {req.status === 'RESOURCE_UPLOADED' && (
                      <div className="cc-req-status-banner locked">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Lock size={16} />
                          <div>
                            <strong>🔒 Upload Locked · Awaiting Faculty Verification</strong>
                            <span style={{ fontSize: '0.74rem', display: 'block', opacity: 0.85 }}>
                              ✓ Resource uploaded by <strong>{req.fulfilledBy}</strong> ({req.fulfilledFileName}). Duplicate uploads are locked.
                            </span>
                          </div>
                        </div>

                        {isFacultyOrAdmin && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              onClick={() => handleVerifyRequestItem(req)}
                            >
                              ✓ Verify
                            </button>
                            <button
                              type="button"
                              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                              onClick={() => handleRejectRequestItem(req)}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {req.status === 'VERIFIED' && (
                      <div className="cc-req-status-banner verified">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle2 size={16} />
                          <div>
                            <strong>✓ Faculty Verified</strong>
                            <span style={{ fontSize: '0.74rem', display: 'block', opacity: 0.85 }}>
                              Verified by <strong>{req.verifiedBy || 'Dr. S. Mohanty'}</strong>. Contributor earned +10 points. Available for download.
                            </span>
                          </div>
                        </div>
                        <a
                          href="/sample_documents/sample_document.pdf"
                          download={req.fulfilledFileName || 'Lecture_Notes.pdf'}
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, background: '#10b981', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: '0.76rem', fontWeight: 700 }}
                        >
                          <Download size={14} /> Download File
                        </a>
                      </div>
                    )}

                    <div className="cc-req-card-actions">
                      <button
                        type="button"
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#60a5fa', padding: '6px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        onClick={() => {
                          setActiveView('chats');
                          setActiveConvId(req.conversationId);
                          setMobileChatOpen(true);
                        }}
                      >
                        <MessageSquare size={13} /> Open Class Chat ({req.conversationName}) →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SHARED RESOURCES WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'resources' && (
        <div className="cc-standalone-workspace" style={{ padding: '20px' }}>
          <AcademicResourcesSection
            onOpenClassChat={(convId) => {
              setActiveView('chats');
              setActiveConvId(convId);
              setMobileChatOpen(true);
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. LEADERSHIP & RECOGNITION WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'leadership' && (
        <div className="cc-standalone-workspace" style={{ padding: '20px' }}>
          <LeadershipScoreboardSection account={account} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. ANONYMOUS COMPLAINTS WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'complaints' && (
        <div className="cc-standalone-workspace" style={{ padding: '20px' }}>
          <AnonymousComplaintsSection />
        </div>
      )}



      {/* ─────────────────────────────────────────────────────────────
          8. CAMPUS CONTACTS & DIRECTORY WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'contacts' && (
        <div className="cc-standalone-workspace">
          <div className="cc-contacts-view">
            <div className="cc-hub-header">
              <h2>
                <Users size={24} color="#38bdf8" />
                Campus Contacts Directory
              </h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cc-req-filter-btn active"
                  onClick={() => setShowAddContactModal(true)}
                >
                  <UserPlus size={14} /> + Add Contact
                </button>
                <button
                  type="button"
                  className="cc-req-filter-btn"
                  onClick={() => setShowCreateGroupModal(true)}
                  style={{ background: '#2563eb', color: '#fff', border: 'none' }}
                >
                  <Users size={14} /> + New Group
                </button>
              </div>
            </div>

            {/* Contacts Search Bar */}
            <div className="cc-search-wrap" style={{ margin: '0 0 20px 0' }}>
              <Search size={15} className="cc-search-icon" />
              <input
                type="text"
                className="cc-search-input"
                placeholder="Search campus contacts by name, registration roll, department, or phone..."
                value={contactsSearch}
                onChange={(e) => setContactsSearch(e.target.value)}
              />
              {contactsSearch && (
                <button type="button" className="cc-search-clear" onClick={() => setContactsSearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="cc-contacts-list">
              {campusConnectStore.getContacts(contactsSearch).map((contact) => (
                <div key={contact.id} className="cc-contact-card">
                  <div className="cc-contact-card-left">
                    <div className="cc-conv-avatar-wrap">
                      <div className="cc-conv-avatar" style={{ background: contact.avatarBg || '#0284c7' }}>
                        {contact.avatar || '👤'}
                      </div>
                      {contact.status === 'online' && <span className="cc-online-dot" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{contact.name}</strong>
                        <span className={`cc-role-badge ${contact.role}`}>{contact.role}</span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                        {contact.designation || contact.registrationNumber} • {contact.department}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                        {contact.phone} • {contact.email}
                      </p>
                    </div>
                  </div>

                  <div className="cc-contact-actions">
                    <button
                      type="button"
                      className="cc-req-filter-btn active"
                      style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={() => handleStartDirectChat(contact)}
                      title="Direct 1-to-1 Chat"
                    >
                      <MessageSquare size={13} /> Chat
                    </button>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. STARRED MESSAGES WORKSPACE
          ───────────────────────────────────────────────────────────── */}
      {activeView === 'starred' && (
        <div className="cc-standalone-workspace">
          <div className="cc-starred-view">
            <div className="cc-hub-header">
              <h2>
                <Star size={24} color="#facc15" fill="#facc15" />
                Starred Messages
              </h2>
            </div>

            <div className="cc-starred-list">
              {campusConnectStore.getStarredMessages().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Star size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p>No starred messages yet. Hover over any important exam notice or lecture note in chat to star it!</p>
                </div>
              ) : (
                campusConnectStore.getStarredMessages().map((msg) => (
                  <div key={msg.id} className="cc-contact-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.2rem' }}>{msg.conversationAvatar}</span>
                        <div>
                          <strong style={{ color: '#38bdf8', fontSize: '0.88rem' }}>{msg.conversationName}</strong>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: 8 }}>by {msg.sender} • {msg.time}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="cc-action-icon-btn"
                          title="Remove star"
                          onClick={() => handleToggleStar(msg)}
                        >
                          <Star size={14} color="#facc15" fill="#facc15" />
                        </button>
                        <button
                          type="button"
                          className="cc-req-filter-btn"
                          style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                          onClick={() => {
                            setActiveConvId(msg.conversationId);
                            setActiveView('chats');
                            setMobileChatOpen(true);
                          }}
                        >
                          Open Chat →
                        </button>
                      </div>
                    </div>
                    <div style={{ background: '#0b0f19', padding: '10px 14px', borderRadius: 8, fontSize: '0.84rem', color: '#e2e8f0' }}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: CREATE ACADEMIC REQUEST (MISSED CLASS NOTES)
          ───────────────────────────────────────────────────────────── */}
      {showRequestModal && (
        <div className="cc-modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="cc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Sparkles size={18} color="#f59e0b" />
                + Academic Request (Missed Lecture Notes)
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowRequestModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitRequest}>
              <div className="cc-modal-body">
                <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10, padding: 12, fontSize: '0.8rem', color: '#fde68a' }}>
                  <strong>How Academic Requests Work:</strong> When you miss a class, submit a request here instead of asking on external WhatsApp groups. Eligible classmates can upload the notes. Once one student uploads, the button locks to prevent duplicates until verified by faculty.
                </div>

                <div className="cc-form-group">
                  <label>Request Type</label>
                  <select
                    className="cc-form-select"
                    value={requestForm.requestType}
                    onChange={(e) => setRequestForm({ ...requestForm, requestType: e.target.value })}
                  >
                    <option value="Request Notes">Request Lecture Notes</option>
                    <option value="Request Assignment">Request Assignment Problem Sheet</option>
                    <option value="Request Lab Manual">Request Lab Manual / Experiment Steps</option>
                    <option value="Request Question Paper">Request Previous Year Question Paper</option>
                    <option value="Request Recorded Lecture">Request Recorded Lecture / Slide Deck</option>
                    <option value="Request Other Resource">Request Other Study Resource</option>
                  </select>
                </div>

                <div className="cc-form-group">
                  <label>Subject</label>
                  <select
                    className="cc-form-select"
                    value={requestForm.subject}
                    onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                  >
                    <option value="Data Structures">Data Structures (CS501)</option>
                    <option value="Artificial Intelligence">Artificial Intelligence (CS505)</option>
                    <option value="Database Management System">Database Management System (CS502)</option>
                    <option value="Operating Systems">Operating Systems (CS504)</option>
                    <option value="Computer Networks">Computer Networks (CS503)</option>
                    <option value="Mathematics III">Mathematics III (MA501)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="cc-form-group">
                    <label>Class Slot / Time</label>
                    <input
                      type="text"
                      className="cc-form-input"
                      value={requestForm.classTime}
                      onChange={(e) => setRequestForm({ ...requestForm, classTime: e.target.value })}
                      placeholder="e.g. 10:00 AM"
                    />
                  </div>
                  <div className="cc-form-group">
                    <label>Class Date</label>
                    <input
                      type="date"
                      className="cc-form-input"
                      value={requestForm.date}
                      onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cc-form-group">
                  <label>Request Details / Specific Topics Missed</label>
                  <textarea
                    className="cc-form-textarea"
                    rows={3}
                    value={requestForm.requestText}
                    onChange={(e) => setRequestForm({ ...requestForm, requestText: e.target.value })}
                    placeholder="Describe what part of class or topic notes you need..."
                    required
                  />
                </div>
              </div>

              <div className="cc-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setShowRequestModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cc-btn-upload-notes"
                  style={{ color: '#000' }}
                >
                  <Sparkles size={14} /> Post Academic Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: UPLOAD REQUESTED RESOURCE (TRIGGERS AUTOMATIC LOCK)
          ───────────────────────────────────────────────────────────── */}
      {showUploadModal && targetRequestToUpload && (
        <div className="cc-modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="cc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Lock size={18} color="#06b6d4" />
                Upload Notes for: {targetRequestToUpload.academicRequest.subject}
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowUploadModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitUpload}>
              <div className="cc-modal-body">
                <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 10, padding: 12, fontSize: '0.8rem', color: '#93c5fd' }}>
                  <strong>Automatic Upload Lock:</strong> Once you submit these notes, the upload slot will automatically lock so other students do not upload duplicate files. After faculty verification, you will earn <strong>+10 Contribution Points</strong> on the Leadership Scoreboard!
                </div>

                <div className="cc-form-group">
                  <label>Subject & Class Session</label>
                  <input
                    type="text"
                    className="cc-form-input"
                    value={`${targetRequestToUpload.academicRequest.subject} · ${targetRequestToUpload.academicRequest.date} (${targetRequestToUpload.academicRequest.classTime})`}
                    disabled
                  />
                </div>

                <div className="cc-form-group">
                  <label>Topic / Lecture Covered</label>
                  <input
                    type="text"
                    className="cc-form-input"
                    value={uploadForm.topic}
                    onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="cc-form-group">
                  <label>File Name</label>
                  <input
                    type="text"
                    className="cc-form-input"
                    value={uploadForm.fileName}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                    required
                  />
                </div>

                <div style={{ padding: '14px', border: '2px dashed var(--cc-border-strong)', borderRadius: 10, textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                  <FileText size={28} style={{ color: '#38bdf8', margin: '0 auto 6px auto' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>sample_lecture_notes_verified.pdf</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>PDF Document • 3.1 MB • Ready to submit</p>
                </div>
              </div>

              <div className="cc-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cc-btn-download"
                  style={{ width: 'auto', padding: '8px 16px' }}
                >
                  <Lock size={14} /> Submit & Lock Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: GLOBAL CHAT SEARCH EVERYTHING
          ───────────────────────────────────────────────────────────── */}
      {showGlobalSearch && (
        <div className="cc-modal-overlay" onClick={() => setShowGlobalSearch(false)}>
          <div className="cc-modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Search size={18} color="#38bdf8" />
                Global Campus Search
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowGlobalSearch(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="cc-modal-body">
              <div className="cc-search-wrap" style={{ margin: 0 }}>
                <Search size={16} className="cc-search-icon" />
                <input
                  type="text"
                  className="cc-search-input"
                  placeholder="Search across messages, students, faculty, groups, files, announcements, academic requests..."
                  value={globalSearchTerm}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {globalSearchResults && (
                <div className="cc-search-results-box">
                  {/* Channels / Groups */}
                  {globalSearchResults.conversations?.length > 0 && (
                    <div>
                      <p className="cc-search-section-title">Class Groups & Channels ({globalSearchResults.conversations.length})</p>
                      {globalSearchResults.conversations.map(c => (
                        <div
                          key={c.id}
                          className="cc-search-result-item"
                          onClick={() => {
                            setActiveConvId(c.id);
                            setShowGlobalSearch(false);
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.2rem' }}>{c.avatar}</span>
                            <div>
                              <strong>{c.name}</strong>
                              <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>{c.category} • {c.department}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} color="#64748b" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Messages */}
                  {globalSearchResults.messages?.length > 0 && (
                    <div>
                      <p className="cc-search-section-title">Messages ({globalSearchResults.messages.length})</p>
                      {globalSearchResults.messages.map(m => (
                        <div
                          key={m.id}
                          className="cc-search-result-item"
                          onClick={() => {
                            setActiveConvId(m.conversationId);
                            setShowGlobalSearch(false);
                          }}
                        >
                          <div>
                            <strong style={{ color: '#38bdf8', fontSize: '0.78rem' }}>{m.conversationName} • {m.sender}</strong>
                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#e2e8f0' }}>{m.text}</p>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.time}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Shared Resources */}
                  {globalSearchResults.resources?.length > 0 && (
                    <div>
                      <p className="cc-search-section-title">Academic Files & Notes ({globalSearchResults.resources.length})</p>
                      {globalSearchResults.resources.map(r => (
                        <div key={r.id} className="cc-search-result-item">
                          <div>
                            <strong>{r.title}</strong>
                            <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                              {r.subject} • Uploaded by {r.uploadedBy} • {r.verified ? '✓ Verified' : 'Pending'}
                            </p>
                          </div>
                          <a
                            href={r.downloadUrl || '/sample_documents/sample_document.pdf'}
                            download={r.title}
                            className="cc-action-icon-btn"
                            title="Download"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {globalSearchResults.conversations?.length === 0 &&
                   globalSearchResults.messages?.length === 0 &&
                   globalSearchResults.resources?.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                      No matches found for "{globalSearchTerm}".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: PINNED DEADLINES DRAWER
          ───────────────────────────────────────────────────────────── */}
      {showPinnedDrawer && (
        <div className="cc-modal-overlay" onClick={() => setShowPinnedDrawer(false)}>
          <div className="cc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Pin size={18} color="#f59e0b" />
                Pinned Information & Deadlines — {activeConversation?.name}
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowPinnedDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="cc-modal-body">
              <div style={{ background: '#1e293b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10, padding: 12 }}>
                <span className="cc-pinned-tag" style={{ marginBottom: 6, display: 'inline-block' }}>Notice</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#fde68a', lineHeight: 1.45 }}>
                  {activeConversation?.pinned}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--cc-border)', borderRadius: 8 }}>
                  <strong style={{ fontSize: '0.78rem', color: '#38bdf8' }}>📌 Assignment 3 Submission:</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>Friday, 11:59 PM via Student Portal upload.</p>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--cc-border)', borderRadius: 8 }}>
                  <strong style={{ fontSize: '0.78rem', color: '#38bdf8' }}>📌 Midterm Examination:</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>15 October 2026, 10:00 AM (Room 204).</p>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--cc-border)', borderRadius: 8 }}>
                  <strong style={{ fontSize: '0.78rem', color: '#38bdf8' }}>📌 Lab Record Check:</strong>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>Thursday during regular practical hours.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 5: SHARED ACADEMIC RESOURCES DRAWER
          ───────────────────────────────────────────────────────────── */}
      {showMediaDrawer && (
        <div className="cc-modal-overlay" onClick={() => setShowMediaDrawer(false)}>
          <div className="cc-modal-box" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <FileText size={18} color="#06b6d4" />
                Shared Academic Resources — {activeConversation?.name}
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowMediaDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="cc-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {campusConnectStore.getAllSharedResources().map((res) => (
                  <div
                    key={res.id}
                    style={{
                      background: '#1e293b',
                      border: '1px solid var(--cc-border)',
                      borderRadius: 10,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="cc-resource-icon">
                        <FileText size={18} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.86rem', color: '#fff' }}>{res.title}</strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                          {res.subject} • {res.uploadedBy} • {res.date}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {res.verified && (
                        <span className="cc-verification-badge verified">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      )}
                      <a
                        href={res.downloadUrl || '/sample_documents/sample_document.pdf'}
                        download={res.title}
                        className="cc-action-icon-btn"
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 6: REPORT CONTENT (MODERATION)
          ───────────────────────────────────────────────────────────── */}
      {showReportModal && reportingMessage && (
        <div className="cc-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="cc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Flag size={18} color="#f43f5e" />
                Report Message to University Moderator
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowReportModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitReport}>
              <div className="cc-modal-body">
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
                  Reporting message by <strong>{reportingMessage.sender}</strong>:
                </p>
                <div style={{ background: '#0b0f19', padding: '10px 12px', borderRadius: 8, fontStyle: 'italic', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  "{reportingMessage.text}"
                </div>

                <div className="cc-form-group">
                  <label>Select Reason</label>
                  <select
                    className="cc-form-select"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Unverified exam / academic rumor">Unverified exam / academic rumor</option>
                    <option value="Incorrect or misleading notes">Incorrect or misleading notes</option>
                    <option value="Inappropriate language or conduct">Inappropriate language or conduct</option>
                    <option value="Spam or irrelevant advertising">Spam or irrelevant advertising</option>
                    <option value="Other grievance">Other grievance</option>
                  </select>
                </div>
              </div>

              <div className="cc-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#e11d48', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────


      {/* ─────────────────────────────────────────────────────────────
          WHATSAPP OVERLAY 3: FULLSCREEN MEDIA LIGHTBOX
          ───────────────────────────────────────────────────────────── */}
      {lightboxMedia && (
        <div className="cc-lightbox-modal" onClick={() => setLightboxMedia(null)}>
          <button type="button" className="cc-lightbox-close" onClick={() => setLightboxMedia(null)} title="Close preview">
            <X size={20} />
          </button>
          <img src={lightboxMedia.url} alt={lightboxMedia.title || 'Preview'} className="cc-lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WHATSAPP MODAL 4: FORWARD MESSAGE
          ───────────────────────────────────────────────────────────── */}
      {forwardingMessage && (
        <div className="cc-modal-overlay" onClick={() => setForwardingMessage(null)}>
          <div className="cc-modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <CornerUpRight size={18} color="#38bdf8" />
                Forward Message
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setForwardingMessage(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="cc-modal-body">
              <div style={{ background: '#0b0f19', padding: '10px 14px', borderRadius: 8, fontSize: '0.82rem', color: '#cbd5e1', borderLeft: '3px solid #06b6d4' }}>
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: 2 }}>{forwardingMessage.sender}</strong>
                <span>{forwardingMessage.text || 'Attached Media'}</span>
              </div>

              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Select Chats / Groups:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                {conversations.map(c => {
                  const isSelected = selectedForwardConvs.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: isSelected ? 'rgba(59, 130, 246, 0.2)' : '#1e293b',
                        border: isSelected ? '1px solid #3b82f6' : '1px solid var(--cc-border)',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedForwardConvs(prev =>
                          prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                        );
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.2rem' }}>{c.avatar}</span>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{c.name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>{c.category}</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="cc-modal-footer">
              <button
                type="button"
                style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => setForwardingMessage(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cc-btn-download"
                style={{ width: 'auto', padding: '8px 18px' }}
                disabled={selectedForwardConvs.length === 0}
                onClick={handleSubmitForward}
              >
                <Send size={14} /> Forward ({selectedForwardConvs.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WHATSAPP MODAL 5: CREATE NEW GROUP
          ───────────────────────────────────────────────────────────── */}
      {showCreateGroupModal && (
        <div className="cc-modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="cc-modal-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Users size={18} color="#2563eb" />
                Create New Campus Group / Study Circle
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowCreateGroupModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="cc-modal-body">
                <div className="cc-form-group">
                  <label>Group Name</label>
                  <input
                    type="text"
                    className="cc-form-input"
                    placeholder="e.g. AI Project Team Alpha, Robotics Club, etc."
                    value={newGroupForm.name}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="cc-form-group">
                  <label>Category</label>
                  <select
                    className="cc-form-select"
                    value={newGroupForm.category}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, category: e.target.value })}
                  >
                    <option value="Classes">Classes / Academics</option>
                    <option value="Groups">Study Groups</option>
                    <option value="Clubs">Clubs & Societies</option>
                    <option value="Projects">Final Year Projects</option>
                  </select>
                </div>

                <div className="cc-form-group">
                  <label>Group Description</label>
                  <textarea
                    className="cc-form-textarea"
                    rows={2}
                    placeholder="Describe the purpose or subject for this group..."
                    value={newGroupForm.description}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, description: e.target.value })}
                  />
                </div>

                <div className="cc-form-group">
                  <label>Select Initial Members ({newGroupForm.selectedMemberIds.length} selected)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', background: '#0b0f19', padding: 8, borderRadius: 8 }}>
                    {campusConnectStore.getContacts().map(ct => {
                      const isChecked = newGroupForm.selectedMemberIds.includes(ct.id);
                      return (
                        <div
                          key={ct.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: isChecked ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                            borderRadius: 6,
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setNewGroupForm(prev => ({
                              ...prev,
                              selectedMemberIds: isChecked
                                ? prev.selectedMemberIds.filter(id => id !== ct.id)
                                : [...prev.selectedMemberIds, ct.id]
                            }));
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{ct.avatar}</span>
                            <div>
                              <strong style={{ fontSize: '0.84rem', color: '#fff' }}>{ct.name}</strong>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: 6 }}>({ct.role})</span>
                            </div>
                          </div>
                          <input type="checkbox" checked={isChecked} onChange={() => {}} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="cc-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setShowCreateGroupModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cc-btn-download"
                  style={{ width: 'auto', padding: '8px 18px', background: '#2563eb' }}
                >
                  <Users size={14} /> Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WHATSAPP MODAL 6: ADD CONTACT TO DIRECTORY
          ───────────────────────────────────────────────────────────── */}
      {showAddContactModal && (
        <div className="cc-modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="cc-modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <UserPlus size={18} color="#38bdf8" />
                Add New Campus Contact
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowAddContactModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddContact}>
              <div className="cc-modal-body">
                <div className="cc-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="cc-form-input"
                    placeholder="e.g. Dr. A. Jena or Somya Ranjan"
                    value={newContactForm.name}
                    onChange={(e) => setNewContactForm({ ...newContactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="cc-form-group">
                    <label>Role</label>
                    <select
                      className="cc-form-select"
                      value={newContactForm.role}
                      onChange={(e) => setNewContactForm({ ...newContactForm, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Administrator</option>
                      <option value="hod">HOD</option>
                    </select>
                  </div>
                  <div className="cc-form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      className="cc-form-input"
                      value={newContactForm.department}
                      onChange={(e) => setNewContactForm({ ...newContactForm, department: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="cc-form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="cc-form-input"
                      placeholder="+91 98765 43210"
                      value={newContactForm.phone}
                      onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="cc-form-group">
                    <label>Roll / ID (Optional)</label>
                    <input
                      type="text"
                      className="cc-form-input"
                      placeholder="e.g. 2305201015"
                      value={newContactForm.registrationNumber}
                      onChange={(e) => setNewContactForm({ ...newContactForm, registrationNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cc-form-group">
                  <label>Campus Email</label>
                  <input
                    type="email"
                    className="cc-form-input"
                    placeholder="user@apnacampus.edu.in"
                    value={newContactForm.email}
                    onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="cc-modal-footer">
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                  onClick={() => setShowAddContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cc-btn-download"
                  style={{ width: 'auto', padding: '8px 18px', background: '#0284c7' }}
                >
                  <UserPlus size={14} /> Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          WHATSAPP DRAWER 7: GROUP INFO / CONTACT DETAILS DRAWER
          ───────────────────────────────────────────────────────────── */}
      {showGroupInfoDrawer && (
        <div className="cc-modal-overlay" onClick={() => setShowGroupInfoDrawer(false)}>
          <div className="cc-modal-box" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3>
                <Info size={18} color="#38bdf8" />
                {activeConversation?.isDirect ? 'Contact Info' : 'Group Information'}
              </h3>
              <button type="button" className="cc-modal-close-btn" onClick={() => setShowGroupInfoDrawer(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="cc-modal-body">
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: activeConversation?.avatarBg || '#2563eb', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                  {activeConversation?.avatar || '💬'}
                </div>
                <h3 style={{ margin: 0, color: '#fff' }}>{activeConversation?.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  {activeConversation?.department} • {activeConversation?.category}
                </p>
                {activeConversation?.isDirect && activeConversation?.phone && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#38bdf8' }}>
                    {activeConversation?.phone} • {activeConversation?.email}
                  </p>
                )}
              </div>

              {activeConversation?.description && (
                <div style={{ background: '#0b0f19', padding: '12px 14px', borderRadius: 10, fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <strong style={{ color: '#94a3b8', display: 'block', marginBottom: 4, textTransform: 'uppercase', fontSize: '0.72rem' }}>About / Description:</strong>
                  {activeConversation?.description}
                </div>
              )}

              {/* Action buttons inside drawer */}


              {/* Members List (for groups) */}
              {!activeConversation?.isDirect && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                      {activeConversation?.membersCount || 64} Members
                    </span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => triggerToast('Select members from directory to invite')}
                    >
                      + Add Members
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#0b0f19', borderRadius: 6 }}>
                      <span style={{ fontSize: '0.82rem', color: '#fff' }}>{activeConversation?.faculty || 'Dr. S. Mohanty'}</span>
                      <span className="cc-role-badge faculty">Group Admin</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#0b0f19', borderRadius: 6 }}>
                      <span style={{ fontSize: '0.82rem', color: '#fff' }}>{account?.name || 'You'}</span>
                      <span className="cc-role-badge student">Member</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#0b0f19', borderRadius: 6 }}>
                      <span style={{ fontSize: '0.82rem', color: '#fff' }}>Rahul Sharma</span>
                      <span className="cc-role-badge student">CR / Member</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy / Moderation Controls */}
              <div style={{ borderTop: '1px solid var(--cc-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeConversation?.isDirect && (
                  <button
                    type="button"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => {
                      setShowGroupInfoDrawer(false);
                      if (campusConnectStore.isUserBlocked(activeConversation?.id)) {
                        handleUnblockUser(activeConversation?.id);
                      } else {
                        handleBlockUser(activeConversation?.id, activeConversation?.name);
                      }
                    }}
                  >
                    <UserX size={15} /> {campusConnectStore.isUserBlocked(activeConversation?.id) ? 'Unblock Contact' : 'Block Contact'}
                  </button>
                )}
                <button
                  type="button"
                  style={{ background: 'none', border: '1px solid var(--cc-border)', color: '#94a3b8', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}
                  onClick={() => {
                    setShowGroupInfoDrawer(false);
                    setReportingMessage({ id: 'channel-report', sender: activeConversation?.name || 'Channel', text: 'Reported from Info Drawer' });
                    setShowReportModal(true);
                  }}
                >
                  <Flag size={15} /> Report {activeConversation?.isDirect ? 'Contact' : 'Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
