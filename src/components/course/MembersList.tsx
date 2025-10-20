'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, Users, AlertCircle, Search, Filter } from 'lucide-react';

import { MembersListProps } from '@/types';
import { getRoleBadgeStyle, getRoleDisplayName } from '@/lib';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MembersList: React.FC<MembersListProps> = ({ enrollmentsData, isLoading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'ta' | 'teacher'>('all');

  const enrollments = useMemo(() => {
    return enrollmentsData?.data?.enrollments || [];
  }, [enrollmentsData?.data?.enrollments]);

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
        <span>สมาชิกทั้งหมด {enrollments.length} คน</span>
        {filteredEnrollments.length !== enrollments.length && (
          <span className="text-gray-500">(แสดง {filteredEnrollments.length} คน)</span>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อหรืออีเมล..."
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
            ทั้งหมด
          </Button>
          <Button
            variant={roleFilter === 'student' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('student')}
          >
            นักศึกษา
          </Button>
          <Button
            variant={roleFilter === 'ta' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('ta')}
          >
            ผู้ช่วยสอน
          </Button>
          <Button
            variant={roleFilter === 'teacher' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRoleFilter('teacher')}
          >
            อาจารย์
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
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.enrollment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.firstname} {enrollment.lastname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeStyle(
                          enrollment.role,
                        )}`}
                      >
                        {getRoleDisplayName(enrollment.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
