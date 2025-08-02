'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UserData {
  patient_name: string;
  medication: string;
  doctor: string;
}

export default function MeetingWithAIPage() {
  const [summary, setSummary] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionId = localStorage.getItem('userSessionId');
      if (sessionId) {
        try {
          const response = await fetch(`http://localhost:5000/api/user_data?sessionId=${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSaveSummary = async () => {
    if (!eventId) {
      alert('Error: No event ID found.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          summary,
        }),
      });

      if (response.ok) {
        alert('Summary saved successfully!');
        setSummary('');
      } else {
        const errorData = await response.json();
        alert(`Failed to save summary: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving summary:', error);
      alert('An error occurred while saving the summary.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">AI Check-in</h1>
        <p className="text-gray-600 mb-8">
          Have a conversation with your AI assistant about your recovery progress.
        </p>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">ElevenLabs AI Assistant</h2>
          <div id="elevenlabs-widget-container">
            <elevenlabs-convai
              agent-id="agent_7401k1p7vny4fh786mwjhzr9jjm9"
              dynamic-variables={userData ? JSON.stringify(userData) : '{}'}
            >
            </elevenlabs-convai>
            <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Meeting Summary</h2>
          <textarea
            className="w-full h-40 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Enter a summary of the meeting..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveSummary}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              End Meeting & Save Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
