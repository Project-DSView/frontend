const getRoleBadgeStyle = (role: 'teacher' | 'ta' | 'student'): string => {
  switch (role) {
    case 'teacher':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'ta':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'student':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Get role display name in Thai
 */
const getRoleDisplayName = (role: 'teacher' | 'ta' | 'student'): string => {
  switch (role) {
    case 'teacher':
      return 'อาจารย์';
    case 'ta':
      return 'ผู้ช่วยสอน';
    case 'student':
      return 'นักศึกษา';
    default:
      return role;
  }
};

/**
 * Check if role is valid
 */
const isValidRole = (role: string): role is 'teacher' | 'ta' | 'student' => {
  return ['teacher', 'ta', 'student'].includes(role);
};

export { getRoleBadgeStyle, getRoleDisplayName, isValidRole };
