import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Ressource } from '../../core/models';
import { UserService } from '../../core/user.service';
import { FileSizePipe } from '../../core/file-size.pipe';

const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

function maxFileSize(control: AbstractControl): ValidationErrors | null {
  const file = control.value as File | null;
  return file && file.size > MAX_SIZE ? { maxSize: true } : null;
}

@Component({
  selector: 'app-my-space',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, FileSizePipe],
  templateUrl: './my-space.component.html',
  styleUrl: './my-space.component.css'
})
export class MySpaceComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  user = inject(UserService);

  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  pseudoCtrl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(40)] });

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    category: ['COURS', Validators.required],
    file: new FormControl<File | null>(null, [Validators.required, maxFileSize])
  });

  mine = signal<Ressource[]>([]);
  uploading = signal(false);
  message = signal<{ type: 'ok' | 'ko'; text: string } | null>(null);

  constructor() {
    if (this.user.pseudo()) this.loadMine();
  }

  savePseudo(): void {
    if (this.pseudoCtrl.invalid) { this.pseudoCtrl.markAsTouched(); return; }
    this.user.set(this.pseudoCtrl.value);
    this.loadMine();
  }

  logout(): void {
    this.user.clear();
    this.mine.set([]);
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.form.controls.file.setValue(file);
    this.form.controls.file.markAsTouched();
  }

  loadMine(): void {
    this.api.mine(this.user.pseudo()).subscribe((list) => this.mine.set(list));
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const data = new FormData();
    data.append('title', v.title);
    data.append('description', v.description);
    data.append('category', v.category);
    data.append('author', this.user.pseudo());
    data.append('file', v.file as File);

    this.uploading.set(true);
    this.message.set(null);
    this.api.create(data).subscribe({
      next: () => {
        this.uploading.set(false);
        this.message.set({ type: 'ok', text: 'Ressource publiée avec succès ✅' });
        this.form.reset({ title: '', description: '', category: 'COURS', file: null });
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        this.loadMine();
      },
      error: (err) => {
        this.uploading.set(false);
        this.message.set({ type: 'ko', text: err?.error?.message ?? "Échec de l'envoi." });
      }
    });
  }

  remove(r: Ressource): void {
    if (!confirm(`Supprimer « ${r.title} » ?`)) return;
    this.api.delete(r.id, this.user.pseudo()).subscribe(() => {
      this.mine.update((list) => list.filter((x) => x.id !== r.id));
    });
  }
}
