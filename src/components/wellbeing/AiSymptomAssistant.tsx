import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function AiSymptomAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Greetings, Astronaut. I am your biomedical triage assistant. Report any symptoms or discomfort you are experiencing (e.g., headache, lower back tension, vertigo).' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    // Simulate AI diagnostic follow-up logic matching your research
    setTimeout(() => {
      let aiResponse = "Analyzing symptom against microgravity fluid shift and sleep deficit logs...";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('headache') || lower.includes('head') || lower.includes('pressure')) {
        aiResponse = "Detected keyword: Head/Sinus Pressure. Correlation found: Cephalad fluid shift combined with potential sleep debt. Recommended protocol: Check cabin ventilation, avoid sudden head tilts, and log hydration levels.";
      } else if (lower.includes('back') || lower.includes('spine') || lower.includes('pain')) {
        aiResponse = "Detected keyword: Spinal Discomfort. Correlation found: Microgravity spinal elongation and intervertebral disk expansion. Recommended protocol: Perform gentle stretching using elastic restraint straps.";
      } else {
        aiResponse = "Symptom logged[cite: 4]. Based on your recent 6-hour sleep average and check-in score, flight surgeon Muss has been notified for secondary review. Are you experiencing any dizziness or visual changes?";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[500px]">
      <div className="border-b border-slate-800 pb-3 mb-4">
        <h2 className="text-lg font-semibold text-cyan-300">AI Symptom & Wellbeing Assistant</h2>
        <p className="text-xs text-slate-400">Context-aware triage linked to sleep history and 3D diagnostics[cite: 4]</p>
      </div>

      {/* Chat Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 text-slate-400 p-3 rounded-xl text-xs animate-pulse">
              Analyzing telemetry and generating clinical response...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="mt-4 flex gap-2 pt-3 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe symptoms or ask health query..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-base text-slate-200 focus:border-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 min-h-[2.75rem] min-w-[2.75rem] bg-cyan-600 active:bg-cyan-500 text-white rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}