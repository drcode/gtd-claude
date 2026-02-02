import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import * as api from '@/services/api';

interface GTDContextType {
  // State
  gtdText: string;
  nextActions: api.NextActionsData;
  userEntries: api.UserEntry[];
  diffLines: api.DiffLine[] | null;
  isLoading: boolean;
  status: string | null;
  statusIsError: boolean;

  // Modal state
  modalVisible: boolean;
  modalTitle: string;
  modalContent: string;
  modalShowApply: boolean;
  modalType: 'review' | 'compact' | 'advice' | null;

  // Actions
  loadState: () => Promise<void>;
  submitEntry: (text: string) => Promise<void>;
  doUndo: () => Promise<void>;
  doReview: () => Promise<void>;
  doAdvice: () => Promise<void>;
  doCompact: () => Promise<void>;
  applyModalAction: () => Promise<void>;
  closeModal: () => void;
  clearDiff: () => void;
}

const GTDContext = createContext<GTDContextType | null>(null);

export function GTDProvider({ children }: { children: ReactNode }) {
  const [gtdText, setGtdText] = useState<string>('');
  const [nextActions, setNextActions] = useState<api.NextActionsData>({ groups: [], waiting: [] });
  const [userEntries, setUserEntries] = useState<api.UserEntry[]>([]);
  const [diffLines, setDiffLines] = useState<api.DiffLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusIsError, setStatusIsError] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalShowApply, setModalShowApply] = useState(false);
  const [modalType, setModalType] = useState<'review' | 'compact' | 'advice' | null>(null);
  const [pendingReviewText, setPendingReviewText] = useState<string | null>(null);
  const [pendingCompactSuggestions, setPendingCompactSuggestions] = useState<api.CompactSuggestion[] | null>(null);

  const reloadStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showStatus = useCallback((msg: string, isError = false) => {
    setStatus(msg);
    setStatusIsError(isError);
  }, []);

  const hideStatusIfMatches = useCallback((expected: string) => {
    setStatus((current) => {
      if (current === expected) {
        setStatusIsError(false);
        return null;
      }
      return current;
    });
  }, []);

  const hideStatus = useCallback(() => {
    setStatus(null);
    setStatusIsError(false);
  }, []);

  const showModal = useCallback((title: string, content: string, showApply = false, type: 'review' | 'compact' | 'advice' | null = null) => {
    setModalTitle(title);
    setModalContent(content);
    setModalShowApply(showApply);
    setModalType(type);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setPendingReviewText(null);
    setPendingCompactSuggestions(null);
    setModalType(null);
  }, []);

  const clearDiff = useCallback(() => {
    setDiffLines(null);
  }, []);

  const loadState = useCallback(async () => {
    if (reloadStatusTimeout.current) {
      clearTimeout(reloadStatusTimeout.current);
      reloadStatusTimeout.current = null;
    }

    try {
      setDiffLines(null);
      showStatus('Reloading...');
      setIsLoading(true);
      const data = await api.getState();
      setGtdText(data.gtd_text);
      setNextActions(data.next_actions);
      setUserEntries(data.user_entries);
      const msg = `Reloaded ${new Date().toLocaleTimeString()}`;
      showStatus(msg);
      reloadStatusTimeout.current = setTimeout(() => hideStatusIfMatches(msg), 2000);
    } catch (e) {
      console.error('Failed to load state:', e);
      showStatus('Failed to load state', true);
    } finally {
      setIsLoading(false);
    }
  }, [showStatus, hideStatusIfMatches]);

  const refreshNextActionsInBackground = useCallback(async () => {
    try {
      showStatus('Updating next actions...');
      const naJob = await api.refreshNextActions();
      const naResult = await api.pollJob(naJob.job_id);
      if (!naResult.error) {
        await api.applyNextActions(naResult);
        setNextActions(naResult);
      }
      hideStatus();
    } catch (e) {
      console.error('Failed to refresh next actions:', e);
      hideStatus();
    }
  }, [showStatus, hideStatus]);

  const submitEntry = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      showStatus('Processing...');

      // Submit entry
      const submitData = await api.submitEntry(text);
      if ((submitData as any).error) {
        showStatus((submitData as any).error, true);
        return;
      }

      // Poll for commands
      showStatus('Getting commands from LLM...');
      const result = await api.pollJob(submitData.job_id, (p) => {
        if (p !== undefined) showStatus(`Processing... ${p}%`);
      });

      if (result.error) {
        showStatus(result.error, true);
        return;
      }

      // Apply commands
      showStatus('Applying changes...');
      const applyData = await api.applyCommands(
        result.commands,
        submitData.user_text || text,
        submitData.timestamp || Math.floor(Date.now() / 1000)
      );

      if (applyData.error) {
        showStatus(applyData.error, true);
        return;
      }

      // Update state
      setGtdText(applyData.gtd_text);
      setDiffLines(applyData.diff_lines);
      setUserEntries(prev => [...prev, {
        timestamp: submitData.timestamp || Math.floor(Date.now() / 1000),
        text: submitData.user_text || text,
      }]);

      // Refresh next actions
      await refreshNextActionsInBackground();
    } catch (e: any) {
      showStatus(`Error: ${e.message}`, true);
    }
  }, [showStatus, refreshNextActionsInBackground]);

  const doUndo = useCallback(async () => {
    try {
      showStatus('Undoing...');
      const data = await api.undo();

      if (data.error) {
        showStatus(data.error, true);
        return;
      }

      setGtdText(data.gtd_text);
      setDiffLines(data.diff_lines);
      setUserEntries(data.user_entries);

      await refreshNextActionsInBackground();
    } catch (e: any) {
      showStatus(`Error: ${e.message}`, true);
    }
  }, [showStatus, refreshNextActionsInBackground]);

  const doReview = useCallback(async () => {
    try {
      showStatus('Running review...');
      const jobData = await api.getReview();
      const result = await api.pollJob(jobData.job_id, (p) => {
        if (p !== undefined) showStatus(`Running review... ${p}%`);
      });

      hideStatus();

      if (result.error) {
        showModal('Error', result.error);
        return;
      }

      setPendingReviewText(result.review_text);
      showModal('Review', result.review_text || '(no changes)', true, 'review');
    } catch (e: any) {
      showStatus(`Error: ${e.message}`, true);
    }
  }, [showStatus, hideStatus, showModal]);

  const doAdvice = useCallback(async () => {
    try {
      showStatus('Getting advice...');
      const jobData = await api.getAdvice();
      const result = await api.pollJob(jobData.job_id, (p) => {
        if (p !== undefined) showStatus(`Getting advice... ${p}%`);
      });

      hideStatus();

      if (result.error) {
        showModal('Error', result.error);
      } else {
        showModal('Advice', result.advice || '(no advice)', false, 'advice');
      }
    } catch (e: any) {
      showStatus(`Error: ${e.message}`, true);
    }
  }, [showStatus, hideStatus, showModal]);

  const doCompact = useCallback(async () => {
    try {
      showStatus('Getting compact suggestions...');
      const jobData = await api.getCompact();
      const result = await api.pollJob(jobData.job_id, (p) => {
        if (p !== undefined) showStatus(`Getting suggestions... ${p}%`);
      });

      hideStatus();

      if (result.error) {
        showModal('Error', result.error);
        return;
      }

      const suggestions: api.CompactSuggestion[] = result.suggestions || [];
      if (suggestions.length === 0) {
        showModal('Compact', 'No changes suggested.');
        return;
      }

      // Build entries lookup
      const entriesByTs: Record<number, api.UserEntry> = {};
      for (const e of userEntries) {
        entriesByTs[e.timestamp] = e;
      }

      // Separate deletions and edits
      const deletions: number[] = [];
      const edits: { timestamp: number; new_text: string }[] = [];
      for (const s of suggestions) {
        if (entriesByTs[s.timestamp]) {
          if (s.new_text === null) {
            deletions.push(s.timestamp);
          } else {
            edits.push({ timestamp: s.timestamp, new_text: s.new_text });
          }
        }
      }

      // Format text
      let text = 'User entry cleanup suggestions:\n\n';

      if (deletions.length > 0) {
        text += `Delete: ${deletions.length} entries\n`;
        const showCount = Math.min(deletions.length, 10);
        for (let i = 0; i < showCount; i++) {
          const ts = deletions[i];
          const entry = entriesByTs[ts];
          const preview = (entry?.text || '').replace(/\n/g, ' ').substring(0, 80);
          text += `  ${preview}\n`;
        }
        if (deletions.length > 10) {
          text += `  ... and ${deletions.length - 10} more\n`;
        }
        text += '\n';
      }

      if (edits.length > 0) {
        text += `Edit: ${edits.length} entries\n`;
        const showCount = Math.min(edits.length, 10);
        for (let i = 0; i < showCount; i++) {
          const edit = edits[i];
          const entry = entriesByTs[edit.timestamp];
          const oldPreview = (entry?.text || '').replace(/\n/g, ' ').substring(0, 60);
          const newPreview = edit.new_text.substring(0, 60);
          text += `  ${oldPreview}\n`;
          text += `    -> ${newPreview}\n`;
        }
        if (edits.length > 10) {
          text += `  ... and ${edits.length - 10} more\n`;
        }
      }

      setPendingCompactSuggestions(suggestions);
      showModal('Compact Suggestions', text, true, 'compact');
    } catch (e: any) {
      showStatus(`Error: ${e.message}`, true);
    }
  }, [showStatus, hideStatus, showModal, userEntries]);

  const applyModalAction = useCallback(async () => {
    if (modalType === 'review' && pendingReviewText) {
      closeModal();
      try {
        showStatus('Applying review...');
        const data = await api.applyReview(pendingReviewText);

        if (data.error) {
          showStatus(data.error, true);
          return;
        }

        setGtdText(data.gtd_text);
        setDiffLines(data.diff_lines);

        await refreshNextActionsInBackground();
      } catch (e: any) {
        showStatus(`Error: ${e.message}`, true);
      }
    } else if (modalType === 'compact' && pendingCompactSuggestions) {
      closeModal();
      try {
        showStatus('Applying compact...');
        const data = await api.applyCompact(pendingCompactSuggestions);

        if ((data as any).error) {
          showStatus((data as any).error, true);
          return;
        }

        setUserEntries(data.user_entries);
        hideStatus();
      } catch (e: any) {
        showStatus(`Error: ${e.message}`, true);
      }
    }
  }, [modalType, pendingReviewText, pendingCompactSuggestions, closeModal, showStatus, hideStatus, refreshNextActionsInBackground]);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, [loadState]);

  return (
    <GTDContext.Provider
      value={{
        gtdText,
        nextActions,
        userEntries,
        diffLines,
        isLoading,
        status,
        statusIsError,
        modalVisible,
        modalTitle,
        modalContent,
        modalShowApply,
        modalType,
        loadState,
        submitEntry,
        doUndo,
        doReview,
        doAdvice,
        doCompact,
        applyModalAction,
        closeModal,
        clearDiff,
      }}
    >
      {children}
    </GTDContext.Provider>
  );
}

export function useGTD() {
  const context = useContext(GTDContext);
  if (!context) {
    throw new Error('useGTD must be used within a GTDProvider');
  }
  return context;
}
