import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  CircleHelp,
  CornerUpLeft,
  Copy,
  Forward,
  LogOut,
  MoreHorizontal,
  Mic,
  MessageCircle,
  Moon,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Square,
  Star,
  Trash2,
  Sun,
  Users,
  X,
  Smile,
  ShieldCheck,
  Download,
  Info
} from 'lucide-react';
import { io } from 'socket.io-client';
import './SomeshChatInterface.css';
import { campusConnectStore } from '../../services/campusConnectStore.js';
import { playReceivedSound, playSentSound } from '../../services/soundEffects.js';

const API = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ? import.meta.env.VITE_API_URL : 'http://localhost:4000/api';

async function request(path, init = {}, csrf) {
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  const url = path.startsWith('http') ? path : `${API}${path}`;
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'x-csrf-token': csrf } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new Error(problem?.message ?? `Request failed (${response.status})`);
  }
  return response.json();
}

function AttachmentView({ attachment }) {
  if (!attachment) return null;
  const isImage = attachment.mimeType?.startsWith('image/') || (attachment.fileName && attachment.fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i));
  const isVideo = attachment.mimeType?.startsWith('video/') || (attachment.fileName && attachment.fileName.match(/\.(mp4|webm|mov)$/i));
  const isAudio = attachment.mimeType?.startsWith('audio/') || (attachment.fileName && attachment.fileName.match(/\.(mp3|ogg|wav|webm)$/i));
  const url = attachment.url || (attachment.id ? `${API}/attachments/${encodeURIComponent(attachment.id)}` : '');

  if (isImage && url) {
    return <img className="chat-attachment image-attachment" src={url} alt={attachment.fileName || 'Attachment'} loading="lazy" />;
  }
  if (isVideo && url) {
    return <video className="chat-attachment" src={url} controls preload="metadata" />;
  }
  if (isAudio && url) {
    return <audio className="chat-audio" src={url} controls preload="metadata" />;
  }

  return (
    <a className="attachment-file" href={url || '#'} download={attachment.fileName || 'attachment'} target="_blank" rel="noreferrer">
      <Paperclip size={15} />
      <span>{attachment.fileName || 'Document'}</span>
      <small>{attachment.size ? Math.max(1, Math.round(attachment.size / 1024)) + ' KB' : 'PDF / Doc'}</small>
    </a>
  );
}

function initials(name) {
  if (!name) return 'U';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date.toDateString() === new Date().toDateString()
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function Avatar({ name, size = 'normal', image = null }) {
  if (image) {
    return <img src={image} alt={name} className={`avatar ${size}`} style={{ objectFit: 'cover' }} />;
  }
  return (
    <div className={`avatar ${size}`} aria-hidden="true">
      {initials(name)}
    </div>
  );
}

function parseMessageTimestamp(m) {
  if (m.createdAt) {
    const t = new Date(m.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (m.timestamp) {
    const t = new Date(m.timestamp).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (m.time && (m.time.includes('AM') || m.time.includes('PM'))) {
    const match = m.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      const today = new Date();
      let hours = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      today.setHours(hours, mins, 0, 0);
      return today.getTime();
    }
  }
  if (m.date === 'Today') {
    return Date.now() - 60000;
  }
  if (m.date === 'Yesterday') {
    return Date.now() - 86400000;
  }
  if (m.time && !isNaN(Date.parse(m.time))) {
    return Date.parse(m.time);
  }
  if (m.date && !isNaN(Date.parse(m.date))) {
    return Date.parse(m.date);
  }
  return Date.now() - 86400000;
}

function getConversationLatestTime(c) {
  if (Array.isArray(c.messages) && c.messages.length > 0) {
    const last = c.messages[c.messages.length - 1];
    const t = new Date(last.createdAt || last.timestamp || 0).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (c.lastMessage?.timestamp) {
    const t = new Date(c.lastMessage.timestamp).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (c.updatedAt) {
    const t = new Date(c.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

// Convert campusConnectStore mock data into the Somesh Chat model
function convertStoreMessageToChatMessage(m, convId, currentUser) {
  const myId = String(currentUser?.id || currentUser?.rollNumber || currentUser?.identifier || '').toLowerCase();
  const myName = String(currentUser?.displayName || currentUser?.name || '').toLowerCase();
  const senderName = String(m.sender || '').toLowerCase();
  const senderId = String(m.senderId || '').toLowerCase();

  const isOwn = m.isOwn === true ||
    (myId && senderId && (senderId === myId || senderId === 'me')) ||
    (myName && senderName && senderName === myName) ||
    (myName && senderName && (myName.includes(senderName) || senderName.includes(myName)));

  let attachment = m.attachment || null;
  if (!attachment && m.resource) {
    attachment = {
      id: m.resource.id || `res-${Date.now()}`,
      fileName: m.resource.title || m.resource.name || 'document.pdf',
      mimeType: m.resource.fileType || 'application/pdf',
      size: 1.8 * 1024 * 1024,
      url: m.resource.downloadUrl || m.resource.url || '/sample_documents/sample_document.pdf'
    };
  } else if (!attachment && Array.isArray(m.attachments) && m.attachments[0]) {
    const a = m.attachments[0];
    attachment = {
      id: a.id || `att-${Date.now()}`,
      fileName: a.name || 'document.pdf',
      mimeType: a.type || 'application/pdf',
      size: a.size || 1024 * 1024,
      url: a.url || '/sample_documents/sample_document.pdf'
    };
  }

  const role = (
    m.senderRole ||
    (m.isFaculty ? 'FACULTY' : (m.sender && (m.sender.includes('Dr.') || m.sender.includes('Prof.') || m.sender.includes('HOD') || m.sender.includes('Er.')) ? 'FACULTY' : 'STUDENT'))
  ).toUpperCase();

  const msgTime = parseMessageTimestamp(m);

  return {
    id: m.id || `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    conversationId: convId,
    senderId: isOwn ? (currentUser?.id || 'me') : (m.senderId || 'peer'),
    body: m.text || m.body || m.academicRequest?.requestText || m.resource?.title || '',
    createdAt: new Date(msgTime).toISOString(),
    sender: {
      id: m.senderId || (isOwn ? (currentUser?.id || 'me') : 'peer'),
      displayName: m.sender || (isOwn ? (currentUser?.displayName || 'Me') : 'Participant'),
      role
    },
    attachment,
    receipts: [{ userId: 'me', deliveredAt: new Date().toISOString(), readAt: new Date().toISOString() }],
    reactions: m.reactions || {},
    replyTo: m.replyTo || null,
    isPinned: Boolean(m.pinned)
  };
}

function getInitialSeedConversations(currentUser) {
  const storeConvs = campusConnectStore.getConversations();
  if (!Array.isArray(storeConvs) || storeConvs.length === 0) {
    return [];
  }

  const mappedConvs = storeConvs.map(c => {
    const rawMsgs = campusConnectStore.getMessages(c.id);
    const convMsgs = (Array.isArray(rawMsgs) && rawMsgs.length > 0)
      ? rawMsgs.map(m => convertStoreMessageToChatMessage(m, c.id, currentUser))
      : (Array.isArray(c.messages) && c.messages.length > 0)
      ? c.messages.map(m => convertStoreMessageToChatMessage(m, c.id, currentUser))
      : [];

    const lastMsg = convMsgs[convMsgs.length - 1];
    const lastTime = lastMsg
      ? new Date(lastMsg.createdAt).getTime()
      : (c.lastMessage?.timestamp ? new Date(c.lastMessage.timestamp).getTime() : 0);

    return {
      id: c.id,
      type: c.isDirect ? 'DIRECT' : 'GROUP',
      title: c.name,
      category: c.category || 'Classes',
      subject: c.subject || c.name,
      code: c.code || '',
      faculty: c.faculty || '',
      updatedAt: lastTime > 0 ? new Date(lastTime).toISOString() : new Date().toISOString(),
      members: [
        { id: 'faculty-01', displayName: c.faculty || 'Dr. S. Mohanty', role: 'FACULTY' },
        { id: 'student-01', displayName: 'Rakesh Das', role: 'STUDENT' },
        { id: 'student-02', displayName: 'Bishnu Prasad Sahoo', role: 'STUDENT' },
        { id: 'student-03', displayName: 'Somya Ranjan', role: 'STUDENT' },
        { id: 'student-04', displayName: 'Ananya Sharma', role: 'STUDENT' }
      ],
      unreadCount: c.unreadCount || 0,
      isFavorite: Boolean(c.isStarred),
      pinned: c.pinned || null,
      messages: convMsgs
    };
  });

  // Sort by latest message/activity timestamp in descending order (newest message on top)
  return mappedConvs.sort((a, b) => getConversationLatestTime(b) - getConversationLatestTime(a));
}

export default function SomeshChatInterface({
  account,
  initialConversationId,
  isDrawerMode = false,
  onClose,
  onBack,
}) {
  // Auto-authenticate with the active portal account
  const [me, setMe] = useState(() => {
    if (account) {
      return {
        id: String(account.id || account.rollNumber || account.identifier || 'me_usr_01'),
        displayName: account.name || account.displayName || 'Campus User',
        role: (account.role || 'STUDENT').toUpperCase(),
        profileImageUrl: account.avatar || null,
      };
    }
    return {
      id: 'student-01',
      displayName: 'Rakesh Das',
      role: 'STUDENT',
      profileImageUrl: null,
    };
  });

  const [checking, setChecking] = useState(false);
  const [csrf, setCsrf] = useState('csrf_token_active');
  const [error, setError] = useState('');
  const [dark, setDark] = useState(false);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [conversations, setConversations] = useState(() => getInitialSeedConversations(me));
  const [people, setPeople] = useState([]);
  const [searchResults, setSearchResults] = useState({ users: [], conversations: [], messages: [] });
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(() => initialConversationId || 'conv-ds');
  const [messages, setMessages] = useState(() => {
    const initId = initialConversationId || 'conv-ds';
    const storeMsgs = campusConnectStore.getMessages(initId);
    return storeMsgs.map((m) => convertStoreMessageToChatMessage(m, initId, me));
  });
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [forwarding, setForwarding] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState('');
  const [messageMenuId, setMessageMenuId] = useState('');
  const [conversationFilter, setConversationFilter] = useState('all');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [managingGroup, setManagingGroup] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  const socketRef = useRef(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const mediaInputRef = useRef(null);
  const recorderRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const bottomRef = useRef(null);
  const stageRef = useRef(null);

  // Update 'me' and reload conversations/messages if account prop changes
  useEffect(() => {
    if (account) {
      const updatedMe = {
        id: String(account.id || account.rollNumber || account.identifier || 'me_usr_01'),
        displayName: account.name || account.displayName || 'Campus User',
        role: (account.role || 'STUDENT').toUpperCase(),
        profileImageUrl: account.avatar || null,
      };
      setMe(updatedMe);
      const convs = getInitialSeedConversations(updatedMe);
      setConversations(convs);
      const currId = activeIdRef.current || 'conv-ds';
      const storeMsgs = campusConnectStore.getMessages(currId);
      setMessages(storeMsgs.map((m) => convertStoreMessageToChatMessage(m, currId, updatedMe)));
    }
  }, [account]);

  // Load directory campus users
  useEffect(() => {
    setDirectoryUsers([
      { id: 'faculty-01', displayName: 'Dr. S. Mohanty', role: 'FACULTY' },
      { id: 'hod-01', displayName: 'Dr. P. K. Pattnaik', role: 'HOD' },
      { id: 'principal-01', displayName: 'Dr. B. K. Sarap', role: 'PRINCIPAL' },
      { id: 'warden-01', displayName: 'Er. B. K. Jena', role: 'WARDEN' },
      { id: 'student-02', displayName: 'Ananya Sharma', role: 'STUDENT' },
      { id: 'student-03', displayName: 'Bishnu Prasad Sahoo', role: 'STUDENT' },
      { id: 'student-04', displayName: 'Sneha Mohanty', role: 'STUDENT' },
      { id: 'exam-01', displayName: 'Dr. Pallab Kumar Kar', role: 'EXAM_CELL' },
    ]);
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;

  const visibleConversations = useMemo(() => {
    const filtered = conversations.filter((c) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = c.title?.toLowerCase().includes(query);
        const matchesMsg = c.messages?.some((m) => m.body?.toLowerCase().includes(query));
        const matchesMember = c.members?.some((m) => m.displayName?.toLowerCase().includes(query));
        if (!matchesTitle && !matchesMsg && !matchesMember) return false;
      }
      if (conversationFilter === 'unread') return c.unreadCount > 0;
      if (conversationFilter === 'favorites') return c.isFavorite;
      if (conversationFilter === 'groups') return c.type === 'GROUP';
      return true;
    });

    // Dynamically sort by latest activity timestamp descending (most recent message at the top)
    return [...filtered].sort((a, b) => getConversationLatestTime(b) - getConversationLatestTime(a));
  }, [conversations, conversationFilter, search]);

  const chatTitle = useMemo(() => {
    if (!active) return 'Campus Chat';
    if (active.type === 'GROUP') return active.title || 'Group Conversation';
    const other = active.members?.find((m) => m.id !== me?.id);
    return other?.displayName || active.title || 'Direct Conversation';
  }, [active, me]);

  // Switch conversation
  function selectConversation(conversationId) {
    if (conversationId !== activeId) {
      setReplyTo(null);
      setEditingMessageId('');
    }
    setActiveId(conversationId);
    activeIdRef.current = conversationId;

    const rawMsgs = campusConnectStore.getMessages(conversationId);
    const converted = rawMsgs.map((m) => convertStoreMessageToChatMessage(m, conversationId, me));
    setMessages(converted);

    // Mark as read in store
    campusConnectStore.markAsRead?.(conversationId);

    // Update unread count locally
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }

  // Load initial messages for activeId
  useEffect(() => {
    if (!activeId) return;
    activeIdRef.current = activeId;
    const rawMsgs = campusConnectStore.getMessages(activeId);
    const converted = rawMsgs.map((m) => convertStoreMessageToChatMessage(m, activeId, me));
    setMessages(converted);
  }, [activeId]);

  // Real-time synchronization across all tabs and modules
  useEffect(() => {
    const handleSync = (ev) => {
      const convId = ev?.detail?.conversationId;
      const incomingMsg = ev?.detail?.message;

      if (convId && convId === activeIdRef.current && incomingMsg) {
        const formatted = convertStoreMessageToChatMessage(incomingMsg, convId, me);
        setMessages((prev) => {
          if (prev.some((m) => m.id === formatted.id)) return prev;
          if (formatted.senderId !== me.id) {
            playReceivedSound();
          }
          return [...prev, formatted];
        });
      } else if (convId && incomingMsg) {
        if (incomingMsg.senderId !== me.id && incomingMsg.sender !== me.displayName) {
          playReceivedSound();
        }
      }

      // Refresh conversations list to update latest snippets and unread counts
      setConversations(getInitialSeedConversations(me));
    };

    window.addEventListener('campus_connect_updated', handleSync);
    window.addEventListener('storage', handleSync);

    let bc;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('campus_connect_realtime');
        bc.onmessage = (msgEv) => {
          handleSync({ detail: msgEv.data });
        };
      } catch (err) {}
    }

    return () => {
      window.removeEventListener('campus_connect_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      if (bc) bc.close();
    };
  }, [me]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typing.length]);

  // Socket.io initialization with graceful offline fallback
  useEffect(() => {
    if (!me) return;
    try {
      const socket = io(API, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        timeout: 3000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        setSocketReady(true);
        if (activeIdRef.current) {
          socket.emit('conversation:join', { conversationId: activeIdRef.current });
        }
      });

      socket.on('disconnect', () => setSocketReady(false));
      socket.on('connect_error', () => {
        // Fallback gracefully without throwing alert
        setSocketReady(false);
      });

      socket.on('message:new', (newMsg) => {
        if (newMsg.conversationId === activeIdRef.current) {
          setMessages((prev) => [...prev, newMsg]);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch (e) {
      console.warn('Socket.IO connection notice:', e);
    }
  }, [me]);

  // Send message
  function sendMessage(e) {
    if (e) e.preventDefault();
    if (!draft.trim()) return;

    if (editingMessageId) {
      // Handle Edit
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessageId
            ? { ...m, body: draft.trim(), editedAt: new Date().toISOString() }
            : m
        )
      );
      setEditingMessageId('');
      setDraft('');
      return;
    }

    const textToSend = draft.trim();
    const payload = {
      text: textToSend,
      sender: me.displayName,
      senderRole: me.role.toLowerCase(),
      senderId: me.id,
      isOwn: true,
      replyTo: replyTo ? {
        id: replyTo.id,
        body: replyTo.body,
        sender: replyTo.sender,
        attachment: replyTo.attachment
      } : null
    };

    // 1. Save to campusConnectStore
    const savedMsg = campusConnectStore.sendMessage(activeId, payload);

    // 2. Format as chat message
    const formatted = convertStoreMessageToChatMessage({ ...savedMsg, isOwn: true }, activeId, me);
    formatted.senderId = me.id;

    setMessages((prev) => [...prev, formatted]);
    setDraft('');
    setReplyTo(null);

    // 3. Update conversation last message in list and float to 1st position
    setConversations((prev) => {
      const target = prev.find((c) => c.id === activeId);
      const updatedTarget = {
        ...(target || {}),
        updatedAt: new Date().toISOString(),
        messages: [...(target?.messages || []), formatted],
      };
      const remaining = prev.filter((c) => c.id !== activeId);
      return [updatedTarget, ...remaining];
    });

    // 4. Emit over socket if ready
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', {
        conversationId: activeId,
        body: textToSend,
        replyToId: replyTo?.id,
      });
    }

    // 5. Broadcast to other tabs & windows
    window.dispatchEvent(new CustomEvent('campus_connect_updated', {
      detail: { conversationId: activeId, message: formatted, senderId: me.id }
    }));
  }

  // Voice recording
  async function startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordingChunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const voiceMsg = {
          id: `voice_${Date.now()}`,
          conversationId: activeId,
          senderId: me.id,
          body: '🎙️ Voice note',
          createdAt: new Date().toISOString(),
          sender: { id: me.id, displayName: me.displayName },
          attachment: {
            id: `att_${Date.now()}`,
            fileName: 'Voice_Note.webm',
            mimeType: 'audio/webm',
            size: audioBlob.size,
            url: audioUrl
          },
          receipts: [{ userId: 'recipient', deliveredAt: new Date().toISOString(), readAt: null }]
        };

        setMessages((prev) => [...prev, voiceMsg]);
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access is required to record voice notes: ' + err.message);
      setIsRecording(false);
    }
  }

  // Upload attachment
  function uploadAttachment(file) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const newMsg = {
      id: `att_${Date.now()}`,
      conversationId: activeId,
      senderId: me.id,
      body: file.name,
      createdAt: new Date().toISOString(),
      sender: { id: me.id, displayName: me.displayName },
      attachment: {
        id: `att_id_${Date.now()}`,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: objectUrl
      },
      receipts: [{ userId: 'recipient', deliveredAt: new Date().toISOString(), readAt: null }]
    };

    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, updatedAt: new Date().toISOString(), messages: [...(c.messages || []), newMsg] }
          : c
      )
    );
  }

  // Toggle favorite / star
  function toggleFavoriteConversation(conversationId) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isFavorite: !c.isFavorite } : c
      )
    );
  }

  // Delete message for me
  function deleteMessageForMe(msg) {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    setMessageMenuId('');
  }

  // Delete message for everyone
  function deleteMessageForEveryone(msg) {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? { ...m, body: '🚫 This message was deleted', deletedAt: new Date().toISOString(), attachment: null }
          : m
      )
    );
    setMessageMenuId('');
  }

  // Create group
  function handleCreateGroup(e) {
    e.preventDefault();
    if (!groupName.trim() || groupMembers.length === 0) {
      alert('Please enter a group name and select at least one participant.');
      return;
    }

    const newGroup = {
      id: `grp_${Date.now()}`,
      type: 'GROUP',
      title: groupName.trim(),
      updatedAt: new Date().toISOString(),
      members: [
        { id: me.id, displayName: me.displayName, role: me.role },
        ...groupMembers.map((mId) => {
          const user = directoryUsers.find((u) => u.id === mId);
          return { id: mId, displayName: user ? user.displayName : mId, role: 'STUDENT' };
        })
      ],
      unreadCount: 0,
      isFavorite: false,
      messages: [
        {
          id: `m_grp_init_${Date.now()}`,
          conversationId: `grp_${Date.now()}`,
          senderId: me.id,
          body: `🎉 Group "${groupName.trim()}" created by ${me.displayName}.`,
          createdAt: new Date().toISOString(),
          sender: { id: me.id, displayName: me.displayName }
        }
      ]
    };

    setConversations((prev) => [newGroup, ...prev]);
    setActiveId(newGroup.id);
    setCreatingGroup(false);
    setGroupName('');
    setGroupMembers([]);
  }

  // Start direct conversation with user from directory
  function openDirectUser(user) {
    const existing = conversations.find(
      (c) => c.type === 'DIRECT' && c.members.some((m) => m.id === user.id)
    );
    if (existing) {
      selectConversation(existing.id);
      setShowDirectory(false);
      return;
    }

    const newDirect = {
      id: `dir_${Date.now()}`,
      type: 'DIRECT',
      title: user.displayName,
      updatedAt: new Date().toISOString(),
      members: [
        { id: me.id, displayName: me.displayName, role: me.role },
        { id: user.id, displayName: user.displayName, role: user.role }
      ],
      unreadCount: 0,
      isFavorite: false,
      messages: []
    };

    setConversations((prev) => [newDirect, ...prev]);
    selectConversation(newDirect.id);
    setShowDirectory(false);
  }

  const filteredDirectoryUsers = useMemo(() => {
    return directoryUsers.filter((u) => {
      if (!directoryQuery.trim()) return true;
      const q = directoryQuery.toLowerCase();
      return u.displayName.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
    });
  }, [directoryUsers, directoryQuery]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  }

  return (
    <div className={`somesh-chat-root app-shell ${dark ? 'dark' : ''}`}>
      {/* ===================== SIDEBAR ===================== */}
      <aside className={`sidebar ${activeId ? 'mobile-hidden' : ''}`}>
        {/* Top Header / App Brand */}
        <div className="side-top">
          <div className="app-brand">
            <span className="mini-brand">
              <MessageCircle size={16} />
            </span>
            <span>Apna<span>Connect</span></span>
          </div>

          <div className="side-actions">
            {onBack && (
              <button
                type="button"
                className="icon-button"
                onClick={onBack}
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <button
              type="button"
              className="icon-button"
              onClick={() => setDark(!dark)}
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowDirectory(true)}
              title="Campus Directory"
            >
              <Users size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setCreatingGroup(true)}
              title="New Group Discussion"
            >
              <Plus size={16} />
            </button>
            {onClose && (
              <button
                type="button"
                className="icon-button"
                onClick={onClose}
                title="Close Chat"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search chats, students, messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} title="Clear search">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Title & Count */}
        <div className="conversation-title">
          <span>Conversations</span>
          <span className="conversation-count">{visibleConversations.length}</span>
        </div>

        {/* Filter Pills */}
        <div className="conversation-filters">
          {['all', 'unread', 'favorites', 'groups'].map((f) => (
            <button
              key={f}
              type="button"
              className={conversationFilter === f ? 'active' : ''}
              onClick={() => setConversationFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="conversation-list">
          {visibleConversations.length === 0 ? (
            <div className="empty-sidebar">
              <MessageCircle size={30} />
              <p>No conversations found</p>
              <small>Try clearing your search or filter</small>
            </div>
          ) : (
            visibleConversations.map((c) => {
              const lastMsg = c.messages?.[c.messages.length - 1];
              const isSelected = c.id === activeId;
              const title = c.type === 'GROUP' ? c.title : (c.members?.find((m) => m.id !== me?.id)?.displayName || c.title);

              return (
                <button
                  key={c.id}
                  type="button"
                  className={`conversation-row ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectConversation(c.id)}
                >
                  <Avatar name={title} />
                  <div className="conversation-copy">
                    <strong>{title}</strong>
                    <small>{lastMsg ? lastMsg.body : 'No messages yet'}</small>
                  </div>
                  <div className="conversation-meta">
                    <span>{lastMsg ? formatTime(lastMsg.createdAt) : formatTime(c.updatedAt)}</span>
                    {c.isFavorite && <span className="conversation-star">★</span>}
                    {c.unreadCount > 0 && <span className="unread-badge">{c.unreadCount}</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Profile Footer */}
        <div className="side-footer">
          <Avatar name={me?.displayName || 'User'} size="small" image={me?.profileImageUrl} />
          <div className="profile-copy">
            <strong>{me?.displayName || 'Campus User'}</strong>
            <small>{me?.role || 'STUDENT'}</small>
          </div>
        </div>
      </aside>

      {/* ===================== CHAT PANEL ===================== */}
      <main className={`chat-panel ${activeId ? 'mobile-visible' : ''}`}>
        {active ? (
          <>
            <header className="chat-header">
              <button
                type="button"
                className="back-button icon-button"
                onClick={() => setActiveId('')}
                title="Back to conversation list"
              >
                <ArrowLeft size={16} />
              </button>
              <Avatar name={chatTitle} />
              <div className="header-copy">
                <h2>{chatTitle}</h2>
                <p>
                  <span>
                    {active.type === 'GROUP'
                      ? `${active.members?.length || 4} participants · Academic Forum`
                      : 'Apna Campus Connect · Online'}
                  </span>
                  <i className="connection-dot online" />
                </p>
              </div>
              <div className="chat-actions" style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => toggleFavoriteConversation(active.id)}
                  title="Favorite / Star"
                >
                  <Star
                    size={16}
                    className={active.isFavorite ? 'favorite-active' : ''}
                    fill={active.isFavorite ? '#c28c2d' : 'none'}
                    color={active.isFavorite ? '#c28c2d' : 'currentColor'}
                  />
                </button>
                {onClose && (
                  <button
                    type="button"
                    className="icon-button"
                    onClick={onClose}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </header>

            <div className="message-stage" ref={stageRef}>
              <div className="day-divider">Today</div>
              {messages.map((m) => {
                const own = m.senderId === me.id || m.senderId === 'me' || (m.sender?.displayName && m.sender.displayName === me.displayName);
                const isMenuOpen = messageMenuId === m.id;

                return (
                  <div key={m.id} className={`message-row ${own ? 'own' : ''}`}>
                    {!own && <Avatar name={m.sender?.displayName || 'User'} size="small" />}
                    <div className="message-content">
                      {!own && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span className="sender-name">{m.sender?.displayName}</span>
                          {m.sender?.role && (
                            <span
                              className={`role-tag-badge ${m.sender.role.toLowerCase()}`}
                              style={{
                                fontSize: '8px',
                                fontWeight: 800,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                background: m.sender.role === 'FACULTY' ? '#dbeafe' : m.sender.role === 'HOD' ? '#ede9fe' : '#dcfce7',
                                color: m.sender.role === 'FACULTY' ? '#1e40af' : m.sender.role === 'HOD' ? '#6b21a8' : '#15803d'
                              }}
                            >
                              {m.sender.role}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quoted / Reply Preview */}
                      {m.replyTo && (
                        <div className="quoted-message">
                          <strong>{m.replyTo.sender?.displayName}</strong>
                          <span>{m.replyTo.body}</span>
                        </div>
                      )}

                      <div className="bubble">
                        {m.attachment && <AttachmentView attachment={m.attachment} />}
                        <p className="message-text">{m.body}</p>
                        <div className="message-time">
                          <small>{formatTime(m.createdAt)}</small>
                          {m.editedAt && <small style={{ marginLeft: 3 }}>(edited)</small>}
                          {own && (
                            <span className="read-check">
                              <CheckCheck size={13} color="#53bdeb" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Message Actions Menu */}
                      <div className="message-actions">
                        <button
                          type="button"
                          className="message-menu-trigger"
                          onClick={() => setMessageMenuId(isMenuOpen ? '' : m.id)}
                          title="Message options"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {isMenuOpen && (
                          <div className="message-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTo(m);
                                setMessageMenuId('');
                              }}
                            >
                              <CornerUpLeft size={12} /> Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(m.body);
                                setMessageMenuId('');
                              }}
                            >
                              <Copy size={12} /> Copy
                            </button>
                            {own && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(m.id);
                                  setDraft(m.body);
                                  setMessageMenuId('');
                                }}
                              >
                                <Pencil size={12} /> Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setForwardMessage(m);
                                setMessageMenuId('');
                              }}
                            >
                              <Forward size={12} /> Forward
                            </button>
                            <button
                              type="button"
                              className="destructive-action"
                              onClick={() => deleteMessageForMe(m)}
                            >
                              <Trash2 size={12} /> Delete for me
                            </button>
                            {own && (
                              <button
                                type="button"
                                className="destructive-action"
                                onClick={() => deleteMessageForEveryone(m)}
                              >
                                <Trash2 size={12} /> Delete for everyone
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <form className="composer" onSubmit={sendMessage}>
              {/* Reply / Edit preview banner */}
              {replyTo && (
                <div className="composer-context">
                  <span>
                    <strong>Replying to {replyTo.sender?.displayName || 'User'}</strong>
                    <small>{replyTo.body}</small>
                  </span>
                  <button type="button" onClick={() => setReplyTo(null)}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {editingMessageId && (
                <div className="composer-context">
                  <span>
                    <strong>Editing message</strong>
                    <small>{draft}</small>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMessageId('');
                      setDraft('');
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <input
                ref={mediaInputRef}
                type="file"
                className="visually-hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadAttachment(f);
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                className="composer-tool"
                onClick={() => mediaInputRef.current?.click()}
                title="Attach file or photo"
              >
                <Paperclip size={16} />
              </button>

              <textarea
                rows={1}
                placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button
                type="button"
                className={`composer-tool ${isRecording ? 'recording' : ''}`}
                onClick={() => (isRecording ? recorderRef.current?.stop() : startVoiceRecording())}
                title={isRecording ? 'Stop and send voice note' : 'Record voice note'}
              >
                {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={16} />}
              </button>

              <button
                type="submit"
                className="send-button"
                disabled={!draft.trim()}
                title="Send"
              >
                {editingMessageId ? <Check size={16} /> : <Send size={15} />}
              </button>

              <span className="composer-hint">Press Enter to send · Shift + Enter for new line</span>
            </form>
          </>
        ) : (
          <div className="welcome-panel">
            <div className="welcome-art">
              <MessageCircle size={38} />
              <span>✦</span>
            </div>
            <p className="eyebrow">APNA CAMPUS CHAT</p>
            <h2>
              Select a conversation or start a <span>new discussion</span>
            </h2>
            <p>Instant communication between students, faculty mentors, HODs, and administrators.</p>
            <div className="welcome-pills">
              <span><ShieldCheck size={14} /> End-to-end Secure</span>
              <span><Users size={14} /> Role-based Groups</span>
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODAL: CREATE GROUP ===================== */}
      {creatingGroup && (
        <div className="modal-backdrop" onClick={() => setCreatingGroup(false)}>
          <div className="group-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h2>Create Discussion Group</h2>
                <p>Form an academic study group, lab batch, or club</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCreatingGroup(false)}
              >
                <X size={16} />
              </button>
            </header>
            <form onSubmit={handleCreateGroup}>
              <label>Group Subject / Title</label>
              <input
                type="text"
                placeholder="e.g. CS501 AI Lab Batch A"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />

              <label>Select Participants ({groupMembers.length} selected)</label>
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  margin: '8px 0',
                  border: '1px solid var(--line)',
                  borderRadius: '10px',
                  padding: '6px',
                }}
              >
                {directoryUsers.map((u) => (
                  <label key={u.id} className="member-option" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={groupMembers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) setGroupMembers([...groupMembers, u.id]);
                        else setGroupMembers(groupMembers.filter((id) => id !== u.id));
                      }}
                    />
                    <span>{u.displayName} ({u.role})</span>
                  </label>
                ))}
              </div>

              <button type="submit" className="primary-button">
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CAMPUS DIRECTORY ===================== */}
      {showDirectory && (
        <div className="modal-backdrop" onClick={() => setShowDirectory(false)}>
          <div className="group-modal directory-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h2>Campus Directory</h2>
                <p>Find students, professors, and administrative staff</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowDirectory(false)}
              >
                <X size={16} />
              </button>
            </header>
            <div className="directory-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search by name, role..."
                value={directoryQuery}
                onChange={(e) => setDirectoryQuery(e.target.value)}
              />
            </div>
            <div className="directory-list">
              {filteredDirectoryUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="person-result"
                  onClick={() => openDirectUser(u)}
                >
                  <Avatar name={u.displayName} size="small" />
                  <span>
                    <strong>{u.displayName}</strong>
                    <small>{u.role}</small>
                  </span>
                  <span style={{ fontSize: '10px', color: '#4e8058', fontWeight: 600 }}>Message</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: FORWARD MESSAGE ===================== */}
      {forwardMessage && (
        <div className="modal-backdrop" onClick={() => setForwardMessage(null)}>
          <div className="forward-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h2>Forward Message</h2>
                <p>Select a conversation to forward this message</p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setForwardMessage(null)}
              >
                <X size={16} />
              </button>
            </header>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--subtext)',
                marginBottom: '12px',
                background: 'var(--hover)',
                padding: '8px',
                borderRadius: '8px',
              }}
            >
              <em>"{forwardMessage.body}"</em>
            </p>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="forward-destination"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                  }}
                  onClick={() => {
                    const fwdMsg = {
                      id: `fwd_${Date.now()}`,
                      conversationId: c.id,
                      senderId: me.id,
                      body: forwardMessage.body,
                      createdAt: new Date().toISOString(),
                      sender: { id: me.id, displayName: me.displayName },
                      attachment: forwardMessage.attachment || null,
                    };
                    setConversations((prev) =>
                      prev.map((item) =>
                        item.id === c.id
                          ? {
                              ...item,
                              messages: [...(item.messages || []), fwdMsg],
                              updatedAt: new Date().toISOString(),
                            }
                          : item
                      )
                    );
                    selectConversation(c.id);
                    setForwardMessage(null);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar name={c.title} size="small" />
                    <strong>{c.title}</strong>
                  </div>
                  <span>
                    Forward <Forward size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
