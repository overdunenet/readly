import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY.MM.DD');
}

export function formatRelativeTime(date: string | Date): string {
  return dayjs(date).fromNow();
}
