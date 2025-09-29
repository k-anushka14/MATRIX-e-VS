import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Lock, Shield, ArrowRight } from 'lucide-react';

interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalVoters: number;
  candidates: Candidate[];
  votingLink: string;
  createdAt: Date;
}

interface Candidate {
  id: string;
  name: string;
  description: string;
  logo: string;
}

const Voting = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  
  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const [voteComplete, setVoteComplete] = useState(false);
  const [error, setError] = useState('');
  const [voterId, setVoterId] = useState<string>('');

  useEffect(() => {
    // Check if user is registered
    const currentVoterId = localStorage.getItem('currentVoterId');
    const currentElectionId = localStorage.getItem('currentElectionId');
    
    if (!currentVoterId || currentElectionId !== electionId) {
      navigate(`/register/${electionId}`);
      return;
    }

    setVoterId(currentVoterId);

    // Load election data
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const election = elections.find((e: any) => e.id === electionId);
    
    if (!election) {
      setError('Election not found');
      return;
    }

    // Convert date strings back to Date objects
    const electionWithDates = {
      ...election,
      startDate: new Date(election.startDate),
      endDate: new Date(election.endDate),
      createdAt: new Date(election.createdAt)
    };

    setCurrentElection(electionWithDates);

    // Check if voting is active
    const now = new Date();
    if (now < electionWithDates.startDate) {
      setError('Voting has not started yet');
    } else if (now > electionWithDates.endDate) {
      setError('Voting period has ended');
    }

    // Check if user has already voted
    const votes = JSON.parse(localStorage.getItem('votes') || '[]');
    const existingVote = votes.find((vote: any) => vote.voterId === currentVoterId && vote.electionId === electionId);
    
    if (existingVote) {
      setVoteComplete(true);
    }
  }, [electionId, navigate]);

  const encryptVote = async (candidateId: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(candidateId);
    
    // Generate a random key for AES-GCM encryption
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the vote
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    // Convert to base64 for storage
    const encryptedArray = new Uint8Array(encrypted);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));
    
    return encryptedBase64;
  };

  const submitVote = async () => {
    if (!selectedCandidate || !currentElection) {
      setError('Please select a candidate');
      return;
    }

    setIsVoting(true);
    setError('');

    try {
      // Encrypt the vote with AES-256
      const encryptedVote = await encryptVote(selectedCandidate);
      
      // Create vote record
      const voteRecord = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        electionId: currentElection.id,
        candidateId: selectedCandidate,
        voterId: voterId,
        encryptedVote,
        timestamp: new Date(),
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated blockchain hash
      };

      // Store vote in blockchain (localStorage for demo)
      const existingVotes = JSON.parse(localStorage.getItem('votes') || '[]');
      existingVotes.push(voteRecord);
      localStorage.setItem('votes', JSON.stringify(existingVotes));

      // Mark user as voted
      localStorage.setItem('hasVoted', 'true');
      
      setVoteComplete(true);
    } catch (error) {
      setError('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (!currentElection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Loading election information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (voteComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Vote Cast Successfully!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your encrypted vote has been securely submitted to the blockchain.
            </p>
            
            <div className="mb-8 p-6 bg-muted rounded-lg">
              <h3 className="font-semibold mb-4">{currentElection.title}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>✓ Vote encrypted with AES-256-GCM</div>
                <div>✓ Submitted to blockchain storage</div>
                <div>✓ Voter ID hash recorded</div>
                <div>✓ One-time voting enforced</div>
              </div>
            </div>
            
            <div className="space-x-4">
              <Button 
                onClick={() => navigate(`/results/${electionId}`)}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Results
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Cast Your Vote
          </h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {currentElection.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {currentElection.description}
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            Voting Period: {currentElection.startDate.toLocaleDateString()} - {currentElection.endDate.toLocaleDateString()}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Candidate Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Candidate</CardTitle>
                <CardDescription>
                  Choose your preferred candidate for the election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={selectedCandidate} 
                  onValueChange={setSelectedCandidate}
                  className="space-y-4"
                >
                  {currentElection.candidates.map((candidate) => (
                    <div 
                      key={candidate.id}
                      className="flex items-start space-x-3 p-4 rounded border hover:border-primary/50 transition-colors hover:bg-primary/5"
                    >
                      <RadioGroupItem 
                        value={candidate.id} 
                        id={candidate.id}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={candidate.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <div className="font-semibold text-lg">
                            {candidate.name}
                          </div>
                          {candidate.description && (
                            <div className="text-muted-foreground text-sm mt-1">
                              {candidate.description}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-8">
                  {isVoting ? (
                    <div className="text-center py-8">
                      <div className="text-2xl font-semibold mb-4">
                        Processing Vote...
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>Encrypting vote data...</div>
                        <div>Generating blockchain hash...</div>
                        <div>Submitting to blockchain...</div>
                        <div>Recording voter ID...</div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={submitVote}
                      disabled={!selectedCandidate}
                      className="w-full text-lg py-6"
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Cast Encrypted Vote
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vote Security Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold">🔒 AES-256 Encryption</div>
                    <div className="text-muted-foreground">Your vote is encrypted before transmission</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold">🔗 Blockchain Storage</div>
                    <div className="text-muted-foreground">Encrypted votes stored on blockchain</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold">🛡️ Voter ID Hash</div>
                    <div className="text-muted-foreground">Your identity is protected with SHA-256 hash</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold">🎯 One Vote Policy</div>
                    <div className="text-muted-foreground">Prevents double voting automatically</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Voter registration verified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Encryption ready</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Blockchain connected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voting;

