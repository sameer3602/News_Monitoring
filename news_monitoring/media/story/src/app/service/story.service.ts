import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { Story } from '../models/story.model';
import { Company } from '../models/company.model';
import { Source } from '../models/source.model';


export interface StoryCreatePayload {
  title: string;
  url: string;
  published_date: string;
  body_text: string;
  source: number;
  tagged_company_ids: number[];
}


@Injectable({
  providedIn: 'root',
})

export class StoryService {
  private baseUrl = `${environment.apiUrl}stories/`;
  private sourcesUrl = `${environment.apiUrl}sources/`;
  private companiesUrl = `${environment.apiUrl}companies/`;

  constructor(private http: HttpClient) {}

  getStories(): Observable<Story[]> {
    return this.http.get<Story[]>(this.baseUrl, this._httpOptions());
  }

   createStory(payload: StoryCreatePayload): Observable<Story> {
    return this.http.post<Story>(this.baseUrl, payload, this._httpOptions());
  }

  updateStory(story: Story): Observable<Story> {
    const payload = this._normalizeStory(story);
    return this.http.put<Story>(`${this.baseUrl}${story.id}/`, payload, this._httpOptions());
  }

  deleteStory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${id}/`, this._httpOptions());
  }

  getSources(): Observable<Source[]> {
    return this.http.get<Source[]>(this.sourcesUrl, this._httpOptions());
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl, this._httpOptions());
  }

    // Normalize story for PUT request
  private _normalizeStory(story: Story): StoryCreatePayload {
    return {
      title: story.title,
      url: story.url,
      published_date: story.published_date,
      body_text: story.body_text,
      source: story.source?.id ?? 0,
      tagged_company_ids: story.tagged_companies.map((c) => c.id),
    };
  }

  private _httpOptions() {
    const csrfToken = this.getCookie('csrftoken');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      }),
      withCredentials: true, // Required to include cookies (for CSRF in Django)
    };
  }

  private getCookie(name: string): string {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
    }
    return '';
  }
}
