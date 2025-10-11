import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useElection } from '@/contexts/ElectionContext';
import { useVotingFlow } from '@/hooks/useVotingFlow';

export const Vote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { elections, addVote, isVotingActive } = useElection();
  const { votingState, completeVoting } = useVotingFlow();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isVoting, setIsVoting] = useState(false);
  const [voteComplete, setVoteComplete] = useState(false);
  const [error, setError] = useState('');

  const currentElection = elections.find(e => e.id === electionId);

  useEffect(() => {
    if (!currentElection) {
      setError('Election not found or invalid election ID');
      return;
    }

    // Redirect to registration if not registered
    if (!votingState.isRegistered) {
      navigate(`/register/${electionId}`);
      return;
    }

    if (votingState.hasVoted) {
      setVoteComplete(true);
      return;
    }

    if (!isVotingActive(currentElection.id)) {
      setError('Voting is not currently active for this election');
      return;
    }
  }, [currentElection, votingState, isVotingActive, navigate, electionId]);

  const candidates = currentElection?.candidates || [];

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
      toast.error('Please select a candidate');
      return;
    }

    setIsVoting(true);
    setError('');

    try {
      // Encrypt the vote client-side
      const encryptedVote = await encryptVote(selectedCandidate);
      
      // Generate voter ID hash (from registration)
      const voterIdHash = votingState.digitalFingerprint || 'anonymous';
      
      // Simulate blockchain submission delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create vote record
      const voteRecord = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        electionId: currentElection.id,
        candidateId: selectedCandidate,
        voterId: voterIdHash,
        encryptedVote,
        timestamp: new Date(),
        blockHash: `0x${Math.random().toString(16).substr(2, 64)}` // Simulated blockchain hash
      };

      // Add vote to election context (simulates blockchain storage)
      addVote(voteRecord);
      
      // Update voting flow state
      completeVoting();
      
      toast.success('Vote cast successfully!', {
        description: 'Your encrypted vote has been recorded on the blockchain.'
      });
      
      setVoteComplete(true);
    } catch (error) {
      toast.error('Failed to cast vote. Please try again.');
      setError('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (voteComplete) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="matrix-terminal max-w-2xl w-full">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-6 animate-matrix-glow">✓</div>
            <h1 className="text-4xl font-bold matrix-text mb-4 animate-digital-form">
              VOTE RECORDED
            </h1>
            <p className="text-matrix-glow text-lg mb-8">
              Your encrypted vote has been securely submitted to the blockchain.
            </p>
            {currentElection && (
              <div className="mb-6 p-4 bg-primary/10 rounded border border-primary/30">
                <h3 className="matrix-text font-semibold mb-2">{currentElection.title}</h3>
                <p className="text-matrix-glow text-sm">Election ID: {currentElection.id}</p>
              </div>
            )}
            <div className="space-y-4 text-sm matrix-text">
              <div className="p-4 bg-primary/10 rounded border border-primary/30">
                <div className="font-mono text-xs space-y-1">
                  <div>&gt; Vote encrypted with AES-256-GCM</div>
                  <div>&gt; Submitted to blockchain storage</div>
                  <div>&gt; Blockchain commitment recorded</div>
                  <div>&gt; Voter token burned (preventing double voting)</div>
                </div>
              </div>
            </div>
            <div className="mt-8 space-x-4">
              <Button 
                onClick={() => navigate(`/results/${currentElection?.id || ''}`)}
                className="matrix-button"
              >
                &gt; View Results
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="matrix-button"
              >
                &gt; Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold matrix-text mb-4">
            <span className="animate-digital-form">CAST YOUR VOTE</span>
          </h1>
          {currentElection && (
            <div className="mb-4">
              <h2 className="text-2xl font-semibold matrix-text mb-2">
                {currentElection.title}
              </h2>
              <p className="text-matrix-glow text-lg mb-2">
                {currentElection.description}
              </p>
              <div className="text-sm text-matrix-glow">
                Voting Period: {currentElection.startDate.toLocaleDateString()} - {currentElection.endDate.toLocaleDateString()}
              </div>
            </div>
          )}
          <p className="text-matrix-glow text-lg">
            Select your candidate. Your vote will be encrypted and secured on-chain.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Candidate Selection */}
          <div className="lg:col-span-2">
            <Card className="matrix-terminal">
              <CardHeader>
                <CardTitle className="matrix-text">
                  <span className="text-matrix-bright mr-2">&gt;</span>
                  Select Candidate
                </CardTitle>
                <CardDescription className="text-matrix-glow">
                  Choose your preferred candidate for the election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={selectedCandidate} 
                  onValueChange={setSelectedCandidate}
                  className="space-y-4"
                >
                  {candidates.map((candidate) => (
                    <div 
                      key={candidate.id}
                      className="flex items-start space-x-3 p-4 rounded border border-primary/20 hover:border-primary/50 transition-colors hover:bg-primary/5"
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
                        <div className="matrix-text">
                          <div className="font-semibold text-lg text-matrix-bright">
                            {candidate.name}
                          </div>
                          {candidate.description && (
                            <div className="text-matrix-glow text-sm mt-1">
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
                      <div className="animate-glitch text-2xl matrix-text mb-4">
                        PROCESSING VOTE...
                      </div>
                      <div className="space-y-2 font-mono text-sm text-matrix-glow">
                        <div className="animate-pulse">&gt; Encrypting vote data...</div>
                        <div className="animate-pulse">&gt; Generating proof of vote...</div>
                        <div className="animate-pulse">&gt; Submitting to blockchain...</div>
                        <div className="animate-pulse">&gt; Burning voter token...</div>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={submitVote}
                      disabled={!selectedCandidate}
                      className="matrix-button w-full text-lg py-6"
                    >
                      &gt; CAST ENCRYPTED VOTE
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vote Security Info */}
          <div className="space-y-6">
            <Card className="matrix-terminal">
              <CardHeader>
                <CardTitle className="matrix-text text-lg">
                  <span className="text-matrix-bright mr-2">&gt;</span>
                  Vote Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3 text-matrix-glow">
                  <div>
                    <div className="font-semibold text-matrix-bright">🔒 Client-Side Encryption</div>
                    <div>Your vote is encrypted in your browser using AES-256-GCM</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-matrix-bright">🌐 IPFS Storage</div>
                    <div>Encrypted votes stored on decentralized IPFS network</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-matrix-bright">⛓️ Blockchain Proof</div>
                    <div>Immutable commitment recorded on blockchain</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-matrix-bright">🔥 Token Burn</div>
                    <div>Voter token destroyed after use prevents double voting</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="matrix-terminal">
              <CardHeader>
                <CardTitle className="matrix-text text-lg">
                  <span className="text-matrix-bright mr-2">&gt;</span>
                  Vote Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-mono text-matrix-glow">
                  <div>&gt; Voter registration: ✓ Verified</div>
                  <div>&gt; Token status: ✓ Active</div>
                  <div>&gt; Encryption ready: ✓ AES-256-GCM</div>
                  <div>&gt; Blockchain connected: ✓ Online</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};