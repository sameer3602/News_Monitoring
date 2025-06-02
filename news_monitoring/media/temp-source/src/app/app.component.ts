import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SourceService } from './service/source.service';
import { Source, Company } from './source.interface';
import { AddUpdateSourceComponent } from './add-update-source/add-update-source.component';
import { FetchStoriesComponent } from './fetch-stories/fetch-stories.component';
import { DeleteSourceComponent } from './delete-source/delete-source.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AddUpdateSourceComponent, DeleteSourceComponent, FetchStoriesComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Signals
  companies = signal<Company[]>([]);
  sources = signal<Source[]>([]);
  selectedSourceName = ''; // for deleting
  // Pagination
  currentPage = signal(1);
  pageSize = 3;
  hasNextPage = signal(false);

  // Modals
  modalMode: 'add' | 'edit' | null = null;
  selectedSource: Source | null = null;
  selectedSourceId: number | null = null;
  showDeleteModal = false;

  isLoadingSources = false;

  constructor(private sourceService: SourceService) {
    this.loadCompanies();
    this.loadSources();
  }

  // Load all sources and paginate
loadSources(): void {
  this.isLoadingSources = true;
  this.sourceService.getSources(this.currentPage()).subscribe({
    next: (data) => {
      this.sources.set(data.results);
      this.hasNextPage.set(data.has_next)
      // console.log(this.hasNextPage())
      this.isLoadingSources = false;
    },
    error: (err) => {
      console.error('Error loading sources:', err);
      this.isLoadingSources = false;
    }
  });
}


  loadCompanies(): void {
    this.sourceService.getCompanies().subscribe({
      next: (data) => this.companies.set(data),
      error: (err) => console.error('Error loading companies:', err)
    });
  }

 setPage(page: number): void {
  this.currentPage.set(page);
  this.loadSources();
}



  // Pagination buttons
  onPrevPage(): void {
    if (this.currentPage() > 1) this.setPage(this.currentPage() - 1);
  }

  onNextPage(): void {
  if (this.hasNextPage()) {
    this.setPage(this.currentPage() + 1);
  }
}


  // Modals
  openAdd(): void {
    this.modalMode = 'add';
    this.selectedSource = null;
  }

  openEdit(source: Source): void {
    this.modalMode = 'edit';
    this.selectedSource = {
      ...source,
      tagged_companies: source.tagged_companies.map(c =>
        typeof c === 'object' ? c : { id: c, name: '' }
      )
    };
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedSource = null;
  }

  saveSource(payload: { name: string; url: string; tagged_companies: number[] }): void {
    if (this.modalMode === 'add') {
      this.sourceService.addSource(payload).subscribe({
        next: () => {
          this.loadSources();
          this.closeModal();
        },
        error: (err) => console.error('Failed to add source:', err)
      });
    } else if (this.modalMode === 'edit' && this.selectedSource) {
      this.sourceService.updateSource(this.selectedSource.id, payload).subscribe({
        next: () => {
          this.loadSources();
          this.closeModal();
        },
        error: (err) => console.error('Failed to update source:', err)
      });
    }
  }

  // Delete modal
  openDeleteModal(id: number): void {
    this.selectedSourceId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  handleSourceDeleted(): void {
    this.showDeleteModal = false;
    this.loadSources();
  }

  // Fetch stories
  @ViewChild(FetchStoriesComponent)
  fetchStoriesComp!: FetchStoriesComponent;

  onFetchStories(sourceId: number): void {
    this.fetchStoriesComp.fetchStoriesForSource(sourceId);
  }
}
