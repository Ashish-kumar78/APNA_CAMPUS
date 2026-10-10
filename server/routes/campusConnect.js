import express from 'express';

const router = express.Router();

// In-memory real-time state mirror
let serverConversations = [];
let serverMessages = {};
let serverContacts = [];
let serverCalls = [];
let blockedUsers = new Set();
let reports = [];

// Initialize server mock directory
serverContacts = [
  { id: 'usr-pm', name: 'Dr. P. Mohapatra', role: 'faculty', department: 'Computer Science & Engineering', phone: '+91 94370 20011', email: 'p.mohapatra@gift.edu.in', avatar: '👨‍🏫', avatarBg: '#3b82f6', status: 'online' },
  { id: 'usr-sm', name: 'Dr. S. Mohanty', role: 'faculty', department: 'Computer Science & Engineering', phone: '+91 94370 20012', email: 's.mohanty@gift.edu.in', avatar: '👨‍🏫', avatarBg: '#10b981', status: 'online' },
  { id: 'usr-rks', name: 'Prof. R. K. Sahoo', role: 'faculty', department: 'Computer Science & Engineering', phone: '+91 94370 20013', email: 'rk.sahoo@gift.edu.in', avatar: '👨‍🏫', avatarBg: '#8b5cf6', status: 'last seen 10 mins ago' },
  { id: 'usr-ad', name: 'Prof. Ananya Das', role: 'faculty', department: 'Basic Science & Humanities', phone: '+91 94370 20014', email: 'ananya.das@gift.edu.in', avatar: '👩‍🏫', avatarBg: '#ec4899', status: 'online' },
  { id: 'usr-rs', name: 'Rahul Sharma', role: 'student', registrationNumber: '2305201012', department: 'Computer Science & Engineering', phone: '+91 98610 23012', email: 'rahul.sharma@student.gift.edu.in', avatar: '👨‍🎓', avatarBg: '#f59e0b', status: 'online' },
  { id: 'usr-ps', name: 'Pooja Samal', role: 'student', registrationNumber: '2305201015', department: 'Computer Science & Engineering', phone: '+91 98610 23015', email: 'pooja.samal@student.gift.edu.in', avatar: '👩‍🎓', avatarBg: '#ec4899', status: 'last seen 1 hour ago' },
  { id: 'usr-sr', name: 'Somya Ranjan', role: 'student', registrationNumber: '2305201021', department: 'Computer Science & Engineering', phone: '+91 98610 23021', email: 'somya.ranjan@student.gift.edu.in', avatar: '👨‍🎓', avatarBg: '#06b6d4', status: 'online' },
  { id: 'usr-sb', name: 'Subhashree Biswal', role: 'student', registrationNumber: '2305201028', department: 'Computer Science & Engineering', phone: '+91 98610 23028', email: 'subhashree.b@student.gift.edu.in', avatar: '👩‍🎓', avatarBg: '#14b8a6', status: 'last seen yesterday' },
  { id: 'usr-exam', name: 'Examination Controller', role: 'admin', department: 'Examination Cell', phone: '+91 674 2460111', email: 'examcell@gift.edu.in', avatar: '🏛️', avatarBg: '#ef4444', status: 'online' },
  { id: 'usr-place', name: 'Placement Officer', role: 'admin', department: 'Training & Placement', phone: '+91 674 2460222', email: 'placement@gift.edu.in', avatar: '💼', avatarBg: '#f97316', status: 'online' }
];

// Health Check
router.get('/health', (req, res) => {
  res.json({ success: true, service: 'Campus Connect WhatsApp Platform API', time: new Date().toISOString() });
});

// GET Contacts
router.get('/contacts', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  let list = serverContacts;
  if (query) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query)) ||
      (c.registrationNumber && c.registrationNumber.toLowerCase().includes(query)) ||
      (c.department && c.department.toLowerCase().includes(query))
    );
  }
  res.json({ success: true, contacts: list });
});

// POST Add Contact
router.post('/contacts', (req, res) => {
  const { name, phone, email, department, role, registrationNumber } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  const newContact = {
    id: `usr-custom-${Date.now()}`,
    name,
    phone: phone || '',
    email: email || '',
    department: department || 'General',
    role: role || 'student',
    registrationNumber: registrationNumber || '',
    avatar: role === 'faculty' ? '👨‍🏫' : '👤',
    avatarBg: '#3b82f6',
    status: 'last seen recently'
  };
  serverContacts.unshift(newContact);
  res.status(201).json({ success: true, contact: newContact });
});

// GET Conversations
router.get('/conversations', (req, res) => {
  res.json({ success: true, conversations: serverConversations });
});

// POST Create Conversation (1-to-1 or Group)
router.post('/conversations', (req, res) => {
  const { name, category, isGroup, members, faculty, subject, code, department, description, avatar, avatarBg } = req.body;
  const newConv = {
    id: isGroup ? `conv-grp-${Date.now()}` : `conv-dm-${Date.now()}`,
    name: name || 'New Conversation',
    category: category || (isGroup ? 'Groups' : 'Direct'),
    isGroup: Boolean(isGroup),
    isDirect: !isGroup,
    members: members || [],
    membersCount: (members || []).length || 2,
    onlineCount: 1,
    unreadCount: 0,
    faculty: faculty || '',
    subject: subject || '',
    code: code || '',
    department: department || '',
    description: description || '',
    avatar: avatar || (isGroup ? '👥' : '💬'),
    avatarBg: avatarBg || '#3b82f6',
    createdAt: Date.now(),
    lastMessage: {
      sender: 'System',
      text: isGroup ? 'Group created' : 'Chat started',
      time: 'Just now',
      timestamp: Date.now()
    }
  };
  serverConversations.unshift(newConv);
  res.status(201).json({ success: true, conversation: newConv });
});

// GET Messages for conversation
router.get('/messages/:convId', (req, res) => {
  const { convId } = req.params;
  const msgs = serverMessages[convId] || [];
  res.json({ success: true, messages: msgs });
});

// POST Send Message
router.post('/messages/:convId', (req, res) => {
  const { convId } = req.params;
  const { sender, senderRole, senderId, text, type, attachments, replyTo, voiceNote } = req.body;

  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    conversationId: convId,
    sender: sender || 'User',
    senderRole: senderRole || 'student',
    senderId: senderId || 'user',
    text: text || '',
    type: type || 'text',
    attachments: attachments || [],
    voiceNote: voiceNote || null,
    replyTo: replyTo || null,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    timestamp: Date.now(),
    status: 'delivered', // 'sent' | 'delivered' | 'read'
    reactions: {},
    starred: false,
    pinned: false
  };

  if (!serverMessages[convId]) {
    serverMessages[convId] = [];
  }
  serverMessages[convId].push(newMsg);

  // Update conversation lastMessage
  const targetConv = serverConversations.find(c => c.id === convId);
  if (targetConv) {
    targetConv.lastMessage = {
      sender: newMsg.sender,
      text: newMsg.text || (newMsg.attachments?.[0]?.name ? `📎 ${newMsg.attachments[0].name}` : 'Voice message'),
      time: newMsg.time,
      timestamp: newMsg.timestamp
    };
  }

  res.status(201).json({ success: true, message: newMsg });
});

// POST Message Reaction
router.post('/messages/:convId/:msgId/reaction', (req, res) => {
  const { convId, msgId } = req.params;
  const { emoji } = req.body;
  const list = serverMessages[convId] || [];
  const target = list.find(m => m.id === msgId);
  if (target) {
    target.reactions = target.reactions || {};
    target.reactions[emoji] = (target.reactions[emoji] || 0) + 1;
    return res.json({ success: true, reactions: target.reactions });
  }
  res.status(404).json({ success: false, message: 'Message not found' });
});

// POST Star Message
router.post('/messages/:convId/:msgId/star', (req, res) => {
  const { convId, msgId } = req.params;
  const list = serverMessages[convId] || [];
  const target = list.find(m => m.id === msgId);
  if (target) {
    target.starred = !target.starred;
    return res.json({ success: true, starred: target.starred });
  }
  res.status(404).json({ success: false, message: 'Message not found' });
});

// POST Pin Message
router.post('/messages/:convId/:msgId/pin', (req, res) => {
  const { convId, msgId } = req.params;
  const list = serverMessages[convId] || [];
  const target = list.find(m => m.id === msgId);
  if (target) {
    target.pinned = !target.pinned;
    return res.json({ success: true, pinned: target.pinned });
  }
  res.status(404).json({ success: false, message: 'Message not found' });
});

// DELETE Message (for everyone or for me)
router.delete('/messages/:convId/:msgId', (req, res) => {
  const { convId, msgId } = req.params;
  const { deleteForEveryone } = req.body;
  const list = serverMessages[convId] || [];
  const target = list.find(m => m.id === msgId);
  if (target) {
    if (deleteForEveryone) {
      target.deleted = true;
      target.text = '🚫 This message was deleted';
      target.attachments = [];
      target.voiceNote = null;
    } else {
      serverMessages[convId] = list.filter(m => m.id !== msgId);
    }
    return res.json({ success: true, message: 'Message deleted' });
  }
  res.status(404).json({ success: false, message: 'Message not found' });
});

// GET Calls History
router.get('/calls', (req, res) => {
  res.json({ success: true, calls: serverCalls });
});

// POST Log Call
router.post('/calls', (req, res) => {
  const { contactName, contactId, contactAvatar, type, direction, duration } = req.body;
  const newCall = {
    id: `call-${Date.now()}`,
    contactName: contactName || 'Contact',
    contactId: contactId || '',
    contactAvatar: contactAvatar || '👤',
    type: type || 'voice', // 'voice' | 'video'
    direction: direction || 'outgoing', // 'incoming' | 'outgoing' | 'missed'
    duration: duration || '00:00',
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    timestamp: Date.now()
  };
  serverCalls.unshift(newCall);
  res.status(201).json({ success: true, call: newCall });
});

// POST Block / Unblock User
router.post('/block', (req, res) => {
  const { userId, action } = req.body;
  if (action === 'unblock') {
    blockedUsers.delete(userId);
  } else {
    blockedUsers.add(userId);
  }
  res.json({ success: true, blocked: blockedUsers.has(userId), blockedUsers: Array.from(blockedUsers) });
});

// POST Report Content / User
router.post('/report', (req, res) => {
  const { type, targetId, reason, conversation } = req.body;
  const reportItem = {
    id: `rep-${Date.now()}`,
    type,
    targetId,
    reason,
    conversation,
    timestamp: Date.now(),
    date: new Date().toLocaleString()
  };
  reports.push(reportItem);
  res.status(201).json({ success: true, message: 'Report submitted securely', report: reportItem });
});

export default router;
