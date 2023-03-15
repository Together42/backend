export function getFourthWeekdaysOfMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const lastDate = new Date(year, month, 0);
  const lastDayOfMonth = lastDate.getDay();
  const lastDateOfMonth = lastDate.getDate();
  const fourthWeekStartDay = lastDateOfMonth - lastDayOfMonth - 6;
  const fourthWeekDays = [];

  for (let i = 0; i < 7; i++) {
    const day = fourthWeekStartDay + i;
    if (day > 0 && day <= lastDateOfMonth) {
      fourthWeekDays.push(day);
    }
  }

  return (fourthWeekDays);
}