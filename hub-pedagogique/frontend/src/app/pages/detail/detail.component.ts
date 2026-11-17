import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Comment, Ressource } from '../../core/models';
import { UserService } from '../../core/user.service';
import { FileSizePipe } from '../../core/file-size.pipe';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, FileSizePipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private user = inject(UserService);

  resource = signal<Ressource | null>(null);
  comments = signal<Comment[]>([]);
  notFound = signal(false);
  sending = signal(false);

  form = this.fb.nonNullable.group({
    author: [this.user.pseudo(), [Validators.required, Validators.minLength(2), Validators.maxLength(40)]],
    content: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(500)]]
  });

  private id = this.route.snapshot.paramMap.get('id')!;

  constructor() {
    this.api.get(this.id).subscribe({
      next: (r) => this.resource.set(r),
      error: () => this.notFound.set(true)
    });
    this.loadComments();
  }

  get previewable(): boolean {
    const t = this.resource()?.contentType ?? '';
    return t.startsWith('image/') || t === 'application/pdf';
  }

  get isImage(): boolean {
    return (this.resource()?.contentType ?? '').startsWith('image/');
  }

  get downloadUrl(): string { return this.api.downloadUrl(this.id); }
  get previewUrl(): string { return this.api.previewUrl(this.id); }

  loadComments(): void {
    this.api.comments(this.id).subscribe((c) => this.comments.set(c));
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { author, content } = this.form.getRawValue();
    this.sending.set(true);
    this.api.addComment(this.id, author, content).subscribe({
      next: (c) => {
        this.comments.update((list) => [c, ...list]);
        this.form.controls.content.reset('');
        this.sending.set(false);
      },
      error: () => this.sending.set(false)
    });
  }
}
