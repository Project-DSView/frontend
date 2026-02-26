'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useEnrollViaInvitation } from '@/query';
import { useAuth } from '@/hooks';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuth();
  const enrollMutation = useEnrollViaInvitation();

  const token = params.token as string;

  useEffect(() => {
    if (!token || !accessToken) {
      return;
    }

    const enroll = async () => {
      try {
        const result = await enrollMutation.mutateAsync({
          token: accessToken,
          invitationToken: token,
        });

        // Redirect to course detail page
        if (result?.data?.course_id) {
          router.push(`/course/${result.data.course_id}`);
        } else {
          router.push('/course');
        }
      } catch (error) {
        console.error('Failed to enroll via invitation:', error);
        // Redirect to course list on error
        setTimeout(() => {
          router.push('/course');
        }, 2000);
      }
    };

    enroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-4">กำลังลงทะเบียนเรียน...</p>
      </div>
    </div>
  );
}
