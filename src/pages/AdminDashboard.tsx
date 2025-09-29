import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye,
  Copy,
  LogOut,
  BarChart3,
  Users,
  Calendar,
  Clock
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  description: string;
  logo: string;
}

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState<Election[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('admin-authenticated');
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }

    // Load elections
    const savedElections = JSON.parse(localStorage.getItem('elections') || '[]');
    const electionsWithDates = savedElections.map((election: any) => ({
      ...election,
      startDate: new Date(election.startDate),
      endDate: new Date(election.endDate),
      createdAt: new Date(election.createdAt)
    }));
    setElections(electionsWithDates);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin-authenticated');
    localStorage.removeItem('admin-email');
    navigate('/admin/login');
  };

  const copyToClipboard = async (text: string, electionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(electionId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getElectionStatus = (election: Election) => {
    const now = new Date();
    if (election.startDate > now) return { status: 'upcoming', color: 'bg-blue-500' };
    if (election.endDate < now) return { status: 'completed', color: 'bg-green-500' };
    return { status: 'active', color: 'bg-orange-500' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const adminEmail = localStorage.getItem('admin-email') || 'admin@voting-system.com';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {adminEmail}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Elections</p>
                  <p className="text-2xl font-bold">{elections.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Elections</p>
                  <p className="text-2xl font-bold">
                    {elections.filter(e => getElectionStatus(e).status === 'active').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold">
                    {elections.filter(e => getElectionStatus(e).status === 'completed').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Voters</p>
                  <p className="text-2xl font-bold">
                    {elections.reduce((sum, e) => sum + e.totalVoters, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Election Management
          </h2>
          <Button
            onClick={() => navigate('/admin/create-election')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Election
          </Button>
        </div>

        {/* Elections List */}
        <div className="space-y-6">
          {elections.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Elections Created
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first election to get started with the voting system.
                </p>
                <Button
                  onClick={() => navigate('/admin/create-election')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Election
                </Button>
              </CardContent>
            </Card>
          ) : (
            elections.map((election) => {
              const status = getElectionStatus(election);
              
              return (
                <Card key={election.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {election.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {election.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${status.color} text-white`}>
                          {status.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div>
                        <p className="text-muted-foreground text-sm">Start Date</p>
                        <p className="font-mono text-sm">
                          {formatDate(election.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">End Date</p>
                        <p className="font-mono text-sm">
                          {formatDate(election.endDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Total Voters</p>
                        <p className="font-mono text-sm">
                          {election.totalVoters}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Candidates</p>
                        <p className="font-mono text-sm">
                          {election.candidates.length}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/results/${election.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(election.votingLink, election.id)}
                      >
                        {copiedLink === election.id ? (
                          <>✓ Copied</>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    </div>

                    {election.votingLink && (
                      <div className="mt-4 p-3 bg-muted rounded border">
                        <p className="text-muted-foreground text-xs mb-1">Voting Link:</p>
                        <p className="font-mono text-xs break-all">
                          {election.votingLink}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;