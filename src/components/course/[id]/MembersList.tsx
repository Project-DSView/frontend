'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, Users, AlertCircle, Search, Filter } from 'lucide-react';

import { MembersListProps } from '@/types';
import { getRoleBadgeStyle, getRoleDisplayName } from '@/lib';
import { useUpdateEnrollmentRole } from '@/query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const MembersList: React.FC<MembersListProps> = ({
  enrollmentsData,
  isLoading,
  error,
  isTeacher = false,
  courseId,
  accessToken,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'ta' | 'teacher'>('all');
  const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null);

  const updateRoleMutation = useUpdateEnrollmentRole();

  const enrollments = useMemo(() => {
    return enrollmentsData?.data?.enrollments || [];
  }, [enrollmentsData?.data?.enrollments]);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: 'student' | 'ta') => {
    if (!accessToken || !courseId) return;

    setUpdatingRoleFor(userId);
    try {
      await updateRoleMutation.mutateAsync({
        token: accessToken,
        courseId,
        userId,
        role: newRole,
      });
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setUpdatingRoleFor(null);
    }
  };

  // Filter enrollments based on search term and role
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesSearch =
        enrollment.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || enrollment.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [enrollments, searchTerm, roleFilter]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>กำลังโหลดรายชื่อสมาชิก...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-sm text-red-600">เกิดข้อผิดพลาดในการโหลดรายชื่อสมาชิก</p>
        </div>
      </div>
    );
  }

  // Show no data state
  if (enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Users className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">ยังไม่มีสมาชิกในคอร์สนี้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Users className="h-4 w-4" />
        <span>ทั้งหมด {enrollments.length} คน</span>
        {filteredEnrollments.length !== enrollments.length && (
          <span className="text-gray-500">(แสดง {filteredEnrollments.length} คน)</span>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by email or name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={roleFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('all')}
          >
            All
          </Button>
          <Button
            variant={roleFilter === 'student' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('student')}
          >
            Student
          </Button>
          <Button
            variant={roleFilter === 'ta' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('ta')}
          >
            TA
          </Button>
          <Button
            variant={roleFilter === 'teacher' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('teacher')}
          >
            Teacher
          </Button>
        </div>
      </div>

      {/* Results */}
      {filteredEnrollments.length === 0 ? (
        <div className="py-8 text-center">
          <Filter className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.enrollment_id}>
                  <TableCell>{enrollment.email}</TableCell>
                  <TableCell>
                    {enrollment.firstname} {enrollment.lastname}
                  </TableCell>
                  <TableCell>
                    {isTeacher && courseId && accessToken && enrollment.role !== 'teacher' ? (
                      <Select
                        value={enrollment.role}
                        onValueChange={(value: 'student' | 'ta') => {
                          handleRoleChange(enrollment.user_id, value);
                        }}
                        disabled={updatingRoleFor === enrollment.user_id}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>
                            {updatingRoleFor === enrollment.user_id ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>กำลังอัปเดต...</span>
                              </div>
                            ) : (
                              getRoleDisplayName(enrollment.role)
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="ta">TA</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeStyle(
                          enrollment.role,
                        )}`}
                      >
                        {getRoleDisplayName(enrollment.role)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MembersList;
