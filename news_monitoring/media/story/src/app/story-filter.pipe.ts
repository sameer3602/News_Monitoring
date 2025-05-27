import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'storyFilter'
})
export class StoryFilterPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
