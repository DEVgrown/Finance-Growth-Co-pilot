import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Settings, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import VoiceWaveform from "../components/voice/VoiceWaveform";
import ConversationHistory from "../components/voice/ConversationHistory";
import QuickCommands from "../components/voice/QuickCommands";

export default function ElevenLabs() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const recognitionRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ['voice-conversations'],
    queryFn: () => base44.entities.VoiceConversation.list('-conversation_date', 20),
    initialData: []
  });

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const businesses = await base44.entities.Business.list();
      return businesses[0];
    }
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);

        if (event.results[current].isFinal) {
          handleVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceCommand = async (command) => {
    setIsProcessing(true);
    try {
      const response = await processVoiceCommand(command);
      
      await base44.entities.VoiceConversation.create({
        user_input: command,
        ai_response: response.text,
        intent: response.intent,
        action_taken: response.action || "",
        conversation_date: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['voice-conversations'] });

      if (voiceEnabled && response.text) {
        await speak(response.text);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      await speak("Pole sana, sijaweza ku-process hiyo request. Jaribu tena.");
    }
    setIsProcessing(false);
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    const input = textInput;
    setTextInput("");
    await handleVoiceCommand(input);
  };

  const processVoiceCommand = async (command) => {
    // Fetch real data
    const [transactions, invoices, suppliers, forecasts] = await Promise.all([
      base44.entities.Transaction.list('-transaction_date', 90),
      base44.entities.Invoice.list('-created_date', 50),
      base44.entities.Supplier.list(),
      base44.entities.CashFlowForecast.list('-forecast_date', 5)
    ]);

    // Calculate comprehensive metrics
    const now = new Date();
    const last7Days = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      const diff = (now - tDate) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });

    const last30Days = transactions.filter(t => {
      const tDate = new Date(t.transaction_date);
      const diff = (now - tDate) / (1000 * 60 * 60 * 24);
      return diff <= 30;
    });

    const weekIncome = last7Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const weekExpenses = last7Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthIncome = last30Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthExpenses = last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    const pendingInvoices = invoices.filter(i => i.status === 'sent');
    const totalOutstanding = [...overdueInvoices, ...pendingInvoices].reduce((sum, i) => sum + i.total_amount, 0);

    const latestForecast = forecasts[0];

    // Create detailed context
    const context = `
Business: ${business?.business_name || 'SME'}
Owner: ${user?.full_name || 'Business Owner'}

FINANCIAL DATA (Last 7 Days):
- Income: KES ${weekIncome.toLocaleString()}
- Expenses: KES ${weekExpenses.toLocaleString()}
- Net: KES ${(weekIncome - weekExpenses).toLocaleString()}

FINANCIAL DATA (Last 30 Days):
- Income: KES ${monthIncome.toLocaleString()}
- Expenses: KES ${monthExpenses.toLocaleString()}
- Net: KES ${(monthIncome - monthExpenses).toLocaleString()}

INVOICES:
- Overdue: ${overdueInvoices.length} invoices (KES ${overdueInvoices.reduce((s, i) => s + i.total_amount, 0).toLocaleString()})
- Pending Payment: ${pendingInvoices.length} invoices (KES ${pendingInvoices.reduce((s, i) => s + i.total_amount, 0).toLocaleString()})
- Total Outstanding: KES ${totalOutstanding.toLocaleString()}

SUPPLIERS: ${suppliers.length} active suppliers

${latestForecast ? `CASH FLOW FORECAST (30 days):
- Predicted Income: KES ${latestForecast.predicted_income.toLocaleString()}
- Predicted Expenses: KES ${latestForecast.predicted_expenses.toLocaleString()}
- Risk Level: ${latestForecast.risk_level}` : ''}`;

    const prompt = `You are a financial AI assistant speaking in a mix of English and Kenyan Sheng slang (like "poa", "sasa", "dough", "manze"). Be friendly, conversational, and helpful.

User asked: "${command}"

${context}

Based on this REAL data, provide a helpful response. 
- Use actual numbers from the data above
- Be conversational and use some Sheng
- Keep it under 3 sentences for voice
- If they ask about cash flow, use the actual week/month data
- If they ask about invoices, mention the real overdue count
- Be specific and actionable

Also determine the intent from: cash_flow, invoice_status, payment_reminder, expense_analysis, supplier_info, credit_query, general_help, unknown`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          intent: { 
            type: "string",
            enum: ["cash_flow", "invoice_status", "payment_reminder", "expense_analysis", "supplier_info", "credit_query", "general_help", "unknown"]
          },
          text: { type: "string" },
          action: { type: "string" }
        }
      }
    });

    return aiResponse;
  };

  const speak = async (text) => {
    setIsSpeaking(true);

    if (useElevenLabs && elevenLabsKey) {
      try {
        // ElevenLabs API integration
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': elevenLabsKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => {
            setIsSpeaking(false);
            URL.revokeObjectURL(audioUrl);
          };
          audio.play();
          return;
        }
      } catch (error) {
        console.error("ElevenLabs error:", error);
      }
    }

    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Voice Assistant
          </h1>
          <p className="text-gray-600 mt-1">Sema na AI yako - Get instant financial insights</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      {showSettings && (
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Voice Responses</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-elevenlabs"
                  checked={useElevenLabs}
                  onChange={(e) => setUseElevenLabs(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="use-elevenlabs">Use ElevenLabs TTS (Better Quality)</Label>
              </div>
              {useElevenLabs && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                  <Input
                    id="elevenlabs-key"
                    type="password"
                    value={elevenLabsKey}
                    onChange={(e) => setElevenLabsKey(e.target.value)}
                    placeholder="sk_..."
                  />
                  <p className="text-xs text-gray-500">
                    Get your API key from elevenlabs.io
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-100 to-indigo-100">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-6">
                {isListening && <VoiceWaveform isActive={isListening} />}
                
                {!isListening && !isProcessing && (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl animate-pulse">
                      <Mic className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900">Ready to listen</p>
                    <p className="text-gray-600 mt-2">Tap the button below and ask anything about your finances</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                      <Sparkles className="w-16 h-16 text-white animate-spin" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900">Processing...</p>
                    <p className="text-gray-600 mt-2">AI is analyzing your request</p>
                  </div>
                )}

                {transcript && (
                  <Alert className="w-full bg-white">
                    <MessageSquare className="w-4 h-4" />
                    <AlertDescription>
                      <strong>You said:</strong> {transcript}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  {!isListening ? (
                    <Button
                      onClick={startListening}
                      size="lg"
                      disabled={isProcessing}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Listening
                    </Button>
                  ) : (
                    <Button
                      onClick={stopListening}
                      size="lg"
                      variant="destructive"
                      className="px-8"
                    >
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  )}

                  {isSpeaking && (
                    <Button
                      onClick={stopSpeaking}
                      size="lg"
                      variant="outline"
                    >
                      <VolumeX className="w-5 h-5 mr-2" />
                      Stop Speaking
                    </Button>
                  )}
                </div>

                <div className="w-full">
                  <form onSubmit={handleTextSubmit} className="flex gap-2">
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Or type your question here..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isProcessing || !textInput.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          <ConversationHistory conversations={conversations} />
        </div>

        <div>
          <QuickCommands onCommandClick={handleVoiceCommand} />
        </div>
      </div>
    </div>
  );
}


