export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round((current - previous) * 10) / 10;
}

export function calculateAttendancePercentage(
  meetings: { participants: unknown }[],
  totalStudents: number
): number {
  if (meetings.length === 0) return 0;
  
  const totalAttendances = meetings.reduce((sum, meeting) => {
    const participants = meeting.participants as { user_id?: string; email?: string }[];
    return sum + (participants ? participants.length : 0);
  }, 0);
  
  return (totalAttendances / (meetings.length * totalStudents)) * 100;
}