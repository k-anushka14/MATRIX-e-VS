import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Calendar, Clock } from 'lucide-react';

const VoterLanding = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Always redirect to registration when someone clicks a voting link
    navigate(`/register/${electionId}`);
  }, [electionId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Redirecting...</h2>
          <p className="text-muted-foreground">Taking you to the registration page...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterLanding;