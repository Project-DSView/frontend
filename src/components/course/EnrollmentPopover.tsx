'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EnrollmentPopoverProps } from '@/types';

const EnrollmentPopover: React.FC<EnrollmentPopoverProps> = ({
  courseId,
  courseName,
  onEnroll,
  isEnrolling = false,
}) => {
  const [open, setOpen] = useState(false);
  const [enrollKey, setEnrollKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enrollKey.trim()) {
      toast.error('กรุณาใส่รหัสลงทะเบียน');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onEnroll) {
        await onEnroll(courseId, enrollKey.trim());
        setEnrollKey('');
        setOpen(false);
        toast.success('ลงทะเบียนสำเร็จ!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="w-full" disabled={isEnrolling || isSubmitting}>
          {isEnrolling || isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังลงทะเบียน...
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              ลงทะเบียน
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">ลงทะเบียนเรียน</h4>
            <p className="text-muted-foreground text-sm">
              ใส่รหัสลงทะเบียนสำหรับคอร์ส <strong>{courseName}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="enrollKey" className="text-sm font-medium">
                รหัสลงทะเบียน
              </label>
              <Input
                id="enrollKey"
                type="text"
                placeholder="ใส่รหัสลงทะเบียนที่นี่"
                value={enrollKey}
                onChange={(e) => setEnrollKey(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSubmitting || !enrollKey.trim()} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังลงทะเบียน...
                  </>
                ) : (
                  'ลงทะเบียน'
                )}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EnrollmentPopover;
