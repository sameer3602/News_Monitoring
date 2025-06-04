import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Story, Company } from '../story.interface';
import { StoryService } from '../service/story.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'add-update-story',
  templateUrl: './add-update-story.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AddUpdateStoryComponent {
  @Input() isEdit: boolean = false;
  @Input() storyToEdit!: Story;
  @Output() closeModal = new EventEmitter<void>();
  @Output() refreshStories = new EventEmitter<void>();

  companySearch: string = '';
  @Input() allcompanies: Company[] = [];
  filteredCompanies: Company[] = [];

  storyForm: Story = {
    title: '',
    url: '',
    body_text: '',
    published_date: '',
    tagged_companies_ids: [],
    tagged_companies_details: [],
  };

  constructor(private storyService: StoryService) {}

  ngOnInit() {
    this.storyService.getCompanies().subscribe((companies) => {
      this.allcompanies = companies;

      if (this.isEdit && this.storyToEdit) {
        const taggedDetails = this.storyToEdit.tagged_companies_details || [];

        this.storyForm = {
          id: this.storyToEdit.id,
          title: this.storyToEdit.title,
          url: this.storyToEdit.url,
          body_text: this.storyToEdit.body_text,
          published_date: this.storyToEdit.published_date,
          tagged_companies_ids: taggedDetails.map((c) => c.id),
          tagged_companies_details: [...taggedDetails],
        };
      }
    });
  }

  filterCompanies(): void {
    const search = this.companySearch.toLowerCase();
    this.filteredCompanies = this.allcompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(search) &&
        !this.storyForm.tagged_companies_ids.includes(company.id)
    );
  }

  addCompany(company: Company): void {
    if (!this.storyForm.tagged_companies_ids.includes(company.id)) {
      this.storyForm.tagged_companies_ids.push(company.id);
      this.storyForm.tagged_companies_details.push(company);
    }
    this.companySearch = '';
    this.filteredCompanies = [];
  }

  removeCompany(company: Company): void {
    this.storyForm.tagged_companies_ids = this.storyForm.tagged_companies_ids.filter(
      (id) => id !== company.id
    );
    this.storyForm.tagged_companies_details = this.storyForm.tagged_companies_details.filter(
      (c) => c.id !== company.id
    );
  }

onSubmit(): void {
  const payload: any = {
    title: this.storyForm.title,
    url: this.storyForm.url,
    body_text: this.storyForm.body_text,
    published_date: this.storyForm.published_date,
    tagged_companies_ids: this.storyForm.tagged_companies_details.map(
      (company: Company) => company.id
    ),
  };

  const action$ = this.isEdit && this.storyForm.id
    ? this.storyService.updateStory(this.storyForm.id, payload)
    : this.storyService.createStory(payload);

  action$.subscribe({
    next: () => {
      this.refreshStories.emit();
      this.onClose();
    },
    error: (err) => {
      console.error(`Failed to ${this.isEdit ? 'update' : 'create'} story:`, err);
    },
  });

  console.log('Submitted payload:', payload);
}


  onClose(): void {
    this.closeModal.emit();
  }
}



// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import { Story, Company } from '../story.interface';
// import { StoryService } from '../service/story.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'add-update-story',
//   templateUrl: './add-update-story.component.html',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
// })
// export class AddUpdateStoryComponent {
//   @Input() isEdit: boolean = false;
//   @Input() storyToEdit!: Story;
//   @Output() closeModal = new EventEmitter<void>();
//   @Output() refreshStories = new EventEmitter<void>();

//   storyForm: any = {
//     id: null,
//     title: '',
//     url: '',
//     body_text: '',
//     published_date: '',
//     tagged_companies: [],          // For backend
//     tagged_companies_details: [],  // For UI
//   };

//   companySearch: string = '';
//   @Input() allcompanies: Company[] = [];
//   filteredCompanies: Company[] = [];

//   constructor(private storyService: StoryService) {}

//   ngOnInit() {
//     this.storyService.getCompanies().subscribe((companies) => {
//       this.allcompanies = companies;

//       if (this.isEdit && this.storyToEdit) {
//         const taggedCompanies = this.storyToEdit.tagged_companies || [];

//         this.storyForm = {
//           id: this.storyToEdit.id,
//           title: this.storyToEdit.title,
//           url: this.storyToEdit.url,
//           body_text: this.storyToEdit.body_text,
//           published_date: this.storyToEdit.published_date,
//           tagged_companies: taggedCompanies.map((c: Company) => c.id),
//           tagged_companies_details: taggedCompanies,
//         };
//       }
//     });
//   }

//   filterCompanies(): void {
//     const search = this.companySearch.toLowerCase();
//     this.filteredCompanies = this.allcompanies.filter(
//       (company) =>
//         company.name.toLowerCase().includes(search) &&
//         !this.storyForm.tagged_companies.includes(company.id)
//     );
//   }

//   addCompany(company: Company): void {
//     if (!this.storyForm.tagged_companies.includes(company.id)) {
//       this.storyForm.tagged_companies.push(company.id);
//       this.storyForm.tagged_companies_details.push(company);
//     }
//     this.companySearch = '';
//     this.filteredCompanies = [];
//   }

//   removeCompany(company: Company): void {
//     this.storyForm.tagged_companies = this.storyForm.tagged_companies.filter(
//       (id: number) => id !== company.id
//     );
//     this.storyForm.tagged_companies_details = this.storyForm.tagged_companies_details.filter(
//       (c: Company) => c.id !== company.id
//     );
//   }

//   onSubmit(): void {
//     if (this.isEdit) {
//       this.storyService.updateStory(this.storyForm.id,this.storyForm).subscribe(() => {
//         this.refreshStories.emit();
//         this.onClose();
//       });
//     } else {
//       this.storyForm.id=Date.now()
//       this.storyService.createStory(this.storyForm).subscribe(() => {
//         this.refreshStories.emit();
//         this.onClose();
//       });
//     }
//   }

//   onClose(): void {
//     this.closeModal.emit();
//   }
// }
