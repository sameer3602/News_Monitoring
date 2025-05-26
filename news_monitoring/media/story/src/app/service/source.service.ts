import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Source } from '../models/source.model';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root',
})
export class SourceService {
  private sourcesUrl = `${environment.apiUrl}sources/`;

  constructor(private http: HttpClient) {}

  getSources(): Observable<Source[]> {
    return this.http.get<Source[]>(this.sourcesUrl);
  }
}
