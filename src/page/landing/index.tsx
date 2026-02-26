'use client';

import React, { useState } from 'react';
import { Play, RotateCcw, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import hooks and API
import { useAuth, useGoogleAuth } from '@/hooks';
import { analyzePerformance, analyzeWithLLM } from '@/api';
import { ComplexityAnalysis, AuthResponse } from '@/types';
import { defaultCodeTemplate } from '@/data';

// Lazy load CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => <div className="bg-muted/20 h-full w-full animate-pulse" />,
});

// Import Big O Components
import BigOSummaryCards from '@/components/playground/shared/PerformancePanel/BigOSummaryCards';
import BigOExplanation from '@/components/playground/shared/PerformancePanel/BigOExplanation';
import BigOChart from '@/components/playground/shared/PerformancePanel/BigOChart';
import PerFunctionComplexity from '@/components/playground/shared/PerformancePanel/PerFunctionComplexity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const { accessToken } = useAuth();
  const isAuthenticated = !!accessToken;
  const { mutate: getGoogleAuth } = useGoogleAuth();

  // State
  const [code, setCode] = useState<string>(defaultCodeTemplate);
  const [complexity, setComplexity] = useState<ComplexityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleReset = () => {
    setCode(defaultCodeTemplate);
    setComplexity(null);
    setAiExplanation(null);
    setError(null);
  };

  const handleRun = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setComplexity(null);
    setAiExplanation(null);

    try {
      // Analyze performance (Big O) - Use the fast AST endpoint
      const result = await analyzePerformance(code);
      setComplexity(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('เกิดข้อผิดพลาดในการวิเคราะห์โค้ด โปรดตรวจสอบ Syntax หรือลองใหม่อีกครั้ง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogin = () => {
    getGoogleAuth(undefined, {
      onSuccess: (response: AuthResponse) => {
        if (response?.data?.auth_url) {
          window.location.href = response.data.auth_url;
        }
      },
      onError: (error) => {
        console.error('Login failed:', error);
      },
    });
  };

  const handleAIExplain = async () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    if (!code.trim()) return;

    setIsExplaining(true);
    setAiExplanation(null);

    try {
      const result = await analyzeWithLLM(accessToken, code);
      setAiExplanation(result.explanation);
    } catch (err) {
      console.error('AI Explanation failed:', err);
      setAiExplanation('เกิดข้อผิดพลาดในการขอคำอธิบายจาก AI โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="bg-background flex h-[calc(90vh-64px)] w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Side: Code Editor */}
        <div className="border-border flex h-1/2 w-full flex-col border-b lg:h-full lg:w-1/2 lg:border-r lg:border-b-0">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-2">
            <h2 className="text-sm font-semibold">Code Editor (Python)</h2>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Type your code to analyze</span>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onCodeChange={handleCodeChange}
              height="100%"
              disabled={isAnalyzing}
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="border-border bg-background flex items-center justify-center gap-4 border-t p-4">
            <Button
              onClick={handleRun}
              disabled={isAnalyzing || !code.trim()}
              className="min-w-[120px] gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isAnalyzing}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Code
            </Button>
          </div>
        </div>

        {/* Right Side: Analysis Result */}
        <div className="bg-muted/10 flex h-1/2 w-full flex-col overflow-hidden lg:h-full lg:w-1/2">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto w-full max-w-none space-y-3">
              {error && (
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <p className="text-destructive text-sm font-medium">{error}</p>
                  </CardContent>
                </Card>
              )}

              {!complexity && !isAnalyzing && !error && (
                <div className="border-muted-foreground/25 bg-muted/20 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                  <div className="bg-background rounded-full p-4 shadow-sm">
                    <Play className="text-muted-foreground/50 ml-1 h-8 w-8" />
                  </div>
                  <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                    {
                      'Click the "Run Analysis" button to calculate the Big O complexity of your code.'
                    }
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex h-64 flex-col items-center justify-center space-y-4">
                  <Loader2 className="text-primary h-12 w-12 animate-spin" />
                  <p className="text-muted-foreground">Analyzing code complexity...</p>
                </div>
              )}

              {complexity && (
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-3 pb-8 duration-500">
                  {/* Row 1: Summary & Chart - Always stack */}
                  <div className="flex flex-col gap-3">
                    <BigOSummaryCards complexity={complexity} />
                    <BigOChart timeComplexity={complexity.timeComplexity} />
                  </div>

                  {/* Row 2: Explanation */}
                  <BigOExplanation
                    complexity={complexity}
                    onAIExplain={handleAIExplain}
                    isExplaining={isExplaining}
                    aiExplanation={aiExplanation}
                    isAuthenticated={isAuthenticated}
                    onLogin={handleLogin}
                  />

                  {/* Row 3: Function Details */}
                  {complexity.functionComplexities &&
                    complexity.functionComplexities.length > 0 && (
                      <PerFunctionComplexity
                        functionComplexities={complexity.functionComplexities}
                      />
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
