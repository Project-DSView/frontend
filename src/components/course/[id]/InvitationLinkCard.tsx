'use client';

import React, { useState } from 'react';
import { Copy, Link2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateInvitation, useCourseInvitations } from '@/query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InvitationLinkCardProps {
  courseId: string;
  accessToken: string | null;
  isCreator: boolean;
}

const InvitationLinkCard: React.FC<InvitationLinkCardProps> = ({
  courseId,
  accessToken,
  isCreator,
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Fetch existing invitations
  const {
    data: invitationsData,
    isLoading: isInvitationsLoading,
    refetch: refetchInvitations,
  } = useCourseInvitations(accessToken, courseId);

  // Create invitation mutation
  const createInvitationMutation = useCreateInvitation();

  // Get the most recent invitation (or create one if none exists)
  const latestInvitation = invitationsData?.data?.[0];

  // Generate full invitation URL
  const getInvitationUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/course/invite/${token}`;
    }
    return `/course/invite/${token}`;
  };

  // Handle create invitation
  const handleCreateInvitation = async () => {
    if (!accessToken) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      const result = await createInvitationMutation.mutateAsync({
        token: accessToken,
        courseId,
      });
      refetchInvitations();
      // Auto copy to clipboard
      if (result.data?.token) {
        const url = getInvitationUrl(result.data.token);
        await navigator.clipboard.writeText(url);
        setCopiedToken(result.data.token);
        setTimeout(() => setCopiedToken(null), 2000);
        toast.success('สร้างลิงก์เชิญสำเร็จ และคัดลอกไปยังคลิปบอร์ดแล้ว');
      }
    } catch (error) {
      console.error('Create invitation error:', error);
    }
  };

  // Handle copy to clipboard
  const handleCopyLink = async (token: string) => {
    const url = getInvitationUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
      toast.success('คัดลอกลิงก์เชิญไปยังคลิปบอร์ดแล้ว');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('ไม่สามารถคัดลอกลิงก์ได้');
    }
  };

  // Don't show if user is not creator
  if (!isCreator) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" />
          ลิงก์เชิญถาวร
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isInvitationsLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : latestInvitation ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-600">ลิงก์เชิญ:</p>
              <p className="text-sm break-all text-gray-900">
                {getInvitationUrl(latestInvitation.token)}
              </p>
            </div>
            <Button
              onClick={() => handleCopyLink(latestInvitation.token)}
              variant="outline"
              className="w-full"
              disabled={copiedToken === latestInvitation.token}
            >
              {copiedToken === latestInvitation.token ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  คัดลอกแล้ว
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  คัดลอกลิงก์
                </>
              )}
            </Button>
            <Button
              onClick={handleCreateInvitation}
              variant="secondary"
              className="w-full"
              disabled={createInvitationMutation.isPending}
            >
              {createInvitationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                'สร้างลิงก์ใหม่'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">ยังไม่มีลิงก์เชิญสำหรับคอร์สนี้</p>
            <Button
              onClick={handleCreateInvitation}
              className="w-full"
              disabled={createInvitationMutation.isPending}
            >
              {createInvitationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  สร้างลิงก์เชิญ
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationLinkCard;
