import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Ressource } from '../../core/models';
import { FileSizePipe } from '../../core/file-size.pipe';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, FileSizePipe],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent {
  private api = inject(ApiService);

  search = new FormControl('', { nonNullable: true });
  private category$ = new BehaviorSubject<string>('');

  categories = [
    { value: '', label: 'Tous' },
    { value: 'COURS', label: '📖 Cours' },
    { value: 'TP', label: '🧪 TP' },
    { value: 'PROJET', label: '🚀 Projet' }
  ];

  activeCategory = signal('');
  items = signal<Ressource[]>([]);
  loading = signal(false);
  error = signal(false);

  constructor() {
    combineLatest([
      this.search.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.category$
    ])
      .pipe(
        tap(() => { this.loading.set(true); this.error.set(false); }),
        switchMap(([q, c]) =>
          this.api.list(q, c).pipe(catchError(() => { this.error.set(true); return of([] as Ressource[]); }))
        ),
        takeUntilDestroyed()
      )
      .subscribe((list) => { this.items.set(list); this.loading.set(false); });
  }

  setCategory(value: string): void {
    this.activeCategory.set(value);
    this.category$.next(value);
  }
}
