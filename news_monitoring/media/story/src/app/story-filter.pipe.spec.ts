import { Pipe, PipeTransform } from '@angular/core';
import { Story } from './models/story.model';

@Pipe({
  name: 'storyFilter',
  standalone: true,
})
export class StoryFilterPipe implements PipeTransform {
  transform(stories: Story[], filterText: string): Story[] {
    if (!filterText) return stories;
    const lower = filterText.toLowerCase();
    return stories.filter(story =>
      story.title.toLowerCase().includes(lower)
    );
  }
}
