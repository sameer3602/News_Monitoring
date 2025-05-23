import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Source, Company} from '../source-list/source.model';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private sourcesUrl = `${environment.apiUrl}sources/`;
  private companiesUrl = `${environment.apiUrl}companies/`;

  constructor(private http: HttpClient) {}

  // Get paginated sources, passing page query param
  // source.service.ts
getSources(): Observable<Source[]> {
  return this.http.get<Source[]>(this.sourcesUrl);
}


  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl);
  }

  addSource(source: { name: string; url: string; tagged_companies: number[] }): Observable<Source> {
    return this.http.post<Source>(this.sourcesUrl, source);
  }

  deleteSource(id: number): Observable<any> {
    return this.http.delete(`${this.sourcesUrl}${id}/`);
  }

  fetchSource(id: number): Observable<Source> {
    return this.http.get<Source>(`${this.sourcesUrl}${id}/`);
  }

  updateSource(id: number, data: { name: string; url: string; tagged_companies: number[] }): Observable<Source> {
  return this.http.put<Source>(`/api/sources/${id}/`, data);
}

}
