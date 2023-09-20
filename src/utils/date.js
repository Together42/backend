/**
 * Date 형식의 today를 받아
 * YYYY-MM-DD 형식의 tomorrow를 반환
 */
export function getTomorrow(today) {
  const tomorrow = new Date(today.setDate(today.getDate() + 1));
  const month = `${tomorrow.getMonth() + 1 < 10 ? "0" : ""}${
    tomorrow.getMonth() + 1
  }`;
  const day = `${tomorrow.getDate() < 10 ? "0" : ""}${tomorrow.getDate()}`;
  const dateFormat = `${tomorrow.getFullYear()}-${month}-${day}`;
  return dateFormat;
}
