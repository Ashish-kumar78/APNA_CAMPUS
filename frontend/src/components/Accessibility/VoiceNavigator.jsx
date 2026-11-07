import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, HelpCircle, Check, X, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext.jsx';

export const VOICE_COMMANDS = [
  { phrase: 'open dashboard / go to dashboard', action: 'Navigates to the main Dashboard view' },
  { phrase: 'open attendance', action: 'Opens Student / Faculty Attendance module' },
  { phrase: 'open timetable', action: 'Navigates to Academic Timetable' },
  { phrase: 'open fees / open accounts', action: 'Opens Accounts & Fee Management' },
  { phrase: 'open notifications', action: 'Opens Institutional Notifications Drawer' },
  { phrase: 'open hostel / open hostel complaints', action: 'Opens Hostel Residence & Grievance module' },
  { phrase: 'open transport', action: 'Opens Transit & Fleet Operations' },
  { phrase: 'open accessibility', action: 'Opens this Accessibility Controls Panel' },
  { phrase: 'close accessibility', action: 'Closes Accessibility Controls Panel' },
  { phrase: 'dark mode / light mode', action: 'Toggles between Dark and Light color themes' },
  { phrase: 'high contrast', action: 'Toggles High Contrast mode' },
];

export default function VoiceNavigator() {
  const {
    voiceNavEnabled,
    setVoiceNavEnabled,
    setTheme,
    theme,
    highContrast,
    setHighContrast,
    openPanel,
    closePanel,
    announce
  } = useAccessibility();

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState('');
  const [permissionError, setPermissionError] = useState('');
  const recognitionRef = useRef(null);

  // Check browser SpeechRecognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const handleCommandMatch = useCallback((text) => {
    const clean = text.toLowerCase().trim();
    setTranscript(clean);

    let recognized = '';

    if (clean.includes('dashboard') || clean.includes('home')) {
      recognized = 'Navigating to Dashboard';
      window.dispatchEvent(new CustomEvent('apna_campus_voice_navigate', { detail: { targetTab: 'dashboard' } }));
    } else if (clean.includes('attendance')) {
      recognized = 'Opening Attendance Module';
      window.dispatchEvent(new CustomEvent('apna_campus_voice_navigate', { detail: { targetTab: 'attendance' } }));
    } else if (clean.includes('timetable') || clean.includes('schedule') || clean.includes('routine')) {
      recognized = 'Opening Timetable Management';
      window.dispatchEvent(new CustomEvent('apna_campus_voice_navigate', { detail: { targetTab: 'timetable' } }));
    } else if (clean.includes('fee') || clean.includes('account') || clean.includes('dues')) {
      recognized = 'Opening Fee & Accounts';
      window.dispatchEvent(new CustomEvent('apna_campus_voice_navigate', { detail: { targetTab: 'fees' } }));
    } else if (clean.includes('notification') || clean.includes('notice') || clean.includes('alert')) {
      recognized = 'Opening Notifications';
      window.dispatchEvent(new CustomEvent('open_institutional_notifications_drawer'));
    } else if (clean.includes('hostel') || clean.includes('warden') || clean.includes('room')) {
      recognized = 'Opening Hostel Portal';
      window.dispatchEvent(new CustomEvent('apna_campus_voice_navigate', { detail: { targetTab: 'hostel' } }));
    } else if (clean.includes('transport') || clean.includes('bus') || clean.includes('fleet')) {
      recognized = 'Opening Transport Management';
      window.dispatchEvent(new CustomEvent('apna_campus_voice_navigate', { detail: { targetTab: 'transport' } }));
    } else if (clean.includes('open accessibility') || clean.includes('show accessibility') || clean.includes('access panel')) {
      recognized = 'Opening Accessibility Panel';
      openPanel();
    } else if (clean.includes('close accessibility') || clean.includes('hide accessibility')) {
      recognized = 'Closing Accessibility Panel';
      closePanel();
    } else if (clean.includes('dark mode') || clean.includes('theme dark')) {
      recognized = 'Switching to Dark Mode';
      setTheme('dark');
    } else if (clean.includes('light mode') || clean.includes('theme light')) {
      recognized = 'Switching to Light Mode';
      setTheme('light');
    } else if (clean.includes('high contrast')) {
      recognized = highContrast ? 'Disabling High Contrast' : 'Enabling High Contrast';
      setHighContrast(!highContrast);
    } else if (clean.includes('stop listening') || clean.includes('turn off microphone')) {
      recognized = 'Voice Navigation Deactivated';
      stopListening();
    }

    if (recognized) {
      setLastAction(recognized);
      announce(recognized, 'polite');
    } else {
      setLastAction(`Unrecognized command: "${clean}"`);
    }
  }, [openPanel, closePanel, setTheme, highContrast, setHighContrast, announce]);

  const startListening = useCallback(() => {
    setPermissionError('');
    if (!isSupported) {
      setPermissionError('Speech Recognition is not supported by your current browser.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        announce('Voice Navigation listening is now active. Speak a command.', 'polite');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
            handleCommandMatch(item[0].transcript);
          } else {
            setTranscript(item[0].transcript);
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings.');
          setIsListening(false);
          announce('Microphone permission was denied.', 'assertive');
        } else if (event.error === 'no-speech') {
          // ignore transient silence
        } else {
          setPermissionError(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If user still wants voice navigation active, automatically resume
        if (voiceNavEnabled && recognitionRef.current) {
          try {
            recognition.start();
          } catch (_) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      setPermissionError(`Failed to initialize speech recognition: ${err.message}`);
      setIsListening(false);
    }
  }, [isSupported, voiceNavEnabled, handleCommandMatch, announce]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    announce('Voice navigation stopped.', 'polite');
  }, [announce]);

  // Synchronize with voiceNavEnabled toggle
  useEffect(() => {
    if (voiceNavEnabled && !isListening) {
      startListening();
    } else if (!voiceNavEnabled && isListening) {
      stopListening();
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
    };
  }, [voiceNavEnabled]);

  if (!isSupported) {
    return (
      <div className="voice-nav-unsupported" role="note">
        <AlertCircle size={16} />
        <span>Voice speech recognition is not supported in this browser. You can still use standard keyboard and mouse navigation.</span>
      </div>
    );
  }

  return (
    <div className="voice-nav-container" aria-live="polite">
      <div className="voice-nav-control-row">
        <button
          type="button"
          onClick={() => {
            const next = !voiceNavEnabled;
            setVoiceNavEnabled(next);
            if (!next) stopListening();
          }}
          className={`voice-mic-toggle-btn ${voiceNavEnabled ? 'active' : ''}`}
          aria-pressed={voiceNavEnabled}
          aria-label={voiceNavEnabled ? 'Stop voice speech recognition' : 'Start voice speech recognition'}
        >
          {voiceNavEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          <span>{voiceNavEnabled ? (isListening ? 'Listening...' : 'Voice Enabled') : 'Enable Voice Navigation'}</span>
        </button>

        {isListening && (
          <div className="voice-pulse-badge" aria-label="Microphone active indicator">
            <span className="pulse-dot"></span>
            <span>Microphone Live</span>
          </div>
        )}
      </div>

      {permissionError && (
        <div className="voice-error-banner" role="alert">
          <AlertCircle size={15} />
          <span>{permissionError}</span>
        </div>
      )}

      {voiceNavEnabled && (
        <div className="voice-feedback-card">
          <div className="voice-transcript-row">
            <span className="transcript-label">Heard:</span>
            <span className="transcript-value">{transcript || 'Say "Open timetable", "Open attendance", or "Dark mode"...'}</span>
          </div>
          {lastAction && (
            <div className="voice-action-row">
              <Check size={14} color="#10b981" />
              <span>{lastAction}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

