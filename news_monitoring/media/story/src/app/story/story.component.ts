// import { Component, signal, computed, ViewChild, ElementRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { StoryService } from '../service/story.service';
// import { Story } from '../models/story.model';
// import { Source } from '../models/source.model';
// import { Company } from '../models/company.model';
// import TomSelect from 'tom-select';
// import { effect } from '@angular/core';
// @Component({
//   selector: 'app-story',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './story.component.html',
// })
// export class StoryComponent {
//   stories = signal<Story[]>([]);
//   sourcesList = signal<Source[]>([]);
//   companiesList = signal<Company[]>([]);
//   searchTerm = signal('');
//   showModal = signal(false);
//   showDeleteModal = signal(false);
//   editingStory = signal<Story | null>(null);
//   deletingId = signal<number | null>(null);
  
//   // for mulitselect dropdown for tagged companies

//   @ViewChild('taggedCompaniesSelect') taggedCompaniesSelectRef!: ElementRef;
//   private taggedCompaniesSelectInstance: TomSelect | null = null;

//   initTaggedCompaniesSelect(selectedIds: number[] = []) {
//   const el = this.taggedCompaniesSelectRef?.nativeElement;
//   if (!el) return;

//   if (this.taggedCompaniesSelectInstance) {
//     this.taggedCompaniesSelectInstance.destroy();
//   }

//   this.taggedCompaniesSelectInstance = new TomSelect(el, {
//     plugins: ['remove_button'],
//     maxItems: null,
//   });

//   if (selectedIds.length > 0) {
//     this.taggedCompaniesSelectInstance.setValue(selectedIds.map(String));
//   }
// }


//   // FOR PAGINATION

//   itemsPerPage = 10;
//   currentPage = signal(1);

//   constructor(private storyService: StoryService) {
//     this.fetchSources();
//     this.fetchCompanies();
//     this.fetchStories();
//   }
//   isSourceObject(source: number | Source | null): source is Source {
//     return !!source && typeof source === 'object' && 'name' in source;
//   }

//   getTaggedCompanyNames(story: Story): string {
//     if (!story.tagged_companies || !Array.isArray(story.tagged_companies)) return 'N/A';
//     const names = (story.tagged_companies as Company[])
//       .filter(c => !!c && typeof c === 'object' && 'name' in c)
//       .map(c => c.name);
//     return names.length > 0 ? names.join(', ') : 'N/A';
//   }

//   fetchStories() {
//     this.storyService.getStories().subscribe((data) => {
//       const normalized = data.map(story => {
//         let fullSource: Source | null = null;
//         if (typeof story.source === 'number') {
//           fullSource = this.sourcesList().find(s => s.id === story.source) ?? null;
//         } else if (story.source && typeof story.source === 'object') {
//           fullSource = story.source as Source;
//         }

//         let fullTaggedCompanies: Company[] = [];
//         if (Array.isArray(story.tagged_companies)) {
//           fullTaggedCompanies = story.tagged_companies.map(tc => {
//             if (typeof tc === 'number') {
//               return this.companiesList().find(c => c.id === tc) ?? null;
//             } else if (tc && typeof tc === 'object') {
//               return tc as Company;
//             }
//             return null;
//           }).filter((c): c is Company => c !== null);
//         }

//         return {
//           ...story,
//           source: fullSource,
//           tagged_companies: fullTaggedCompanies,
//         };
//       });
//       this.stories.set(normalized);
//     });
//   }

//   fetchSources() {
//     this.storyService.getSources().subscribe((data) => this.sourcesList.set(data));
//   }

//   fetchCompanies() {
//     this.storyService.getCompanies().subscribe((data) => this.companiesList.set(data));
//   }

//   filteredStories = computed(() => {
//     const term = this.searchTerm().toLowerCase();
//     const filtered = this.stories().filter((s) =>
//       s.title.toLowerCase().includes(term)
//     );

//     const start = (this.currentPage() - 1) * this.itemsPerPage;
//     const end = start + this.itemsPerPage;
//     return filtered.slice(start, end);
//   });

//   totalPages = computed(() => {
//     const filtered = this.stories().filter((s) =>
//       s.title.toLowerCase().includes(this.searchTerm().toLowerCase())
//     );
//     return Math.ceil(filtered.length / this.itemsPerPage) || 1;
//   });

//   goToPage(page: number) {
//     if (page >= 1 && page <= this.totalPages()) {
//       this.currentPage.set(page);
//     }
//   }

//   nextPage() {
//     if (this.currentPage() < this.totalPages()) {
//       this.currentPage.set(this.currentPage() + 1);
//     }
//   }

//   prevPage() {
//     if (this.currentPage() > 1) {
//       this.currentPage.set(this.currentPage() - 1);
//     }
//   }

//   openAddModal() {
//     this.editingStory.set({
//       id: 0,
//       title: '',
//       url: '',
//       published_date: '',
//       body_text: '',
//       source: 0,
//       tagged_companies: [],
//     });
//     this.showModal.set(true);
//   }
  


//   openEditModal(story: Story) {
//     let taggedCompanies: Company[] = [];

//     if (Array.isArray(story.tagged_companies)) {
//       taggedCompanies = story.tagged_companies.map((item) => {
//         if (typeof item === 'number') {
//           return this.companiesList().find((c) => c.id === item) ?? null;
//         } else if (item && typeof item === 'object' && 'id' in item) {
//           return item as Company;
//         }
//         return null;
//       }).filter((c): c is Company => !!c);
//     }else if (
//       typeof story.tagged_companies === 'string' &&
//       (story.tagged_companies as string).trim()
//     ) {
//       const companyNames = (story.tagged_companies as string).split(',');
//       taggedCompanies = companyNames
//         .map((name: string) =>
//           this.companiesList().find((c: Company) => c.name.toLowerCase() === name.trim().toLowerCase()) ?? null
//         )
//         .filter((c): c is Company => !!c);
//     }


//     this.editingStory.set({
//       ...story,
//       tagged_companies: taggedCompanies,
//     });
//     this.showModal.set(true);
//   }

//   saveStory() {
//     const story = this.editingStory();
//     if (!story) return;

//     const payload = {
//       ...story,
//       source: (typeof story.source === 'object' && story.source !== null) ? (story.source as Source).id : story.source,
//       tagged_companies: (story.tagged_companies as Company[]).map((c) => c.id),
//     };

//     const req = story.id && story.id !== 0
//       ? this.storyService.updateStory(payload)
//       : this.storyService.createStory(payload);

//     req.subscribe(() => {
//       this.fetchStories();
//       this.showModal.set(false);
//     });
//   }

//   confirmDeleteStory(id: number) {
//     this.deletingId.set(id);
//     this.showDeleteModal.set(true);
//   }

//   deleteStory() {
//     const id = this.deletingId();
//     if (id !== null) {
//       this.storyService.deleteStory(id).subscribe(() => {
//         this.fetchStories();
//         this.showDeleteModal.set(false);
//       });
//     }
//   }

//   newStory() {
//     return this.editingStory();
//   }

//   isEditing() {
//     const id = this.editingStory()?.id;
//     return id !== null && id !== 0 && id !== undefined;
//   }

//   sources() {
//     return this.sourcesList();
//   }

//   companies() {
//     return this.companiesList();
//   }

//   taggedCompaniesString(): string {
//     const story = this.editingStory();
//     if (!story || !story.tagged_companies) return '';
//     if (Array.isArray(story.tagged_companies)) {
//       return (story.tagged_companies as Company[]).map(c => c.name).join(', ');
//     }
//     return '';
//   }

//   setTaggedCompaniesFromString(value: string) {
//     const companiesFound = value
//       .split(',')
//       .map(v => v.trim())
//       .filter(v => v !== '')
//       .map(name =>
//         this.companiesList().find(c => c.name.toLowerCase() === name.toLowerCase())
//       )
//       .filter((c): c is Company => !!c);

//     const story = this.editingStory();
//     if (story) {
//       this.editingStory.set({
//         ...story,
//         tagged_companies: companiesFound,
//       });
//     }
//   }
// }


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { StoryService } from '../service/story.service';
// import { Story } from '../models/story.model';
// import { Company } from '../models/company.model';
// import { Source } from '../models/source.model';

// @Component({
//   selector: 'app-story',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './story.component.html'
// })
// export class StoryComponent implements OnInit {
//   stories: Story[] = [];
//   sources: Source[] = [];
//   companies: Company[] = [];

//   showModal = false;
//   showEditModal = false;
//   showDeleteModal = false;
//   deleteStoryId: number | null = null;

//   newStory: Partial<Story> = {
//     title: '',
//     source: null,
//     published_date: '',
//     body_text: '',
//     url: '',
//     tagged_companies: [],
//   };


//   editStory!: Story;

//   page = 1;
//   hasPrev = false;
//   hasNext = false;

//   constructor(private storyService: StoryService) {}

//   ngOnInit(): void {
//     this.loadStories();
//     this.loadSources();
//     this.loadCompanies();
//   }

//   loadStories(): void {
//     this.storyService.getStories().subscribe({
//       next: (data) => {
//         this.stories = data;
//         // Add pagination logic here if backend supports it
//       },
//       error: (err) => console.error('Failed to load stories', err),
//     });
//   }

//   loadSources(): void {
//     this.storyService.getSources().subscribe({
//       next: (data) => (this.sources = data),
//       error: (err) => console.error('Failed to load sources', err),
//     });
//   }

//   loadCompanies(): void {
//     this.storyService.getCompanies().subscribe({
//       next: (data) => (this.companies = data),
//       error: (err) => console.error('Failed to load companies', err),
//     });
//   }

//   openModal(): void {
//     this.showModal = true;
//   }

//   closeModal(): void {
//     this.showModal = false;
//     this.resetForm();
//   }

//   resetForm(): void {
//     this.newStory = {
//       title: '',
//       source: null,
//       published_date: '',
//       body_text: '',
//       url: '',
//       tagged_companies: [],
//     };
//   }

//   addStory(): void {
//     if (
//       !this.newStory.title ||
//       !this.newStory.source ||
//       !this.newStory.published_date ||
//       !this.newStory.body_text ||
//       !this.newStory.url ||
//       (this.newStory.tagged_companies?.length ?? 0) === 0
//     ) {
//       alert('Please fill all fields');
//       return;
//     }

//     this.storyService.createStory(this.newStory as Story).subscribe({
//       next: (story) => {
//         this.stories.push(story);
//         this.closeModal();
//       },
//       error: (err) => console.error('Failed to add story', err),
//     });
//   }

//   fetchStory(id: number): void {
//     // If you want to fetch one story from backend before edit, implement getStory(id) in StoryService
//     const story = this.stories.find((s) => s.id === id);
//     if (story) {
//       this.openEditModal(story);
//     } else {
//       alert('Story not found');
//     }
//   }

//   openEditModal(story: Story): void {
//     // Defensive copy
//    this.editStory = {
//       ...story,
//       tagged_companies: story.tagged_companies.filter(
//         (c): c is Company => typeof c === 'object' && c !== null
//       ),
//     };


//     this.showEditModal = true;
//   }

//   closeEditModal(): void {
//     this.showEditModal = false;
//     this.editStory = {} as Story;
//   }

//   updateStory(): void {
//     if (
//       !this.editStory.title ||
//       !this.editStory.source ||
//       !this.editStory.published_date ||
//       !this.editStory.body_text ||
//       !this.editStory.url ||
//       (this.editStory.tagged_companies.length === 0)
//     ) {
//       alert('Please fill all fields');
//       return;
//     }

//     this.storyService.updateStory(this.editStory).subscribe({
//       next: (updatedStory) => {
//         const index = this.stories.findIndex((s) => s.id === updatedStory.id);
//         if (index !== -1) {
//           this.stories[index] = updatedStory;
//         }
//         this.closeEditModal();
//       },
//       error: (err) => {
//         console.error('Failed to update story', err);
//         alert('Failed to update story');
//       },
//     });
//   }

//   openDeleteModal(id: number): void {
//     this.deleteStoryId = id;
//     this.showDeleteModal = true;
//   }

//   closeDeleteModal(): void {
//     this.showDeleteModal = false;
//     this.deleteStoryId = null;
//   }

//   confirmDelete(): void {
//     if (this.deleteStoryId !== null) {
//       this.storyService.deleteStory(this.deleteStoryId).subscribe({
//         next: () => {
//           this.stories = this.stories.filter((s) => s.id !== this.deleteStoryId);
//           this.closeDeleteModal();
//         },
//         error: (err) => {
//           console.error('Failed to delete story', err);
//           alert('Failed to delete story');
//         },
//       });
//     }
//   }

//   // Similar pagination handlers if needed
//   prevPage(): void {
//     if (this.hasPrev) {
//       this.page--;
//       this.loadStories();
//     }
//   }

//   nextPage(): void {
//     if (this.hasNext) {
//       this.page++;
//       this.loadStories();
//     }
//   }

//   // Company filtering for new story form
//   companySearch = '';
//   filteredCompanies: Company[] = [];

//   filterCompanies() {
//     const search = this.companySearch.toLowerCase();
//     this.filteredCompanies = this.companies.filter(
//       (c) =>
//         c.name.toLowerCase().includes(search) &&
//         !this.newStory.tagged_companies?.some((sel) => sel.id === c.id)
//     );
//   }

//   addCompanyToNewStory(company: Company) {
//     if (!this.newStory.tagged_companies) this.newStory.tagged_companies = [];
//     this.newStory.tagged_companies.push(company);
//     this.companySearch = '';
//     this.filteredCompanies = [];
//   }

//   removeCompanyFromNewStory(index: number) {
//     this.newStory.tagged_companies?.splice(index, 1);
//   }

//   // Company filtering for edit story form
//   editCompanySearch = '';
//   editFilteredCompanies: Company[] = [];

//   filterEditCompanies() {
//     const search = this.editCompanySearch.toLowerCase();
//     this.editFilteredCompanies = this.companies.filter(
//       (c) =>
//         c.name.toLowerCase().includes(search) &&
//         !this.editStory.tagged_companies.some((sel) => sel.id === c.id)
//     );
//   }

//   addCompanyToEditStory(company: Company) {
//     this.editStory.tagged_companies.push(company);
//     this.editCompanySearch = '';
//     this.editFilteredCompanies = [];
//   }

//   removeCompanyFromEditStory(index: number) {
//     this.editStory.tagged_companies.splice(index, 1);
//   }
// }


import { Component, OnInit } from '@angular/core';
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
  sources: Source[] = [];
  companies: Company[] = [];

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
        // Optional: Set pagination flags here
      },
      error: (err) => console.error('Failed to load stories', err),
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
