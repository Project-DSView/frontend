import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ComplexityAnalysis } from '@/types';

interface BigOExplanationProps {
  complexity: ComplexityAnalysis;
  onAIExplain?: () => void;
  isExplaining?: boolean;
  aiExplanation?: string | null;
  isAuthenticated?: boolean;
  onLogin?: () => void;
}

const BigOExplanation: React.FC<BigOExplanationProps> = ({
  complexity,
  onAIExplain,
  isExplaining = false,
  aiExplanation,
  isAuthenticated = false,
  onLogin,
}) => {
  return (
    <Card className="border-border w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">คำอธิบาย</CardTitle>
        {onAIExplain && (
          <Button
            variant="outline"
            size="sm"
            onClick={isAuthenticated ? onAIExplain : onLogin}
            disabled={isExplaining}
            className="bg-background hover:bg-accent h-8 gap-2"
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${isAuthenticated ? 'text-yellow-500' : 'text-muted-foreground'}`}
            />
            <span className="text-xs">
              {isExplaining
                ? 'กำลังวิเคราะห์...'
                : isAuthenticated
                  ? 'AI Explain'
                  : 'Login for AI Explain'}
            </span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {!isAuthenticated && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-900/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-500" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">AI Explain:</span> สงวนสิทธิ์สำหรับสมาชิกเท่านั้น
                  โปรด Login เพื่อใช้งาน
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-blue-700 dark:text-blue-400"
                onClick={onLogin}
              >
                Login
              </Button>
            </div>
          </div>
        )}

        {onAIExplain && !aiExplanation && !isExplaining && isAuthenticated && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/50 dark:bg-yellow-900/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <span className="font-semibold">ข้อควรระวัง:</span> การวิเคราะห์ด้วย AI
                อาจใช้เวลาประมาณ 1-5 นาที โปรดรอสักครู่
              </div>
            </div>
          </div>
        )}
        {aiExplanation ? (
          <div className="bg-muted/50 rounded-md p-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiExplanation}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="text-secondary font-medium">Operation:</p>
              <p className="text-muted-foreground">{complexity.timeExplanation}</p>
            </div>
            <div>
              <p className="text-primary font-medium">Space:</p>
              <p className="text-muted-foreground">{complexity.spaceExplanation}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BigOExplanation;
