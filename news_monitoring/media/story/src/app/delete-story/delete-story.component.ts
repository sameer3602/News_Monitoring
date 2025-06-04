
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModalModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-story',
  standalone: true,
  imports: [CommonModule, NgbModalModule],
  templateUrl: './delete-story.component.html',
  styleUrl:'./delete-story.component.css'
})
export class DeleteStoryComponent {
  @Input() storyId!: number;
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() cancelDelete = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  onConfirm() {
    this.confirmDelete.emit();
    this.activeModal.close(); // closes-modal
  }

  onCancel() {
    this.cancelDelete.emit();
    this.activeModal.dismiss(); // dismisses-modal
  }
}
