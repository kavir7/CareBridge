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


 const previousSummaries = [
  {
    id: 1,
    date: "2025-08-03 3:46AM",
    summary: "Vivaan reported sustaining a chemical burn on his left forearm following a lab accident involving concentrated sulfuric acid. He performed immediate irrigation for 20 minutes under cool running water. Our agent confirmed that decontamination was done correctly and reviewed signs of coagulative necrosis common with acidic burns. Vivaan was advised to avoid occlusive dressings in the acute phase."
  },
  {
    id: 2,
    date: "2025-08-03 4:57AM",
    summary: "Vivaan expressed concern over continued erythema and a stinging sensation despite using a non-adherent dressing. He was unsure if deeper tissue damage had occurred. Our agent explained the difference between superficial and deep partial-thickness burns, and noted that delayed tissue necrosis can occur in chemical exposures. Vivaan agreed to schedule a wound assessment with outpatient dermatology."
  },
  {
    id: 3,
    date: "2025-08-03 6:17AM",
    summary: "Vivaan reported that his burn was classified as a superficial partial-thickness injury involving the epidermis and superficial dermis. He was prescribed 1% silver sulfadiazine and given instructions to maintain a moist wound environment to promote re-epithelialization. Our agent emphasized the importance of avoiding hydrogen peroxide or iodine-based antiseptics, which can delay healing."
  },
  {
    id: 4,
    date: "2025-08-03 8:50AM",
    summary: "Vivaan noted reduced pain and early signs of epithelial regeneration along the wound margins. He mentioned a follow-up consult confirmed no eschar formation and good capillary refill across the affected area. Our agent discussed the role of hydrocolloid dressings in managing exudate and minimizing trauma during dressing changes. Vivaan confirmed consistent application of topical agents."
  },
  {
    id: 5,
    date: "2025-08-03 8:52AM",
    summary: "Vivaan reflected on the importance of PPE compliance and chemical spill protocols. He mentioned his lab supervisor has now implemented a calcium gluconate gel station near all acid storage units. Our agent acknowledged the systemic approach to lab safety and encouraged him to report any signs of delayed hypersensitivity. Vivaan confirmed he is keeping photographic wound documentation for follow-up."
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
    <div className="min-h-screen">
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
                    <span className="text-sm text-gray-500">{session.date}</span>
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