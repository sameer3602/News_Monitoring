import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Story } from '../source.interface'; 
import { SourceService } from '../service/source.service';

@Component({
  selector: 'app-fetch-stories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fetch-stories.component.html',
})
export class FetchStoriesComponent {
  fetchedStories = signal<Story[]>([]);
  showStoryModal = signal(false);
  isLoading = signal(false);

  constructor(private sourceService: SourceService) {}


  fetchStoriesForSource(sourceId: number): void {
    this.isLoading.set(true);

    this.sourceService.fetchStories(sourceId).subscribe({
      next: (response) => {
        const stories = response?.stories ?? [];
        const limitedStories = stories.slice(0, 10);
        this.fetchedStories.set(limitedStories);
        this.isLoading.set(false);
        this.showStoryModal.set(true);
  
      },
      error: (err) => {
        console.error('Error fetching stories:', err);
        alert('No new stories found.');
        this.isLoading.set(false);
      }
    });
  }

  closeStoryModal(): void {
    this.showStoryModal.set(false);
  }
}
