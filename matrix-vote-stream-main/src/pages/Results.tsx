import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Download, Trophy, Users, BarChart3 } from 'lucide-react';

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

interface VoteResult {
  candidateId: string;
  candidateName: string;
  votes: number;
  percentage: number;
  color: string;
}

interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  voterName: string;
  encryptedVote: string;
  timestamp: Date;
  blockHash: string;
}

const Results = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();

  const [currentElection, setCurrentElection] = useState<Election | null>(null);
  const [results, setResults] = useState<VoteResult[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [turnoutPercentage, setTurnoutPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Colors for charts
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];

  useEffect(() => {
    // Check if user is admin
    const isAuthenticated = localStorage.getItem('admin-authenticated');
    setIsAdmin(!!isAuthenticated);

    // Load election data
    const elections = JSON.parse(localStorage.getItem('elections') || '[]');
    const election = elections.find((e: any) => e.id === electionId);

    if (!election) {
      setError('Election not found');
      setIsLoading(false);
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

    // Check if election has ended
    const now = new Date();
    if (now < electionWithDates.endDate) {
      setError('Results are only available after the election ends');
      setIsLoading(false);
      return;
    }

    // Load votes and calculate results
    setTimeout(() => {
      calculateResults(electionWithDates);
      setIsLoading(false);
    }, 2000);
  }, [electionId]);

  const calculateResults = (election: Election) => {
    // Load votes
    const votes: Vote[] = JSON.parse(localStorage.getItem('votes') || '[]');
    const electionVotes = votes.filter(vote => vote.electionId === election.id);

    setTotalVotes(electionVotes.length);
    setTurnoutPercentage((electionVotes.length / election.totalVoters) * 100);

    // Calculate candidate results
    const candidateResults: VoteResult[] = election.candidates.map((candidate, index) => {
      const candidateVotes = electionVotes.filter(vote => vote.candidateId === candidate.id).length;
      const percentage = electionVotes.length > 0 ? (candidateVotes / electionVotes.length) * 100 : 0;

      return {
        candidateId: candidate.id,
        candidateName: candidate.name,
        votes: candidateVotes,
        percentage: percentage,
        color: colors[index % colors.length]
      };
    });

    setResults(candidateResults);
  };

  const getWinner = () => {
    if (results.length === 0) return null;
    return results.reduce((prev, current) => (prev.votes > current.votes) ? prev : current);
  };

  const handleBackNavigation = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  const downloadResults = () => {
    if (!currentElection) return;

    // Prepare data for download
    const votes: Vote[] = JSON.parse(localStorage.getItem('votes') || '[]');
    const electionVotes = votes.filter(vote => vote.electionId === electionId);

    const downloadData = {
      election: {
        id: currentElection.id,
        title: currentElection.title,
        description: currentElection.description,
        startDate: currentElection.startDate.toISOString(),
        endDate: currentElection.endDate.toISOString(),
        totalVoters: currentElection.totalVoters,
        candidates: currentElection.candidates
      },
      results: results,
      summary: {
        totalVotes: totalVotes,
        turnoutPercentage: turnoutPercentage,
        winner: winner
      },
      votes: electionVotes.map((vote, index) => {
        const candidate = currentElection.candidates.find(c => c.id === vote.candidateId);
        return {
          voterHash: vote.voterId,
          candidateName: candidate?.name || 'Unknown',
          voteId: vote.id,
          timestamp: vote.timestamp,
          blockHash: vote.blockHash
        };
      }),
      generatedAt: new Date().toISOString()
    };

    // Create and download JSON file
    const dataStr = JSON.stringify(downloadData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `election-results-${currentElection.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-semibold mb-4">Calculating Results...</h2>
            <p className="text-muted-foreground mb-6">
              Processing votes and generating election statistics
            </p>
            <Progress value={66} className="w-full max-w-md mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold mb-4">
              Results Not Available
            </h1>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={handleBackNavigation}
            >
              {isAdmin ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winner = getWinner();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={handleBackNavigation}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {isAdmin ? 'Back to Dashboard' : 'Back to Home'}
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Election Results
            </h1>
            {currentElection && (
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {currentElection.title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {currentElection.description}
                </p>
                <div className="mt-2 text-sm text-muted-foreground">
                  Election Period: {currentElection.startDate.toLocaleDateString()} {currentElection.startDate.toLocaleTimeString()} - {currentElection.endDate.toLocaleDateString()} {currentElection.endDate.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Votes</p>
                  <p className="text-2xl font-bold">{totalVotes}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Turnout</p>
                  <p className="text-2xl font-bold">{turnoutPercentage.toFixed(1)}%</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Voters</p>
                  <p className="text-2xl font-bold">{currentElection?.totalVoters}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Winner</p>
                  <p className="text-lg font-bold">{winner?.candidateName || 'N/A'}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vote Distribution</CardTitle>
              <CardDescription>Number of votes per candidate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="candidateName"
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151'
                    }}
                  />
                  <Bar
                    dataKey="votes"
                    fill="#3b82f6"
                    stroke="#2563eb"
                    strokeWidth={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vote Percentage</CardTitle>
              <CardDescription>Percentage breakdown of all votes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={results}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="votes"
                  >
                    {results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: '#374151'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} votes (${props.payload.percentage.toFixed(1)}%)`,
                      props.payload.candidateName
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {results.map((result, index) => (
            <Card key={index} className={result === winner ? 'ring-2 ring-yellow-400' : ''}>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: result.color }}
                    >
                      {index + 1}
                    </div>
                    {result === winner && (
                      <Trophy className="w-6 h-6 text-yellow-500 ml-2" />
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-lg">
                      {result.candidateName}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold" style={{ color: result.color }}>
                      {result.percentage.toFixed(1)}%
                    </div>
                    <div className="text-muted-foreground font-mono text-sm">
                      {result.votes} votes
                    </div>
                  </div>

                  <Progress
                    value={result.percentage}
                    className="w-full"
                    style={{
                      backgroundColor: `${result.color}20`
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Voter Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Voter Information
            </CardTitle>
            <CardDescription>
              List of voters with their hashed identities and candidate choices for transparency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Load votes to get voter information
                const votes: Vote[] = JSON.parse(localStorage.getItem('votes') || '[]');
                const electionVotes = votes.filter(vote => vote.electionId === electionId);

                if (electionVotes.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No votes recorded yet</p>
                    </div>
                  );
                }

                // Sort votes by timestamp
                electionVotes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                return (
                  <div className="space-y-3">
                    {electionVotes.map((vote, index) => {
                      const candidate = currentElection?.candidates.find(c => c.id === vote.candidateId);
                      return (
                        <div key={vote.id} className="border rounded-lg p-4 bg-muted/30">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Voter Hash:</span>
                              <p className="font-mono text-xs break-all text-primary">{vote.voterId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Voted For:</span>
                              <p className="font-semibold text-green-600">{candidate?.name || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-muted">
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>Vote ID: {vote.id}</span>
                              <span>Time: {new Date(vote.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Winner Announcement */}
        {winner && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardContent className="p-8">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  🎉 Winner Announced! 🎉
                </h2>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {winner.candidateName}
                </h3>
                <p className="text-lg text-muted-foreground">
                  Won with {winner.votes} votes ({winner.percentage.toFixed(1)}% of total votes)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center space-x-4">
              <Button onClick={downloadResults}>
                <Download className="w-4 h-4 mr-2" />
                Download Results
              </Button>
              <Button
                variant="outline"
                onClick={handleBackNavigation}
              >
                {isAdmin ? 'Back to Dashboard' : 'Back to Home'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;