export interface Candidate {
  id: string;
  name: string;
  logo?: string;
  description?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalVoters: number;
  candidates: Candidate[];
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  createdBy: string;
  votingLink?: string;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  encryptedVote: string;
  timestamp: Date;
  blockHash?: string;
}

export interface ElectionStats {
  totalVotes: number;
  turnoutPercentage: number;
  candidateResults: {
    candidateId: string;
    candidateName: string;
    votes: number;
    percentage: number;
  }[];
}

export interface VoterRegistration {
  id: string;
  electionId: string;
  voterId: string;
  documents: {
    idProof?: string;
    addressProof?: string;
  };
  biometricHash?: string;
  isVerified: boolean;
  registrationDate: Date;
}

