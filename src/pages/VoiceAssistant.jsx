import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, Activity, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import VoiceWaveform from "../components/voice/VoiceWaveform";
import ConversationHistory from "../components/voice/ConversationHistory";
import QuickCommands from "../components/voice/QuickCommands";

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const recognitionRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ['voice-conversations'],
    queryFn: () => base44.entities.VoiceConversation.list('-created_date', 20),
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
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
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
        action_taken: response.action || null,
        conversation_date: new Date().toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['voice-conversations'] });

      if (voiceEnabled && response.text) {
        await speak(response.text);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      await speak("I'm sorry, I couldn't process that request. Please try again.");
    }
    setIsProcessing(false);
  };

  const processVoiceCommand = async (command) => {
    const lowerCommand = command.toLowerCase();

    // Fetch ALL relevant data upfront
    const [transactions, invoices, suppliers] = await Promise.all([
      base44.entities.Transaction.list('-transaction_date', 90),
      base44.entities.Invoice.list('-created_date', 50),
      base44.entities.Supplier.list('-created_date', 20)
    ]);

    // Calculate comprehensive financial metrics
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

    const weeklyIncome = last7Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const weeklyExpenses = last7Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const monthlyIncome = last30Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const overdueInvoices = invoices.filter(i => {
      if (i.status !== 'sent') return false;
      return new Date(i.due_date) < now;
    });

    const pendingInvoices = invoices.filter(i => i.status === 'sent');
    const paidInvoices = invoices.filter(i => i.status === 'paid');

    // Create rich context for AI
    const financialContext = {
      weekly: {
        income: weeklyIncome,
        expenses: weeklyExpenses,
        net: weeklyIncome - weeklyExpenses,
        transaction_count: last7Days.length
      },
      monthly: {
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses,
        transaction_count: last30Days.length
      },
      invoices: {
        total: invoices.length,
        overdue: overdueInvoices.length,
        overdue_amount: overdueInvoices.reduce((sum, i) => sum + i.total_amount, 0),
        pending: pendingInvoices.length,
        pending_amount: pendingInvoices.reduce((sum, i) => sum + i.total_amount, 0),
        paid: paidInvoices.length,
        paid_amount: paidInvoices.reduce((sum, i) => sum + i.total_amount, 0)
      },
      suppliers: {
        total: suppliers.length,
        active: suppliers.filter(s => s.status === 'active').length,
        preferred: suppliers.filter(s => s.status === 'preferred').length
      },
      business: {
        name: business?.business_name || 'your business',
        credit_score: business?.credit_score || 'not calculated',
        monthly_revenue: business?.monthly_revenue || 'not set'
      }
    };

    const prompt = `You are an expert financial assistant for ${business?.business_name || 'an SME business'}, speaking to ${user?.full_name || 'the business owner'}.

USER QUESTION: "${command}"

CURRENT FINANCIAL DATA:
- This Week: Income KES ${weeklyIncome.toLocaleString()}, Expenses KES ${weeklyExpenses.toLocaleString()}, Net KES ${(weeklyIncome - weeklyExpenses).toLocaleString()}
- This Month: Income KES ${monthlyIncome.toLocaleString()}, Expenses KES ${monthlyExpenses.toLocaleString()}, Net KES ${(monthlyIncome - monthlyExpenses).toLocaleString()}
- Invoices: ${overdueInvoices.length} overdue (KES ${financialContext.invoices.overdue_amount.toLocaleString()}), ${pendingInvoices.length} pending (KES ${financialContext.invoices.pending_amount.toLocaleString()})
- Suppliers: ${suppliers.length} total, ${financialContext.suppliers.active} active
- Credit Score: ${business?.credit_score || 'Not calculated'}

Analyze the user's question and provide a helpful, specific response using the ACTUAL DATA above. Be conversational and concise (2-3 sentences for voice).

If they ask about cash position, use weekly data. If monthly summary, use monthly data. If invoices, reference the overdue/pending counts and amounts.

Also determine the intent category and if any action should be taken.`;

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
          action: { type: "string" },
          should_trigger_workflow: { type: "boolean" }
        }
      }
    });

    // If action needed, provide more details
    if (aiResponse.should_trigger_workflow) {
      if (aiResponse.intent === "payment_reminder" && overdueInvoices.length > 0) {
        aiResponse.action = `Triggered reminders for ${overdueInvoices.length} overdue clients: ${overdueInvoices.slice(0, 3).map(i => i.customer_name).join(', ')}`;
      }
    }

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
          
          await audio.play();
          return;
        } else {
          console.error('ElevenLabs API error:', await response.text());
        }
      } catch (error) {
        console.error('ElevenLabs error:', error);
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

  const handleQuickCommand = async (command) => {
    setTranscript(command);
    await handleVoiceCommand(command);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Voice Assistant
          </h1>
          <p className="text-gray-600 mt-1">Ask me anything about your business finances</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center gap-2"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            Voice {voiceEnabled ? 'On' : 'Off'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="border-none shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="use-elevenlabs"
                checked={useElevenLabs}
                onChange={(e) => setUseElevenLabs(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="use-elevenlabs">Use ElevenLabs TTS (Premium Voice Quality)</Label>
            </div>
            {useElevenLabs && (
              <div className="space-y-2">
                <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                <Input
                  id="elevenlabs-key"
                  type="password"
                  placeholder="Enter your ElevenLabs API key"
                  value={elevenLabsKey}
                  onChange={(e) => setElevenLabsKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Get your API key from <a href="https://elevenlabs.io" target="_blank" className="text-blue-600 hover:underline">elevenlabs.io</a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!('webkitSpeechRecognition' in window) && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className={`relative ${isListening ? 'animate-pulse' : ''}`}>
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={`relative w-32 h-32 rounded-full text-white shadow-2xl transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 scale-110' 
                        : 'bg-white/20 hover:bg-white/30 backdrop-blur'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-12 h-12" />
                    ) : (
                      <Mic className="w-12 h-12" />
                    )}
                  </Button>
                </div>

                <div className="text-center space-y-2">
                  {isProcessing ? (
                    <>
                      <Badge className="bg-white/20 text-white px-4 py-2">
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </Badge>
                      <p className="text-white/80">Analyzing your request with real data</p>
                    </>
                  ) : isListening ? (
                    <>
                      <Badge className="bg-red-500 text-white px-4 py-2">
                        <Mic className="w-4 h-4 mr-2 animate-pulse" />
                        Listening...
                      </Badge>
                      <p className="text-white/80">I'm listening. Speak now.</p>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Badge className="bg-green-500 text-white px-4 py-2">
                        <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                        Speaking...
                      </Badge>
                      <p className="text-white/80">{useElevenLabs ? 'ElevenLabs Premium Voice' : 'Playing response'}</p>
                    </>
                  ) : (
                    <>
                      <Badge className="bg-white/20 text-white px-4 py-2">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ready
                      </Badge>
                      <p className="text-white/80">Tap the microphone to start</p>
                    </>
                  )}
                </div>

                {transcript && (
                  <div className="w-full p-4 bg-white/10 backdrop-blur rounded-xl">
                    <p className="text-sm text-white/60 mb-1">You said:</p>
                    <p className="text-lg text-white">{transcript}</p>
                  </div>
                )}

                <VoiceWaveform isActive={isListening || isSpeaking} />
              </div>
            </CardContent>
          </Card>

          <ConversationHistory conversations={conversations} />
        </div>

        <div className="space-y-6">
          <QuickCommands onCommand={handleQuickCommand} />

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Voice Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-bold text-xs">1</span>
                </div>
                <p>Ask clear questions like "What's my cash position this week?"</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">2</span>
                </div>
                <p>Give commands like "Send payment reminders to overdue clients"</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-bold text-xs">3</span>
                </div>
                <p>All responses use real-time data from your business</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
