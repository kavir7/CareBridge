'use client';

import { useState, useEffect } from 'react';

interface UserData {
  patient_name: string;
  medication: string;
  doctor: string;
}

export default function MeetingWithAIPage() {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showAllSummaries, setShowAllSummaries] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const contextText = "Kavir told our AI agent he began feeling dizzy two days after donating a kidney, with symptoms worsening when standing. He also mentioned some nausea. Our agent explained it could be orthostatic hypotension, likely from low blood pressure or mild dehydration. Kavir doesn't have a blood pressure monitor and was advised to visit urgent care if the dizziness worsens or he feels faint. He confirmed no chest pain and normal urination.";

  // Sample previous summaries - all Kavir's kidney-related sessions
  const previousSummaries = [
    {
      id: 1,
      date: "2025-07-30",
      summary: "Kavir reported continued improvement in his post-donation recovery. He mentioned that his energy levels are returning to normal and he's been cleared to resume light exercise. Our agent discussed gradual activity progression and reminded him about staying hydrated. He confirmed his follow-up appointment with nephrology is scheduled for next week."
    },
    {
      id: 2,
      date: "2025-07-28",
      summary: "Kavir expressed concerns about long-term kidney function after his donation. He's been researching online and feels anxious about potential complications. Our agent provided reassurance about donor outcomes and emphasized following medical guidance over internet research. He agreed to discuss these concerns with his transplant team."
    },
    {
      id: 3,
      date: "2025-07-25",
      summary: "Kavir discussed his surgical site healing progress. He noted some mild itching around the incision but no signs of infection. Our agent reminded him about proper wound care and when to contact his surgeon. He confirmed he's been taking his prescribed medications consistently and monitoring his blood pressure daily."
    },
    {
      id: 4,
      date: "2025-07-22",
      summary: "Kavir shared updates on his recipient brother's progress, expressing relief that the transplant was successful. He mentioned feeling emotionally fulfilled by his decision to donate. Our agent acknowledged his generosity while reminding him to focus on his own recovery needs. He confirmed adequate pain management and good appetite."
    },
    {
      id: 5,
      date: "2025-07-20", 
      summary: "Kavir reported his first week post-donation went smoothly. He mentioned some expected surgical pain and fatigue but felt optimistic overall. Our agent reviewed activity restrictions and signs to watch for. He confirmed family support at home and understanding of when to seek medical attention if symptoms worsen."
    }
  ];

  useEffect(() => {
    if (showTypewriter) {
      let index = 0;
      const timer = setInterval(() => {
        if (index < contextText.length) {
          setDisplayedText(contextText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 30); // Adjust speed here (lower = faster)

      return () => clearInterval(timer);
    }
  }, [showTypewriter]);

  const handleContextOver = () => {
    setShowTypewriter(true);
    setDisplayedText('');
    setShowAllSummaries(false);
  };

  const handleViewAllSummaries = () => {
    setShowAllSummaries(true);
    setShowTypewriter(false);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-2xl font-medium text-gray-900 tracking-tight">AI Recovery Check-in</h1>
              <p className="text-gray-600 mt-1">Connect with your AI assistant for wellness support</p>
            </div>
            <button
              onClick={handleViewAllSummaries}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              View All Summaries
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* AI Assistant Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">AI Session</h2>
            <p className="text-gray-600 text-sm">Your conversation with the AI wellness assistant</p>
          </div>

          {/* ElevenLabs Widget Placeholder */}
          <div className="mb-6 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <div 
              dangerouslySetInnerHTML={{
                __html: `
                  <elevenlabs-convai agent-id="agent_1601k1q01gsae9jae5wr2jj0dv7y"></elevenlabs-convai>
                  <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
                `,
              }}
            />
          </div>

          {/* Context Over Button */}
          <div className="text-center">
            <button
              onClick={handleContextOver}
              className="px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Context is Over
            </button>
          </div>
        </div>

        {/* Typewriter Text Display */}
        {showTypewriter && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Session Summary</h3>
              <div className="w-full h-px bg-gray-200"></div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-800 leading-relaxed font-mono text-sm">
                {displayedText}
                <span className="animate-pulse">|</span>
              </p>
            </div>
          </div>
        )}

        {/* All Summaries Display */}
        {showAllSummaries && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">All Session Summaries</h3>
                <button
                  onClick={() => setShowAllSummaries(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <div className="w-full h-px bg-gray-200"></div>
            </div>
            
            <div className="space-y-6">
              {previousSummaries.map((session, index) => (
                <div key={session.id} className="border-l-4 border-gray-200 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">Session #{previousSummaries.length - index}</h4>
                    <span className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed font-mono">
                    {session.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}