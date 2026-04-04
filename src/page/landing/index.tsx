'use client';

import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Loader2, ChevronDown, Rocket, Code2, ArrowRight, HelpCircle, Copy, Upload, Download, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Import hooks and API
import { useAuth, useGoogleAuth } from '@/hooks';
import { analyzePerformance, analyzeWithLLM } from '@/api';
import { ComplexityAnalysis, AuthResponse } from '@/types';
import { defaultCodeTemplate, landingTutorialSteps } from '@/data';

// Lazy load CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import('@/components/editor/CodeEditor'), {
  ssr: false,
  loading: () => <div className="bg-muted/20 h-full w-full animate-pulse" />,
});

import BigOSummaryCards from '@/components/playground/shared/PerformancePanel/BigOSummaryCards';
import BigOExplanation from '@/components/playground/shared/PerformancePanel/BigOExplanation';
import BigOChart from '@/components/playground/shared/PerformancePanel/BigOChart';
import PerFunctionComplexity from '@/components/playground/shared/PerformancePanel/PerFunctionComplexity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TutorialOverlay from '@/components/playground/shared/tutorial/TutorialOverlay';


const LandingPage = () => {
  const { accessToken, isInitialized } = useAuth();
  const isAuthenticated = isInitialized && !!accessToken;
  const { mutate: getGoogleAuth } = useGoogleAuth();

  // State
  const [code, setCode] = useState<string>(defaultCodeTemplate);
  const [complexity, setComplexity] = useState<ComplexityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<ComplexityAnalysis['analysisDetails'] | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);



  // Refs for scrolling
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleReset = () => {
    setCode(defaultCodeTemplate);
    setComplexity(null);
    setAiExplanation(null);
    setError(null);
    setAnalysisError(null);
  };

  const handleRun = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisError(null);
    setComplexity(null);
    setAiExplanation(null);

    try {
      const result = await analyzePerformance(code);
      if (result.timeComplexity === 'Error' || result.spaceComplexity === 'Error') {
        setComplexity(null);
        setAnalysisError(result.analysisDetails || null);
        setError(
          result.analysisDetails?.python_style_message ||
            result.analysisDetails?.thai_message ||
            result.timeExplanation ||
            'เกิดข้อผิดพลาดในการวิเคราะห์โค้ด โปรดตรวจสอบ Syntax หรือลองใหม่อีกครั้ง',
        );
        return;
      }

      setAnalysisError(null);
      setComplexity(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisError(null);
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

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleExportPython = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solution.py';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    <div className="bg-background flex w-full flex-col overflow-y-auto">
      {/* 1. Hero Section (100vh) */}
      <section className="relative flex min-h-[calc(100vh-64px)] w-full flex-col items-center justify-center px-4 pt-16 pb-32 text-center lg:px-8">
        {/* Background Decorative Blur */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] lg:h-[800px] lg:w-[800px]"></div>
          <div className="bg-secondary/10 absolute top-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[80px]"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex max-w-4xl flex-col items-center space-y-8"
        >
          {/* Logo large - Enlarged size */}
          <div className="relative h-48 w-48 drop-shadow-2xl md:h-64 md:w-64 lg:h-[22rem] lg:w-[22rem]">
            <Image src="/logo.svg" alt="DSView Logo" fill className="object-contain" priority />
          </div>

          <div className="space-y-4">
            <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              <span className="text-primary block mb-2">โครงสร้างข้อมูลและอัลกอริทึม</span>
              ให้เป็นเรื่องง่ายสำหรับคุณ
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl mt-4">
              แพลตฟอร์มการเรียนรู้และวิเคราะห์โค้ด
              พร้อมระบบประเมินประสิทธิภาพ โค้ดที่เขียนจะถูกนำไปวิเคราะห์และแสดงผลการภาพทำงาน
            </p>
          </div>

          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 pt-6 w-full">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsTutorialOpen(true)}
              className="group w-full md:w-auto min-w-[280px] md:min-w-0 gap-2 rounded-full px-6 py-6 text-base sm:text-lg bg-background hover:bg-muted shrink-0"
            >
              <HelpCircle className="h-5 w-5 shrink-0" />
              <span>แนะนำการใช้งาน</span>
            </Button>

            <Button
              id="tour-landing-editor"
              size="lg"
              variant="outline"
              onClick={scrollToEditor}
              className="group w-full md:w-auto min-w-[280px] md:min-w-0 gap-2 rounded-full px-6 py-6 text-base sm:text-lg bg-background hover:bg-muted shrink-0"
            >
              <Code2 className="h-5 w-5 shrink-0" />
              <span>ลองเขียนโค้ดเลย (Playground)</span>
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 cursor-pointer p-4 hidden sm:block pointer-events-auto z-10"
          onClick={scrollToEditor}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-muted-foreground hover:text-primary flex flex-col items-center justify-center transition-colors"
          >
            <span className="mb-2 text-sm font-medium tracking-widest uppercase">Editor</span>
            <ChevronDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Editor Section */}
      <section 
        ref={editorRef} 
        className="flex min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] w-full flex-col px-0 pb-0 lg:flex-row"
      >
        <div className="flex h-full w-full flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          
          {/* Left Side: Code Editor */}
          <div className="border-border flex min-h-[60vh] lg:min-h-0 lg:h-full w-full flex-col border-b lg:w-1/2 lg:border-r lg:border-b-0 shrink-0 lg:shrink">
            <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Code2 className="text-primary h-5 w-5" />
                <h2 className="text-base font-semibold">Playground Editor</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary rounded-md px-2 py-1 text-xs font-medium">Python 3</span>
              </div>
            </div>

            <div className="relative flex-1 overflow-hidden bg-[#1e1e1e]">
              <CodeEditor
                code={code}
                onCodeChange={handleCodeChange}
                height="100%"
                disabled={isAnalyzing}
              />
            </div>

            {/* Bottom Action Bar */}
            <div className="border-border bg-background flex flex-col justify-between gap-4 border-t p-4 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleRun}
                  disabled={isAnalyzing || !code.trim()}
                  className="min-w-[140px] gap-2 shadow-md"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      วิเคราะห์โค้ด...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      วิเคราะห์โค้ด (Run)
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
                  เริ่มใหม่ (Reset)
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept=".py"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={isAnalyzing}
                  className="gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  อัปโหลด
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPython}
                  disabled={isAnalyzing || !code.trim()}
                  className="gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyCode}
                  disabled={!code.trim()}
                  className="gap-1.5 w-[110px]"
                >
                  {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {isCopied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side: Analysis Result */}
          <div className="bg-muted/10 flex min-h-[60vh] lg:min-h-0 lg:h-full w-full flex-col lg:w-1/2 shrink-0 lg:shrink">
            <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Rocket className="text-primary h-5 w-5" />
                <h2 className="text-base font-semibold">ผลลัพธ์การวิเคราะห์ (Analysis)</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
              <div className="mx-auto w-full max-w-none space-y-4">
                {error && (
                  <Card className="border-destructive/50 bg-destructive/10 shadow-sm">
                    <CardContent className="flex items-start gap-3 p-4">
                      <div className="bg-destructive/20 text-destructive mt-0.5 rounded-full p-1">
                        <RotateCcw className="h-4 w-4" />
                      </div>
                      <div className="space-y-2 text-sm leading-relaxed">
                        <p className="text-destructive font-semibold">Syntax Error</p>
                        {analysisError?.thai_message ? (
                          <p className="text-destructive">{analysisError.thai_message}</p>
                        ) : null}
                        <pre className="bg-background/70 text-foreground overflow-x-auto rounded-md border border-border p-3 text-xs whitespace-pre-wrap">
                          {analysisError?.python_style_message || error}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!complexity && !isAnalyzing && !error && (
                  <div className="border-muted-foreground/20 bg-muted/10 flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors hover:bg-muted/20">
                    <div className="bg-background rounded-full p-5 shadow-sm border border-border">
                      <Play className="text-primary/60 ml-1 h-8 w-8" />
                    </div>
                    <h3 className="text-foreground mt-4 font-semibold">ยังไม่มีผลการวิเคราะห์</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm text-sm px-4">
                      พิมพ์โค้ดภาษา Python ทางด้านซ้าย แล้วกดปุ่ม &quot;วิเคราะห์โค้ด (Run)&quot; เพื่อเริ่มดู Time Complexity
                    </p>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="flex h-64 flex-col items-center justify-center space-y-4">
                    <Loader2 className="text-primary h-12 w-12 animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">กำลังวิเคราะห์ Big O Complexity...</p>
                  </div>
                )}

                {complexity && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4 pb-8 duration-500">
                    <div className="flex flex-col gap-4">
                      <BigOSummaryCards complexity={complexity} />
                      <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                        <BigOChart timeComplexity={complexity.timeComplexity} />
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-card">
                      <BigOExplanation
                        complexity={complexity}
                        onAIExplain={handleAIExplain}
                        isExplaining={isExplaining}
                        aiExplanation={aiExplanation}
                        isAuthenticated={isAuthenticated}
                        onLogin={handleLogin}
                      />
                    </div>

                    {complexity.functionComplexities &&
                      complexity.functionComplexities.length > 0 && (
                        <div className="pt-2">
                          <h3 className="text-lg font-semibold mb-3">เจาะลึกรายฟังก์ชัน</h3>
                          <PerFunctionComplexity
                            functionComplexities={complexity.functionComplexities}
                          />
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        steps={landingTutorialSteps}
        storageKey="landing_tutorial_completed"
      />
    </div>
  );
};

export default LandingPage;
