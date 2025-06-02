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

  storyForm: any = {
    id: null,
    title: '',
    url: '',
    body_text: '',
    published_date: '',
    tagged_companies: [],          // For backend
    tagged_companies_details: [],  // For UI
  };

  companySearch: string = '';
  @Input() allcompanies: Company[] = [];
  filteredCompanies: Company[] = [];

  constructor(private storyService: StoryService) {}

  ngOnInit() {
    this.storyService.getCompanies().subscribe((companies) => {
      this.allcompanies = companies;

      if (this.isEdit && this.storyToEdit) {
        const taggedCompanies = this.storyToEdit.tagged_companies_details || [];

        this.storyForm = {
          id: this.storyToEdit.id,
          title: this.storyToEdit.title,
          url: this.storyToEdit.url,
          body_text: this.storyToEdit.body_text,
          published_date: this.storyToEdit.published_date,
          tagged_companies: taggedCompanies.map((c: Company) => c.id),
          tagged_companies_details: taggedCompanies,
        };
      }
    });
  }

  filterCompanies(): void {
    const search = this.companySearch.toLowerCase();
    this.filteredCompanies = this.allcompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(search) &&
        !this.storyForm.tagged_companies.includes(company.id)
    );
  }

  addCompany(company: Company): void {
    if (!this.storyForm.tagged_companies.includes(company.id)) {
      this.storyForm.tagged_companies.push(company.id);
      this.storyForm.tagged_companies_details.push(company);
    }
    this.companySearch = '';
    this.filteredCompanies = [];
  }

  removeCompany(company: Company): void {
    this.storyForm.tagged_companies = this.storyForm.tagged_companies.filter(
      (id: number) => id !== company.id
    );
    this.storyForm.tagged_companies_details = this.storyForm.tagged_companies_details.filter(
      (c: Company) => c.id !== company.id
    );
  }

  onSubmit(): void {

    // console.log(this.storyForm)
    const payload: Story = {
      title: this.storyForm.title,
      url: this.storyForm.url,
      body_text: this.storyForm.body_text,
      published_date: this.storyForm.published_date,
      tagged_companies: this.storyForm.tagged_companies,
      tagged_companies_details: this.storyForm.tagged_companies_details,
    };

    if (this.isEdit) {
      payload.id=this.storyForm.id
      this.storyService.updateStory(payload.id!, payload).subscribe(() => {
        this.refreshStories.emit();
        this.onClose();
      });
    } else {
      payload.id=Date.now()
      console.log(payload)
      this.storyService.createStory(payload).subscribe(() => {
        this.refreshStories.emit();
        this.onClose();
      });
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
