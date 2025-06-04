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
    tagged_companies_ids:[] as number [],
    tagged_companies_details: [] as Company[]
  };

  ngOnInit() {
    if (this.isEdit && this.sourceData) {
      this.sourceForm = {
        name: this.sourceData.name,
        url: this.sourceData.url,
        tagged_companies_ids:[... this.sourceData.tagged_companies_ids],
        tagged_companies_details: [...this.sourceData.tagged_companies_details]
      };
    }
  }

  // onSubmit() {
  // if (
  //   !this.sourceForm.name ||
  //   !this.sourceForm.url ||
  //   this.sourceForm.tagged_companies_details.length === 0
  // ) {
  //   alert('All fields required');
  //   return;
  // }

  // const payload = {
  //   name: this.sourceForm.name,
  //   url: this.sourceForm.url,
  //   tagged_companies_details: this.sourceForm.tagged_companies_details.map(c => ({
  //     id: c.id,
  //     name: c.name
  //   }))
  // };


//   this.save.emit(payload);
// }
onSubmit() {
  if (
    !this.sourceForm.name ||
    !this.sourceForm.url ||
    this.sourceForm.tagged_companies_details.length === 0
  ) {
    alert('All fields required');
    return;
  }

  // Extract ids from tagged_companies_details
  this.sourceForm.tagged_companies_ids = this.sourceForm.tagged_companies_details.map(c => c.id);

  const payload = {
    name: this.sourceForm.name,
    url: this.sourceForm.url,
    tagged_companies_ids: this.sourceForm.tagged_companies_ids,
    tagged_companies_details: this.sourceForm.tagged_companies_details.map(c => ({
      id: c.id,
      name: c.name
    }))
  };

  this.save.emit(payload);
}


  filterCompanies() {
    const search = this.companySearch.toLowerCase();
    this.filteredCompanies = this.companies.filter(
      c =>
        c.name.toLowerCase().includes(search) &&
        !this.sourceForm.tagged_companies_details.some(sel => sel.id === c.id)
    );
  }

  // addCompany(company: Company) {
  //   this.sourceForm.tagged_companies_details.push(company);
  //   this.companySearch = '';
  //   this.filteredCompanies = [];
  // }
  addCompany(company: Company) {
  this.sourceForm.tagged_companies_details.push(company);
  this.sourceForm.tagged_companies_ids.push(company.id); // sync ID
  this.companySearch = '';
  this.filteredCompanies = [];
}


  // removeCompany(index: number) {
  //   this.sourceForm.tagged_companies_details.splice(index, 1);
  // }
  
  removeCompany(index: number) {
  const removed = this.sourceForm.tagged_companies_details.splice(index, 1)[0];
  this.sourceForm.tagged_companies_ids = this.sourceForm.tagged_companies_ids.filter(id => id !== removed.id);
}


  onClose() {
    this.close.emit();
  }
}
