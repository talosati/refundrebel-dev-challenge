import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDelay',
  standalone: true
})
export class FormatDelayPipe implements PipeTransform {
  transform(delayInMinutes: number | null | undefined): string {
    if (delayInMinutes === null || delayInMinutes === undefined) return '--';
    if (delayInMinutes === 0) return 'On time';
    return `+ ${delayInMinutes} min${delayInMinutes !== 1 ? 's' : ''}`;
  }
}

export function getDelayClass(delay: number | null | undefined): string {
  if (delay === null || delay === undefined) return '';
  return delay === 0 ? 'on-time' : 'delayed';
}
