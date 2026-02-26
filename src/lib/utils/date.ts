const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString('th-TH', { ...defaultOptions, ...options });
};

const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (dateString: string): string => {
  return formatDate(dateString, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isDeadlinePassed = (deadline: string): boolean => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return now > deadlineDate;
};

export { formatDate, formatDateShort, formatTime, isDeadlinePassed };
