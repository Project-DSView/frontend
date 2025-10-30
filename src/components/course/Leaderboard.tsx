'use client';

import React, { useState, useMemo } from 'react';
import { Loader2, Trophy, AlertCircle, Search, Medal } from 'lucide-react';

import { LeaderboardProps } from '@/types';

const Leaderboard: React.FC<LeaderboardProps> = ({
  leaderboardData,
  enrollmentsData,
  isLoading,
  error,
}) => {
  const [searchTerm] = useState('');

  const enrollments = useMemo(() => {
    return enrollmentsData?.data?.enrollments || [];
  }, [enrollmentsData?.data?.enrollments]);

  const leaderboardEntries = useMemo(() => {
    return leaderboardData?.data || [];
  }, [leaderboardData?.data]);

  // Merge leaderboard data with enrollment data to get user details
  const mergedLeaderboard = useMemo(() => {
    return leaderboardEntries
      .map((entry) => {
        const enrollment = enrollments.find((enrollment) => enrollment.user_id === entry.UserID);
        return {
          ...entry,
          firstname: enrollment?.firstname || 'Unknown',
          lastname: enrollment?.lastname || 'User',
          email: enrollment?.email || 'unknown@example.com',
        };
      })
      .sort((a, b) => b.TotalScore - a.TotalScore) // Sort by score descending
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [leaderboardEntries, enrollments]);

  // Filter based on search term
  const filteredLeaderboard = useMemo(() => {
    return mergedLeaderboard.filter((entry) => {
      const matchesSearch =
        entry.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [mergedLeaderboard, searchTerm]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>กำลังโหลดกระดานคะแนน...</span>
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
          <p className="mt-2 text-sm text-red-600">เกิดข้อผิดพลาดในการโหลดกระดานคะแนน</p>
        </div>
      </div>
    );
  }

  // Show no data state
  if (mergedLeaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Trophy className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">ยังไม่มีคะแนนในคอร์สนี้</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-sm font-medium text-gray-600">#{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-200';
  };

  return (
    <div className="space-y-4">
      {/* Results */}
      {filteredLeaderboard.length === 0 ? (
        <div className="py-8 text-center">
          <Search className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">ไม่พบผู้เข้าร่วมที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Total Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredLeaderboard.map((entry) => (
                  <tr key={entry.UserID} className={`hover:bg-gray-50 ${getRankStyle(entry.rank)}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">{getRankIcon(entry.rank)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.firstname} {entry.lastname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {entry.TotalScore.toLocaleString()}
                      </div>
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

export default Leaderboard;
