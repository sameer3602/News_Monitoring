import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SourceService } from '../service/source.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-source',
  templateUrl: './delete-source.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class DeleteSourceComponent {
  @Input() sourceId!: number;
  @Input() sourceName!: string;
  @Output() deleted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  constructor(private sourceService: SourceService) {}

  confirmDelete() {
    this.loading = true;
    this.sourceService.deleteSource(this.sourceId).subscribe({
      next: () => {
        this.loading = false;
        this.deleted.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to delete source.';
        console.error(err);
      },
    });
  }

  cancel() {
    this.closed.emit();
  }
}
