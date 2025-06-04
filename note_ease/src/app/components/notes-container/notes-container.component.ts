import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note, NoteFilter } from '../../models/note.model';
import { Observable } from 'rxjs';
import { getConfirm } from '../../utils/environment';

@Component({
  selector: 'app-notes-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-container.component.html',
  styleUrls: ['./notes-container.component.css']
})
export class NotesContainerComponent implements OnInit {
  notes$!: Observable<Note[]>;
  categories$!: Observable<string[]>;
  searchTerm = '';
  selectedCategories: string[] = [];
  isEditMode = false;
  currentNote: Partial<Note> & { categoryInput?: string } = {};

  constructor(private readonly _notesService: NotesService) {
    this._initializeObservables();
  }

  private _initializeObservables(): void {
    this.notes$ = this._notesService.getNotes();
    this.categories$ = this._notesService.getCategories();
  }

  ngOnInit(): void {
    this.loadNotes();
  }

  loadNotes(): void {
    const filter: NoteFilter = {
      searchTerm: this.searchTerm,
      categories: this.selectedCategories.length ? this.selectedCategories : undefined
    };
    this.notes$ = this._notesService.getNotes(filter);
  }

  onSearch(): void {
    this.loadNotes();
  }

  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.loadNotes();
  }

  createNote(): void {
    if (this.currentNote.title && this.currentNote.content) {
      const categories = this.processCategoryInput(this.currentNote.categoryInput);
      this._notesService.createNote({
        title: this.currentNote.title,
        content: this.currentNote.content,
        categories: categories
      });
      this.resetForm();
    }
  }

  editNote(note: Note): void {
    this.isEditMode = true;
    this.currentNote = {
      ...note,
      categoryInput: note.categories.join(', ')
    };
  }

  updateNote(): void {
    if (this.currentNote.id && this.currentNote.title && this.currentNote.content) {
      const categories = this.processCategoryInput(this.currentNote.categoryInput);
      this._notesService.updateNote(this.currentNote.id, {
        title: this.currentNote.title,
        content: this.currentNote.content,
        categories: categories
      });
      this.resetForm();
    }
  }

  deleteNote(id: string): void {
    const confirm = getConfirm();
    if (confirm && confirm('Are you sure you want to delete this note?')) {
      this._notesService.deleteNote(id);
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.currentNote = {};
  }

  private processCategoryInput(input?: string): string[] {
    if (!input) return [];
    return input
      .split(',')
      .map(category => category.trim())
      .filter(category => category.length > 0);
  }
}
