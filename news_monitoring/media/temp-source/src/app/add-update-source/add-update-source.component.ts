import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Source, Company } from '../source.interface';

@Component({
  selector: 'app-add-update-source',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-update-source.component.html',
  styleUrls: ['./add-update-source.component.css']
})
export class AddUpdateSourceComponent implements OnInit {
  @Input() isEdit = false;
  @Input() sourceData: Source | null = null;
  @Input() companies: Company[] = [];

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  companySearch = '';
  filteredCompanies: Company[] = [];

  sourceForm = {
    name: '',
    url: '',
    tagged_companies: [] as Company[]
  };

  ngOnInit() {
    if (this.isEdit && this.sourceData) {
      this.sourceForm = {
        name: this.sourceData.name,
        url: this.sourceData.url,
        tagged_companies: [...this.sourceData.tagged_companies]
      };
    }
  }

  onSubmit() {
    if (!this.sourceForm.name || !this.sourceForm.url || this.sourceForm.tagged_companies.length === 0) {
      alert('All fields required');
      return;
    }

    const payload = {
      name: this.sourceForm.name,
      url: this.sourceForm.url,
      tagged_companies: this.sourceForm.tagged_companies.map(c => c.id)
    };

    this.save.emit(payload);
  }

  filterCompanies() {
    const search = this.companySearch.toLowerCase();
    this.filteredCompanies = this.companies.filter(
      c =>
        c.name.toLowerCase().includes(search) &&
        !this.sourceForm.tagged_companies.some(sel => sel.id === c.id)
    );
  }

  addCompany(company: Company) {
    this.sourceForm.tagged_companies.push(company);
    this.companySearch = '';
    this.filteredCompanies = [];
  }

  removeCompany(index: number) {
    this.sourceForm.tagged_companies.splice(index, 1);
  }

  onClose() {
    this.close.emit();
  }
}
