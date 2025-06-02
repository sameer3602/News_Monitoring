import { Component } from '@angular/core';
import { StoryService } from './service/story.service';
import { Story, Company } from './story.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeleteStoryComponent } from './delete-story/delete-story.component';
import { AddUpdateStoryComponent } from './add-update-story/add-update-story.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DeleteStoryComponent,
    AddUpdateStoryComponent,
  ],
})
export class AppComponent {
  stories: Story[] = [];
  filteredStories: Story[] = [];

  show = false;
  isEdit = false;
  story: Story | null = null;

  allCompanies: Company[] = [];

  pageNumber = 1;
  hasNext = false;
  hasPrev = false;
  query = '';
  isLoadingStories = false;

  showDeleteModal = false;
  storyToDeleteId: number | null = null;

  constructor(private storyService: StoryService) {}

  ngOnInit() {
    this.loadStories();
    this.loadCompanies();
  }

  // === STORY LOADING & FILTERING ===

  loadStories() {
    this.isLoadingStories = true;
    this.storyService.getStories(this.pageNumber, this.query).subscribe(
      (res) => {
        this.stories = res.stories;
        this.filteredStories = res.stories;
        this.pageNumber = res.page_number;
        this.hasNext = res.has_next;
        this.hasPrev = res.has_prev;
        this.isLoadingStories = false;
      },
      (error) => {
        console.error('Failed to load stories:', error);
        this.isLoadingStories = false;
      }
    );
  }

  onFilterChange(query: string) {
    this.query = query;
    this.pageNumber = 1;
    this.loadStories();
  }

  // === COMPANIES ===

  loadCompanies() {
    this.storyService.getCompanies().subscribe(
      (res) => (this.allCompanies = res),
      (error) => console.error('Failed to load companies:', error)
    );
  }

  // === MODALS: ADD / EDIT ===

  openModal(story: Story | null = null) {
    this.isEdit = !!story;
    this.story = story
      ? { ...story }
      : {
          id: 0,
          title: '',
          url: '',
          body_text: '',
          published_date: '',
          tagged_companies: [],
          tagged_companies_details: [],
        };
    this.show = true;
  }

  closeModal() {
    this.show = false;
    this.story = null;
    this.isEdit = false;
  }

  fetchStory(id: number): void {
    const story = this.stories.find((s) => s.id === id);
    if (story) {
      this.openModal(story);
    } else {
      alert('Story not found');
    }
  }

  refreshStories() {
    this.loadStories();
  }

  // === DELETE MODAL ===

  openDeleteModal(id: number) {
    this.storyToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.storyToDeleteId = null;
    this.showDeleteModal = false;
  }

  confirmDeleteStory() {
    if (this.storyToDeleteId !== null) {
      this.storyService.deleteStory(this.storyToDeleteId).subscribe(
        () => {
          this.closeDeleteModal();
          this.loadStories();
        },
        (error) => {
          console.error('Delete failed:', error);
          alert('Failed to delete story');
        }
      );
    }
  }

  // === PAGINATION ===

  nextPage() {
    if (this.hasNext) {
      this.pageNumber++;
      this.loadStories();
    }
  }

  prevPage() {
    if (this.hasPrev && this.pageNumber > 1) {
      this.pageNumber--;
      this.loadStories();
    }
  }
}
