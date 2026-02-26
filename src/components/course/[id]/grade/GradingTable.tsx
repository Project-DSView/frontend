'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Download, FileCheck } from 'lucide-react';

import { CoursePDFSubmission, GradingTableProps } from '@/types';
import { CourseService } from '@/services';
import { useCourseMaterials } from '@/query';
import { getErrorMessage } from '@/lib';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import GradingDialog from './GradingDialog';

const GradingTable: React.FC<GradingTableProps> = ({
  submissions,
  isLoading,
  courseId,
  accessToken,
}) => {
  const [submitterFilter, setSubmitterFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<CoursePDFSubmission | null>(null);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch materials to get total_points
  const { data: materialsData } = useCourseMaterials(accessToken, courseId, {
    limit: 100,
    offset: 0,
  });

  // Create a map of material_id to material for quick lookup
  const materialMap = useMemo(() => {
    const map = new Map<string, { total_points?: number }>();
    if (materialsData?.data?.materials) {
      materialsData.data.materials.forEach((material) => {
        map.set(material.material_id, { total_points: material.total_points });
      });
    }
    return map;
  }, [materialsData]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      const matchesSubmitter =
        submitterFilter === '' ||
        submission.submitter_name.toLowerCase().includes(submitterFilter.toLowerCase());
      const matchesExercise =
        exerciseFilter === '' ||
        submission.exercise_title.toLowerCase().includes(exerciseFilter.toLowerCase());
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

      return matchesSubmitter && matchesExercise && matchesStatus;
    });
  }, [submissions, submitterFilter, exerciseFilter, statusFilter]);

  const handleDownload = async (submissionId: string, fileName: string) => {
    if (!accessToken) return;

    setDownloadingId(submissionId);
    try {
      const blob = await CourseService.downloadPDFSubmission(accessToken, submissionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'submission.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const errorMessage = getErrorMessage(error) || 'Failed to download submission';
      toast.error(errorMessage);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGrade = (submission: CoursePDFSubmission) => {
    setSelectedSubmission(submission);
    setIsGradingDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsGradingDialogOpen(false);
    setSelectedSubmission(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">กรองตามชื่อผู้ส่ง</label>
          <Input
            placeholder="ค้นหาชื่อผู้ส่ง..."
            value={submitterFilter}
            onChange={(e) => setSubmitterFilter(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            กรองตามชื่อแบบฝึกหัด
          </label>
          <Input
            placeholder="ค้นหาชื่อแบบฝึกหัด..."
            value={exerciseFilter}
            onChange={(e) => setExerciseFilter(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">กรองตามสถานะ</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รอตรวจ</SelectItem>
              <SelectItem value="completed">ตรวจแล้ว</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filteredSubmissions.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {submissions.length === 0 ? 'ไม่มีงานที่ส่ง' : 'ไม่พบงานที่ตรงกับเงื่อนไข'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อแบบฝึกหัด</TableHead>
                <TableHead>คนส่ง</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>วันที่ส่ง</TableHead>
                <TableHead className="text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.submission_id}>
                  <TableCell className="font-medium">{submission.exercise_title}</TableCell>
                  <TableCell>{submission.submitter_name}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        submission.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {submission.status === 'completed'
                        ? 'ตรวจแล้ว'
                        : submission.status === 'pending'
                          ? 'รอตรวจ'
                          : 'ผิดพลาด'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(submission.submitted_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(submission.submission_id, submission.file_name)
                        }
                        disabled={downloadingId === submission.submission_id}
                      >
                        {downloadingId === submission.submission_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="ml-2">ดาวน์โหลด</span>
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleGrade(submission)}>
                        <FileCheck className="h-4 w-4" />
                        <span className="ml-2">
                          {submission.status === 'completed' ? 'แก้ไขคะแนน' : 'ให้คะแนน'}
                        </span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grading Dialog */}
      {selectedSubmission && (
        <GradingDialog
          submission={selectedSubmission}
          isOpen={isGradingDialogOpen}
          onClose={handleCloseDialog}
          courseId={courseId}
          accessToken={accessToken}
          totalPoints={materialMap.get(selectedSubmission.material_id)?.total_points}
        />
      )}
    </>
  );
};

export default GradingTable;
