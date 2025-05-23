import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Source } from './source.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private baseUrl = environment.apiUrl + 'sources/';
  private companiesUrl = environment.apiUrl + 'companies/';

  constructor(private http: HttpClient) {}

  getSources(): Observable<Source[]> {
    return this.http.get<Source[]>(this.baseUrl);
  }

  addSource(source: any): Observable<Source> {
    return this.http.post<Source>(this.baseUrl, source);
  }

  deleteSource(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}/`);
  }

  updateSource(id: number, data: any): Observable<Source> {
    return this.http.put<Source>(`${this.baseUrl}${id}/`, data);
  }

  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(this.companiesUrl);
  }
}
