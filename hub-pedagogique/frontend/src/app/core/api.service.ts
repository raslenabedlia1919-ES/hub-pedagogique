import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment, Ressource } from './models';

const API = 'http://localhost:8080/api/resources';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  list(q: string, category: string): Observable<Ressource[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    if (category) params = params.set('category', category);
    return this.http.get<Ressource[]>(API, { params });
  }

  mine(author: string): Observable<Ressource[]> {
    return this.http.get<Ressource[]>(`${API}/mine`, { params: { author } });
  }

  get(id: string): Observable<Ressource> {
    return this.http.get<Ressource>(`${API}/${id}`);
  }

  create(form: FormData): Observable<Ressource> {
    return this.http.post<Ressource>(API, form);
  }

  delete(id: string, author: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`, { params: { author } });
  }

  comments(id: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API}/${id}/comments`);
  }

  addComment(id: string, author: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${API}/${id}/comments`, { author, content });
  }

  downloadUrl(id: string): string { return `${API}/${id}/download`; }
  previewUrl(id: string): string { return `${API}/${id}/download?inline=true`; }
}
