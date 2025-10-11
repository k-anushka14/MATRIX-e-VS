import { useState, useEffect } from 'react';

export interface VotingState {
  isRegistered: boolean;
  hasVoted: boolean;
  canVerify: boolean;
  digitalFingerprint?: string;
}

export const useVotingFlow = () => {
  const [votingState, setVotingState] = useState<VotingState>({
    isRegistered: false,
    hasVoted: false,
    canVerify: false
  });

  useEffect(() => {
    // Load voting state from localStorage
    const savedState = localStorage.getItem('evs-voting-state');
    if (savedState) {
      setVotingState(JSON.parse(savedState));
    }
  }, []);

  const updateVotingState = (updates: Partial<VotingState>) => {
    const newState = { ...votingState, ...updates };
    setVotingState(newState);
    localStorage.setItem('evs-voting-state', JSON.stringify(newState));
  };

  const completeRegistration = (fingerprint: string) => {
    updateVotingState({
      isRegistered: true,
      digitalFingerprint: fingerprint
    });
  };

  const completeVoting = () => {
    updateVotingState({
      hasVoted: true,
      canVerify: true
    });
  };

  const resetFlow = () => {
    const resetState: VotingState = {
      isRegistered: false,
      hasVoted: false,
      canVerify: false
    };
    setVotingState(resetState);
    localStorage.removeItem('evs-voting-state');
  };

  return {
    votingState,
    completeRegistration,
    completeVoting,
    resetFlow
  };
};