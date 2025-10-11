import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Election, Candidate, Vote, ElectionStats, VoterRegistration } from '@/types/election';

interface ElectionContextType {
  elections: Election[];
  currentElection: Election | null;
  votes: Vote[];
  voterRegistrations: VoterRegistration[];
  createElection: (electionData: Omit<Election, 'id' | 'createdAt' | 'createdBy' | 'votingLink'>) => string;
  updateElection: (id: string, updates: Partial<Election>) => void;
  deleteElection: (id: string) => void;
  setCurrentElection: (election: Election | null) => void;
  addVote: (vote: Vote) => void;
  registerVoter: (registration: VoterRegistration) => void;
  getElectionStats: (electionId: string) => ElectionStats | null;
  isVotingActive: (electionId: string) => boolean;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [elections, setElections] = useState<Election[]>([]);
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voterRegistrations, setVoterRegistrations] = useState<VoterRegistration[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const savedElections = localStorage.getItem('evs-elections');
    const savedVotes = localStorage.getItem('evs-votes');
    const savedRegistrations = localStorage.getItem('evs-voter-registrations');

    if (savedElections) {
      const parsedElections = JSON.parse(savedElections).map((election: any) => ({
        ...election,
        startDate: new Date(election.startDate),
        endDate: new Date(election.endDate),
        createdAt: new Date(election.createdAt)
      }));
      setElections(parsedElections);
    }

    if (savedVotes) {
      const parsedVotes = JSON.parse(savedVotes).map((vote: any) => ({
        ...vote,
        timestamp: new Date(vote.timestamp)
      }));
      setVotes(parsedVotes);
    }

    if (savedRegistrations) {
      const parsedRegistrations = JSON.parse(savedRegistrations).map((reg: any) => ({
        ...reg,
        registrationDate: new Date(reg.registrationDate)
      }));
      setVoterRegistrations(parsedRegistrations);
    }
  }, []);

  const saveElections = (newElections: Election[]) => {
    setElections(newElections);
    localStorage.setItem('evs-elections', JSON.stringify(newElections));
  };

  const saveVotes = (newVotes: Vote[]) => {
    setVotes(newVotes);
    localStorage.setItem('evs-votes', JSON.stringify(newVotes));
  };

  const saveRegistrations = (newRegistrations: VoterRegistration[]) => {
    setVoterRegistrations(newRegistrations);
    localStorage.setItem('evs-voter-registrations', JSON.stringify(newRegistrations));
  };

  const createElection = (electionData: Omit<Election, 'id' | 'createdAt' | 'createdBy' | 'votingLink'>): string => {
    const id = `election_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const votingLink = `${window.location.origin}/election/${id}`;
    
    const newElection: Election = {
      ...electionData,
      id,
      createdAt: new Date(),
      createdBy: 'admin', // In real app, this would be the logged-in admin ID
      votingLink
    };

    const updatedElections = [...elections, newElection];
    saveElections(updatedElections);
    return id;
  };

  const updateElection = (id: string, updates: Partial<Election>) => {
    const updatedElections = elections.map(election =>
      election.id === id ? { ...election, ...updates } : election
    );
    saveElections(updatedElections);
  };

  const deleteElection = (id: string) => {
    const updatedElections = elections.filter(election => election.id !== id);
    saveElections(updatedElections);
    
    // Also remove related votes and registrations
    const updatedVotes = votes.filter(vote => vote.electionId !== id);
    saveVotes(updatedVotes);
    
    const updatedRegistrations = voterRegistrations.filter(reg => reg.electionId !== id);
    saveRegistrations(updatedRegistrations);
  };

  const addVote = (vote: Vote) => {
    const updatedVotes = [...votes, vote];
    saveVotes(updatedVotes);
  };

  const registerVoter = (registration: VoterRegistration) => {
    const updatedRegistrations = [...voterRegistrations, registration];
    saveRegistrations(updatedRegistrations);
  };

  const getElectionStats = (electionId: string): ElectionStats | null => {
    const election = elections.find(e => e.id === electionId);
    if (!election) return null;

    const electionVotes = votes.filter(v => v.electionId === electionId);
    const totalVotes = electionVotes.length;
    const turnoutPercentage = (totalVotes / election.totalVoters) * 100;

    const candidateResults = election.candidates.map(candidate => {
      const candidateVotes = electionVotes.filter(v => v.candidateId === candidate.id).length;
      const percentage = totalVotes > 0 ? (candidateVotes / totalVotes) * 100 : 0;
      
      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        votes: candidateVotes,
        percentage
      };
    });

    return {
      totalVotes,
      turnoutPercentage,
      candidateResults
    };
  };

  const isVotingActive = (electionId: string): boolean => {
    const election = elections.find(e => e.id === electionId);
    if (!election) return false;
    
    const now = new Date();
    return election.startDate <= now && now <= election.endDate && election.status === 'active';
  };

  return (
    <ElectionContext.Provider value={{
      elections,
      currentElection,
      votes,
      voterRegistrations,
      createElection,
      updateElection,
      deleteElection,
      setCurrentElection,
      addVote,
      registerVoter,
      getElectionStats,
      isVotingActive
    }}>
      {children}
    </ElectionContext.Provider>
  );
};

export const useElection = (): ElectionContextType => {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
};
