import { Injectable, signal } from '@angular/core';

/** Identité simplifiée (pseudo) stockée dans le navigateur — à remplacer par une vraie auth (JWT). */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly KEY = 'hub-pseudo';
  readonly pseudo = signal<string>(localStorage.getItem(this.KEY) ?? '');

  set(name: string): void {
    const clean = name.trim();
    localStorage.setItem(this.KEY, clean);
    this.pseudo.set(clean);
  }

  clear(): void {
    localStorage.removeItem(this.KEY);
    this.pseudo.set('');
  }
}
