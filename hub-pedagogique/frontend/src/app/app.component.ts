import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <div class="nav-inner">
        <a routerLink="/" class="logo">📚 Hub Pédagogique</a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Catalogue</a>
          <a routerLink="/mon-espace" routerLinkActive="active">Mon espace</a>
        </nav>
      </div>
    </header>
    <main class="container"><router-outlet /></main>
  `,
  styles: [`
    .nav { background: var(--primary); color: #fff; }
    .nav-inner { max-width: 1000px; margin: 0 auto; padding: 14px 16px; display: flex;
                 justify-content: space-between; align-items: center; }
    .logo { color: #fff; font-weight: 700; font-size: 18px; }
    nav a { color: #e0e7ff; margin-left: 20px; padding-bottom: 4px; }
    nav a.active { color: #fff; border-bottom: 2px solid #fff; }
  `]
})
export class AppComponent {}
