'use client';

import { useState, useEffect } from 'react';

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempSessionId, setTempSessionId] = useState('');

  useEffect(() => {
    // Check if we have a session ID in localStorage
    const storedSessionId = localStorage.getItem('ahs_session_id');
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
      setTempSessionId(storedSessionId);
    } else {
      // No default session ID - user must enter manually
      setSessionId(null);
      setTempSessionId('');
    }
  }, []);

  const updateSessionId = (newSessionId: string) => {
    if (newSessionId.trim()) {
      localStorage.setItem('ahs_session_id', newSessionId.trim());
      setSessionId(newSessionId.trim());
      setTempSessionId(newSessionId.trim());
      setIsEditing(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setTempSessionId(sessionId || '');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTempSessionId(sessionId || '');
  };

  const clearSession = () => {
    const newSessionId = 'new-session-' + Date.now();
    localStorage.setItem('ahs_session_id', newSessionId);
    setSessionId(newSessionId);
    setTempSessionId(newSessionId);
    setIsEditing(false);
  };

  return { 
    sessionId, 
    clearSession, 
    updateSessionId, 
    isEditing, 
    tempSessionId, 
    setTempSessionId,
    startEditing, 
    cancelEditing 
  };
}
