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
  companies = signal<Company[]>([]);
  sources = signal<Source[]>([]);
  selectedSourceName = '';
  currentPage = signal(1);
  hasNextPage = signal(false);
  hasPrevPage = signal(false);
  totalPages = signal(1);

  modalMode: 'add' | 'edit' | null = null;
  selectedSource: Source | null = null;
  selectedSourceId: number | null = null;
  showDeleteModal = false;
  isLoadingSources = false;

  constructor(private sourceService: SourceService) {
    this.loadSources();
  }

  loadSources(): void {
    this.isLoadingSources = true;
    const page = this.currentPage();

    this.sourceService.getSources(page).subscribe({
      next: (data) => {
        this.sources.set(data.sources);
        this.hasNextPage.set(data.has_next);
        this.hasPrevPage.set(data.has_prev);
        this.totalPages.set(data.total_pages);
        this.currentPage.set(data.page_number);
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
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadSources();
    }
  }

  onPrevPage(): void {
    if (this.hasPrevPage()) {
      this.setPage(this.currentPage() - 1);
    }
  }

  onNextPage(): void {
    if (this.hasNextPage()) {
      this.setPage(this.currentPage() + 1);
    }
  }

  openAdd(): void {
    this.loadCompanies();
    this.modalMode = 'add';
    this.selectedSource = null;
  }

  openEdit(source: Source): void {
    this.loadCompanies();
    this.modalMode = 'edit';
    this.selectedSource = {
      ...source,
      tagged_companies_details: source.tagged_companies_details.map(c =>
        typeof c === 'object' ? c : { id: c, name: '' }
      ),
      tagged_companies_ids: source.tagged_companies_details.map(c =>
        typeof c === 'object' ? c.id : c
      )
    };
  }

  closeModal(): void {
    this.modalMode = null;
    this.selectedSource = null;
  }

  saveSource(payload: {
    name: string;
    url: string;
    tagged_companies_ids: number[];
    tagged_companies_details: Company[];
  }): void {
    const transformedPayload = {
      name: payload.name,
      url: payload.url,
      tagged_companies_ids: payload.tagged_companies_details.map(company => company.id),
    };

    const action$ = this.modalMode === 'add'
      ? this.sourceService.addSource(transformedPayload)
      : this.modalMode === 'edit' && this.selectedSource
        ? this.sourceService.updateSource(this.selectedSource.id, transformedPayload)
        : null;

    if (!action$) {
      console.error('Invalid modal mode or no source selected for update');
      return;
    }

    action$.subscribe({
      next: () => {
        this.loadSources();
        this.closeModal();
      },
      error: (err) => console.error(`Failed to ${this.modalMode} source:`, err),
    });

    console.log('Submitted payload:', transformedPayload);
  }

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

  @ViewChild(FetchStoriesComponent)
  fetchStoriesComp!: FetchStoriesComponent;

  onFetchStories(sourceId: number): void {
    this.fetchStoriesComp.fetchStoriesForSource(sourceId);
  }
}

















// import { Component, signal, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { SourceService } from './service/source.service';
// import { Source, Company } from './source.interface';
// import { AddUpdateSourceComponent } from './add-update-source/add-update-source.component';
// import { FetchStoriesComponent } from './fetch-stories/fetch-stories.component';
// import { DeleteSourceComponent } from './delete-source/delete-source.component';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [CommonModule, AddUpdateSourceComponent, DeleteSourceComponent, FetchStoriesComponent],
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.css']
// })
// export class AppComponent {
//   companies = signal<Company[]>([]);
//   sources = signal<Source[]>([]);
//   selectedSourceName = '';
//   currentPage = signal(1);
//   hasNextPage = signal(false);
//   hasPrevPage = signal(false);
//   totalPages = signal(1); // Even though backend says 10000, store it anyway

//   modalMode: 'add' | 'edit' | null = null;
//   selectedSource: Source | null = null;
//   selectedSourceId: number | null = null;
//   showDeleteModal = false;
//   isLoadingSources = false;

//   constructor(private sourceService: SourceService) {
//     this.loadSources();
//   }

//   loadSources(): void {
//     this.isLoadingSources = true;
//     const page = this.currentPage();

//     this.sourceService.getSources(page).subscribe({
//       next: (data) => {
//         this.sources.set(data.sources);
//         this.hasNextPage.set(data.has_next);
//         this.hasPrevPage.set(data.has_prev);
//         this.totalPages.set(data.total_pages);
//         this.currentPage.set(data.page_number);
//         this.isLoadingSources = false;
//       },
//       error: (err) => {
//         console.error('Error loading sources:', err);
//         this.isLoadingSources = false;
//       }
//     });
//   }

//   loadCompanies(): void {
//     this.sourceService.getCompanies().subscribe({
//       next: (data) => this.companies.set(data),
//       error: (err) => console.error('Error loading companies:', err)
//     });
//   }

//   setPage(page: number): void {
//     if (page >= 1 && page <= this.totalPages()) {
//       this.currentPage.set(page);
//       this.loadSources();
//     }
//   }

//   onPrevPage(): void {
//     if (this.hasPrevPage()) {
//       this.setPage(this.currentPage() - 1);
//     }
//   }

//   onNextPage(): void {
//     if (this.hasNextPage()) {
//       this.setPage(this.currentPage() + 1);
//     }
//   }

//   openAdd(): void {
//     this.loadCompanies();
//     this.modalMode = 'add';
//     this.selectedSource = null;
//   }

//   openEdit(source: Source): void {
//     this.loadCompanies();
//     this.modalMode = 'edit';
//     this.selectedSource = {
//       ...source,
//       tagged_companies_details: source.tagged_companies_details.map(c =>
//         typeof c === 'object' ? c : { id: c, name: '' }
//       )
//     };
//   }

//   closeModal(): void {
//     this.modalMode = null;
//     this.selectedSource = null;
//   }

// saveSource(payload: { name: string; url: string; tagged_companies_ids: number [] ;tagged_companies_details: Company[] }): void {
//   const transformedPayload = {
//     name: payload.name,
//     url: payload.url,
//     tagged_companies_ids: payload.tagged_companies_ids.map(id=> id),
//     tagged_companies_details: payload.tagged_companies_details.map(company => ({
//       id: company.id,
//       name: company.name
//     }))
//   };

//   const action$ = this.modalMode === 'add'
//     ? this.sourceService.addSource(transformedPayload)
//     : this.modalMode === 'edit' && this.selectedSource
//       ? this.sourceService.updateSource(this.selectedSource.id, transformedPayload)
//       : null;

//   if (!action$) {
//     console.error('Invalid modal mode or no source selected for update');
//     return;
//   }

//   action$.subscribe({
//     next: () => {
//       this.loadSources();
//       this.closeModal();
//     },
//     error: (err) => console.error(`Failed to ${this.modalMode} source:`, err),
//   });

//   console.log('Submitted payload:', transformedPayload);
// }




//   openDeleteModal(id: number): void {
//     this.selectedSourceId = id;
//     this.showDeleteModal = true;
//   }

//   closeDeleteModal(): void {
//     this.showDeleteModal = false;
//   }

//   handleSourceDeleted(): void {
//     this.showDeleteModal = false;
//     this.loadSources();
//   }

//   @ViewChild(FetchStoriesComponent)
//   fetchStoriesComp!: FetchStoriesComponent;

//   onFetchStories(sourceId: number): void {
//     this.fetchStoriesComp.fetchStoriesForSource(sourceId);
//   }
// }



