import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Source, Company,Story, PaginatedSourcesResponse } from '../source.interface';


@Injectable({
  providedIn: 'root',
})
export class SourceService {

  private sourcesUrl = `${environment.apiUrl}sources/`;
  private companiesUrl = `${environment.apiUrl}companies/`;

  constructor(private http: HttpClient) {}

  
  getSources(page: number): Observable<PaginatedSourcesResponse> {
  return this.http.get<PaginatedSourcesResponse>(`${this.sourcesUrl}?page=${page}`);
}

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl);
  }

  addSource(source: { name: string; url: string; tagged_companies_ids: number[] }): Observable<Source> {
    return this.http.post<Source>(this.sourcesUrl, source, this._csrfOptions());
  }

  deleteSource(id: number): Observable<any> {
    return this.http.delete(`${this.sourcesUrl}${id}/`, this._csrfOptions());
  }

  fetchSource(id: number): Observable<Source> {
    return this.http.get<Source>(`${this.sourcesUrl}${id}/`);
  }

  updateSource(id: number, data: { name: string; url: string; tagged_companies_ids: number[] }): Observable<Source> {
    return this.http.put<Source>(`${this.sourcesUrl}${id}/`, data, this._csrfOptions());
  }


  fetchStories(sourceId: number): Observable<{ message: string; stories: Story[] }> {
  return this.http.get<{ message: string; stories: Story[] }>(
    `${this.sourcesUrl}${sourceId}/fetch_stories/`
  );
}

  private _csrfOptions() {
    const token = this.getCookie('csrftoken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-CSRFToken': token || ''
      }),
      withCredentials: true // Important for sending cookies in CORS
    };
  }

  private getCookie(name: string): string {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return '';
  }
}

