import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  ArrowLeft,
  Save
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

const CreateElection = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    totalVoters: 100
  });
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newCandidate, setNewCandidate] = useState({ 
    name: '', 
    description: '', 
    logo: '' 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCandidate = () => {
    if (!newCandidate.name.trim()) {
      setError('Candidate name is required');
      return;
    }

    const candidate: Candidate = {
      id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newCandidate.name.trim(),
      description: newCandidate.description.trim(),
      logo: newCandidate.logo.trim()
    };

    setCandidates(prev => [...prev, candidate]);
    setNewCandidate({ name: '', description: '', logo: '' });
    setError('');
  };

  const removeCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Election title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Election description is required');
      return false;
    }
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }
    if (formData.totalVoters < 1) {
      setError('Total voters must be at least 1');
      return false;
    }
    if (candidates.length < 2) {
      setError('At least 2 candidates are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create election
      const electionId = `election_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const votingLink = `${window.location.origin}/vote/${electionId}`;
      
      const newElection: Election = {
        id: electionId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        totalVoters: formData.totalVoters,
        candidates,
        votingLink,
        createdAt: new Date()
      };

      // Save to localStorage
      const existingElections = JSON.parse(localStorage.getItem('elections') || '[]');
      existingElections.push(newElection);
      localStorage.setItem('elections', JSON.stringify(existingElections));

      // Navigate to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to create election. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Create New Election
          </h1>
          <p className="text-muted-foreground mt-1">
            Set up a new voting election with candidates and timeline
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Election Details
              </CardTitle>
              <CardDescription>
                Configure the basic information for your election
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Election Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Student Council Election 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and scope of this election..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalVoters">Expected Total Voters *</Label>
                <Input
                  id="totalVoters"
                  type="number"
                  min="1"
                  value={formData.totalVoters}
                  onChange={(e) => handleInputChange('totalVoters', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Candidates
              </CardTitle>
              <CardDescription>
                Add candidates who will be running in this election
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Candidate Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Candidate Name *</Label>
                    <Input
                      id="candidateName"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter candidate name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidateLogo">Logo URL</Label>
                    <Input
                      id="candidateLogo"
                      value={newCandidate.logo}
                      onChange={(e) => setNewCandidate(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="candidateDescription">Description</Label>
                  <Textarea
                    id="candidateDescription"
                    value={newCandidate.description}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description about the candidate..."
                  />
                </div>

                <Button
                  type="button"
                  onClick={addCandidate}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              </div>

              {/* Candidates List */}
              {candidates.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">
                    Added Candidates ({candidates.length})
                  </h3>
                  <div className="space-y-3">
                    {candidates.map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-4 bg-muted rounded border"
                      >
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-semibold">{candidate.name}</p>
                            {candidate.description && (
                              <p className="text-sm text-muted-foreground">{candidate.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCandidate(candidate.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Election
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateElection;