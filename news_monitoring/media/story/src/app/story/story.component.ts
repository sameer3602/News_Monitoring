import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../service/story.service';
import { Story } from '../models/story.model';
import { Company } from '../models/company.model';
import { Source } from '../models/source.model';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './story.component.html'
})
export class StoryComponent implements OnInit {
  stories: Story[] = [];
  filteredStories: Story[] = []; 
  sources: Source[] = [];
  companies: Company[] = [];
  filterText = signal('');  

  // Optional: method to update filterText from input
  searchText: string = '';

  onFilterChange(query: string): void {
  const lowerQuery = query.toLowerCase();

  this.filteredStories = this.stories.filter(story =>
    story.title.toLowerCase().includes(lowerQuery) ||
    story.body_text.toLowerCase().includes(lowerQuery) ||
    story.source?.name.toLowerCase().includes(lowerQuery)
  );
}


  



  // Modal control
  showModal = false;
  showEditModal = false;
  showDeleteModal = false;

  // Story form state
  newStory: Partial<Story> = this.getEmptyStory();
  editStory!: Story;
  deleteStoryId: number | null = null;

  // Pagination
   page = 1;
    totalPages = 1; // This should be set from the API response
    hasPrev = false;
    hasNext = false;

    prevPage(): void {
      if (this.hasPrev) {
        this.page--;
        this.loadStories();;
      }
    }

    nextPage(): void {
      if (this.hasNext) {
        this.page++;
        this.loadStories();
      }
    }

  
  // Company search (Add form)
  companySearch = '';
  filteredCompanies: Company[] = [];

  // Company search (Edit form)
  editCompanySearch = '';
  editFilteredCompanies: Company[] = [];

  constructor(private storyService: StoryService) {}

  ngOnInit(): void {
    this.loadStories();
    this.loadSources();
    this.loadCompanies();
  }

  // ========== Loaders ==========

 loadStories(): void {
  this.storyService.getStories().subscribe({
    next: (data) => {
      this.stories = data;
      this.filteredStories = data; // show full list by default
    },
    error: (err) => {
      console.error('Error loading stories', err);
    }
  });
}
  loadSources(): void {
    this.storyService.getSources().subscribe({
      next: (data) => (this.sources = data),
      error: (err) => console.error('Failed to load sources', err),
    });
  }

  loadCompanies(): void {
    this.storyService.getCompanies().subscribe({
      next: (data) => (this.companies = data),
      error: (err) => console.error('Failed to load companies', err),
    });
  }

  // ========== Modal Handlers ==========

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  openEditModal(story: Story): void {
    this.editStory = {
      ...story,
      tagged_companies: story.tagged_companies.filter(
        (c): c is Company => typeof c === 'object' && c !== null
      ),
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editStory = {} as Story;
  }

  openDeleteModal(id: number): void {
    this.deleteStoryId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.deleteStoryId = null;
    this.showDeleteModal = false;
  }

  // ========== Form Logic ==========

  private getEmptyStory(): Partial<Story> {
    return {
      title: '',
      source: null,
      published_date: '',
      body_text: '',
      url: '',
      tagged_companies: [],
    };
  }

  resetForm(): void {
    this.newStory = this.getEmptyStory();
    this.companySearch = '';
    this.filteredCompanies = [];
  }

  // ========== Add Story ==========

  addStory(): void {
    if (!this.isStoryValid(this.newStory)) {
      alert('Please fill all fields');
      return;
    }

    this.storyService.createStory(this.newStory as Story).subscribe({
      next: (story) => {
        this.stories.push(story);
        this.closeModal();
      },
      error: (err) => console.error('Failed to add story', err),
    });
  }

  // ========== Edit Story ==========

  fetchStory(id: number): void {
    const story = this.stories.find((s) => s.id === id);
    if (story) {
      this.openEditModal(story);
    } else {
      alert('Story not found');
    }
  }

  updateStory(): void {
    if (!this.isStoryValid(this.editStory)) {
      alert('Please fill all fields');
      return;
    }

    this.storyService.updateStory(this.editStory).subscribe({
      next: (updatedStory) => {
        const index = this.stories.findIndex((s) => s.id === updatedStory.id);
        if (index !== -1) this.stories[index] = updatedStory;
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update story', err);
        alert('Failed to update story');
      },
    });
  }

  private isStoryValid(story: Partial<Story>): boolean {
    return (
      !!story.title &&
      !!story.published_date &&
      !!story.body_text &&
      !!story.url &&
      (story.tagged_companies?.length ?? 0) > 0
    );
  }

  // ========== Delete Story ==========

  confirmDelete(): void {
    if (this.deleteStoryId !== null) {
      this.storyService.deleteStory(this.deleteStoryId).subscribe({
        next: () => {
          this.stories = this.stories.filter((s) => s.id !== this.deleteStoryId);
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Failed to delete story', err);
          alert('Failed to delete story');
        },
      });
    }
  }

  // ========== Company Select (New Story) ==========

  filterCompanies(): void {
    const search = this.companySearch.toLowerCase();
    this.filteredCompanies = this.companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search) &&
        !this.newStory.tagged_companies?.some((sel) => sel.id === c.id)
    );
  }

  addCompanyToNewStory(company: Company): void {
    this.newStory.tagged_companies = [...(this.newStory.tagged_companies || []), company];
    this.companySearch = '';
    this.filteredCompanies = [];
  }

  removeCompanyFromNewStory(index: number): void {
    this.newStory.tagged_companies?.splice(index, 1);
  }

  // ========== Company Select (Edit Story) ==========

  filterEditCompanies(): void {
    const search = this.editCompanySearch.toLowerCase();
    this.editFilteredCompanies = this.companies.filter(
      (c) =>
        c.name.toLowerCase().includes(search) &&
        !this.editStory.tagged_companies.some((sel) => sel.id === c.id)
    );
  }

  addCompanyToEditStory(company: Company): void {
    this.editStory.tagged_companies.push(company);
    this.editCompanySearch = '';
    this.editFilteredCompanies = [];
  }

  removeCompanyFromEditStory(index: number): void {
    this.editStory.tagged_companies.splice(index, 1);
  }
}
