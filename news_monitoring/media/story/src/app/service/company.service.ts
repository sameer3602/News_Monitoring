import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Company } from '../models/company.model';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private companiesUrl = `${environment.apiUrl}companies/`;

  constructor(private http: HttpClient) {}

  // Get all companies
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl);
  }

  // Get a single company by ID
  getCompany(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.companiesUrl}${id}/`);
  }

  // Create a new company
  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(this.companiesUrl, company);
  }

  // Update an existing company
  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.companiesUrl}${company.id}/`, company);
  }

  // Delete a company by ID
  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.companiesUrl}${id}/`);
  }
}
