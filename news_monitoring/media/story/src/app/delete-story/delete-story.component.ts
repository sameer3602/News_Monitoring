
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-delete-story',
  imports: [CommonModule],
  templateUrl: './delete-story.component.html',
  styleUrl: './delete-story.component.css',
  standalone:true,
})


export class DeleteStoryComponent {
  @Input() storyId!: number;
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() cancelDelete = new EventEmitter<void>();

  onConfirm() {
    this.confirmDelete.emit();
  }

  onCancel() {
    this.cancelDelete.emit();
  }
}
