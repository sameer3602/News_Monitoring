import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Source, Company,Story } from '../source-list/source.model';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private sourcesUrl = `${environment.apiUrl}sources/`;
  private companiesUrl = `${environment.apiUrl}companies/`;

  constructor(private http: HttpClient) {}

  getSources(): Observable<Source[]> {
    return this.http.get<Source[]>(this.sourcesUrl);
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.companiesUrl);
  }

  addSource(source: { name: string; url: string; tagged_companies: number[] }): Observable<Source> {
    return this.http.post<Source>(this.sourcesUrl, source, this._csrfOptions());
  }

  deleteSource(id: number): Observable<any> {
    return this.http.delete(`${this.sourcesUrl}${id}/`, this._csrfOptions());
  }

  fetchSource(id: number): Observable<Source> {
    return this.http.get<Source>(`${this.sourcesUrl}${id}/`);
  }

  updateSource(id: number, data: { name: string; url: string; tagged_companies: number[] }): Observable<Source> {
    return this.http.put<Source>(`${this.sourcesUrl}${id}/`, data, this._csrfOptions());
  }

  /** ✅ Fetch stories by url */
  fetchStories(sourceId: number): Observable<{ message: string; stories: Story[] }> {
  return this.http.get<{ message: string; stories: Story[] }>(
    `${this.sourcesUrl}${sourceId}/fetch_stories/`
  );
}



  /** ✅ Attach CSRF token for unsafe requests (POST/PUT/DELETE) */
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

  /** ✅ Cookie parser helper */
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


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../environments/environment';
// import { Source, Company } from '../source-list/source.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class SourceService {
//   private sourcesUrl = `${environment.apiUrl}sources/`;
//   private companiesUrl = `${environment.apiUrl}companies/`;

//   constructor(private http: HttpClient) {}

//   /** ✅ Fetch all sources */
//   getSources(): Observable<Source[]> {
//     return this.http.get<Source[]>(this.sourcesUrl, this._csrfOptions());
//   }

//   /** ✅ Fetch all companies */
//   getCompanies(): Observable<Company[]> {
//     return this.http.get<Company[]>(this.companiesUrl, this._csrfOptions());
//   }

//   /** ✅ Add a new source */
//   addSource(source: { name: string; url: string; tagged_companies: number[] }): Observable<Source> {
//   const payload = {
//     name: source.name,
//     url: source.url.trim().startsWith('http') ? source.url : `https://${source.url}`,
//     tagged_companies: source.tagged_companies
//   };

//   return this.http.post<Source>(this.sourcesUrl, payload, this._csrfOptions());
// }


//   /** ✅ Delete source by ID */
//   deleteSource(id: number): Observable<any> {
//     return this.http.delete(`${this.sourcesUrl}${id}/`, this._csrfOptions());
//   }

//   /** ✅ Fetch stories by url */
//   fetchStories(sourceId: number): Observable<{ message: string }> {
//   return this.http.get<{ message: string }>(`/api/source/${sourceId}/fetch_stories/`);
// }

//   /** ✅ Update an existing source */
//   updateSource(id: number, data: { name: string; url: string; tagged_companies: number[] }): Observable<Source> {
//     const payload = {
//       name: data.name,
//       url: data.url,
//       tagged_companies: data.tagged_companies, 
//     };
//     console.log('Updating source with payload:', payload);

//     return this.http.put<Source>(`${this.sourcesUrl}${id}/`, payload, this._csrfOptions());
//   }

//   /** ✅ Attach CSRF token for unsafe requests (POST/PUT/DELETE) */
//   private _csrfOptions() {
//     const token = this.getCookie('csrftoken');
//     return {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         ...(token ? { 'X-CSRFToken': token } : {})
//       }),
//       withCredentials: true
//     };
//   }

//   /** ✅ Cookie parser helper */
//   private getCookie(name: string): string {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//       const [key, value] = cookie.trim().split('=');
//       if (key === name) {
//         return decodeURIComponent(value);
//       }
//     }
//     return '';
//   }
// }
