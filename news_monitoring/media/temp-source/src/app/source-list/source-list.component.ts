import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SourceService } from '../service/source.service';
import { Source, Company, Story } from './source.model';

@Component({
  selector: 'app-source-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './source-list.component.html',
  styleUrls: ['./source-list.component.css'],
})
export class SourceListComponent implements OnInit {
  sources: Source[] = [];
  companies: Company[] = [];
  showModal = false;
  showEditModal = false;
  showDeleteModal = false;
  deleteSourceId: number | null = null;


  newSource: {
    name: string;
    url: string;
    tagged_companies: Company[];
  } = {
    name: '',
    url: '',
    tagged_companies: [],
  };

  editSource!: Source;

  page = 1;
  hasPrev = false;
  hasNext = false;

  //spinner options
  isLoadingSources = false;
  constructor(private sourceService: SourceService) {}

  ngOnInit(): void {
    this.loadSources();
    this.loadCompanies();
  }

  loadSources(): void {
  this.isLoadingSources = true;
  this.sourceService.getSources().subscribe({
    next: (data) => {
      this.sources = data;
      this.updatePaginatedSources();
      this.isLoadingSources = false;
    },
    error: (err) => {
      console.error('Failed to load sources', err);
      this.isLoadingSources = false;
    },
  });
}
  loadCompanies(): void {
    this.sourceService.getCompanies().subscribe({
      next: (data) => (this.companies = data),
      error: (err) => console.error('Failed to load companies', err),
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newSource = {
      name: '',
      url: '',
      tagged_companies: [],
    };
  }

  addSource(): void {
    if (
      !this.newSource.name ||
      !this.newSource.url ||
      this.newSource.tagged_companies.length === 0
    ) {
      alert('Please fill all fields');
      return;
    }

    // Prepare payload with company IDs for backend
    const payload = {
      name: this.newSource.name,
      url: this.newSource.url,
      tagged_companies: this.newSource.tagged_companies.map((c) => c.id),
    };

    this.sourceService.addSource(payload).subscribe({
      next: (source) => {
        this.sources.push(source);
        this.closeModal();
      },
      error: (err) => console.error('Failed to add source', err),
    });
  }


  // fetch stories
  fetchedStories = signal<Story[]>([]);
  showStoryModal = signal(false);

  onFetchStories(sourceId: number): void {
  this.sourceService.fetchStories(sourceId).subscribe({
    next: (response) => {
      // Limit to the first 10 stories
      const limitedStories = response.stories.slice(0, 10);
      this.fetchedStories.set(limitedStories);
      this.showStoryModal.set(true);
    },
    error: (err) => {
      console.error('Error fetching stories:', err);
      alert('Failed to fetch stories from RSS feed.');
    }
  });
}


  closeStoryModal(): void {
  this.showStoryModal.set(false);
  this.fetchedStories.set([]);
}


  openEditModal(source: Source): void {
    // Defensive copy to avoid mutating original source object
    this.editSource = {
      ...source,
      tagged_companies: source.tagged_companies.map(
        (c) => (typeof c === 'object' ? c : { id: c, name: '' })
      ),
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editSource = {} as Source;
  }

  updateSource(): void {
    if (
      !this.editSource.name ||
      !this.editSource.url ||
      !this.editSource.tagged_companies ||
      this.editSource.tagged_companies.length === 0
    ) {
      alert('Please fill all fields');
      return;
    }

    // Construct payload for backend (company IDs only)
      const payload: { name: string; url: string; tagged_companies: number[] } = {
      name: this.editSource.name,
      url: this.editSource.url,
      tagged_companies: this.editSource.tagged_companies.map(c =>
        typeof c === 'object' ? c.id : c
      ),
    };

    this.sourceService.updateSource(this.editSource.id, payload).subscribe({
      next: (updatedSource) => {
        const index = this.sources.findIndex((s) => s.id === updatedSource.id);
        if (index !== -1) {
          this.sources[index] = updatedSource;
        }
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update source', err);
        alert('Failed to update source');
      },
    });
}

  openDeleteModal(id: number): void {
  this.deleteSourceId = id;
  this.showDeleteModal = true;
}

closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.deleteSourceId = null;
}

confirmDelete(): void {
  if (this.deleteSourceId !== null) {
    this.sourceService.deleteSource(this.deleteSourceId).subscribe({
      next: () => {
        this.sources = this.sources.filter(s => s.id !== this.deleteSourceId);
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Failed to delete source', err);
        alert('Failed to delete source');
      }
    });
  }
}


// pagination logic
  readonly pageSize = 5;

  updatePaginatedSources(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.sources = this.sources.slice(start, end);
    this.hasPrev = this.page > 1;
    this.hasNext = end < this.sources.length;
  }
    nextPage(): void {
    if (this.hasNext) {
      this.page++;
      this.updatePaginatedSources();
    }
  }

  prevPage(): void {
    if (this.hasPrev) {
      this.page--;
      this.updatePaginatedSources();
    }
  }


// filtered companies for new source modal
companySearch = '';
filteredCompanies: Company[] = [];

filterCompanies() {
  const search = this.companySearch.toLowerCase();
  this.filteredCompanies = this.companies.filter(c =>
    c.name.toLowerCase().includes(search) &&
    !this.newSource.tagged_companies.some(sel => sel.id === c.id)
  );
}

addCompanyToNewSource(company: Company) {
  this.newSource.tagged_companies.push(company);
  this.companySearch = '';
  this.filteredCompanies = [];
}

removeCompanyFromNewSource(index: number) {
  this.newSource.tagged_companies.splice(index, 1);
}

// For Edit Modal
editCompanySearch = '';
editFilteredCompanies: Company[] = [];

filterEditCompanies() {
  const search = this.editCompanySearch.toLowerCase();
  this.editFilteredCompanies = this.companies.filter(c =>
    c.name.toLowerCase().includes(search) &&
    !this.editSource.tagged_companies.some(sel => sel.id === c.id)
  );
}

addCompany(company: Company) {
  this.editSource.tagged_companies.push(company);
  this.editCompanySearch = '';
  this.editFilteredCompanies = [];
}

removeCompany(index: number) {
  this.editSource.tagged_companies.splice(index, 1);
}

}
