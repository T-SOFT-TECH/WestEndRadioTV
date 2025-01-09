// pipes/format-time-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTimeAgo',
  standalone: true
})
export class FormatTimeAgoPipe implements PipeTransform {
  transform(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);

    if (seconds < 60) {
      return 'just now';
    }

    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    }

    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }

    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }
}
