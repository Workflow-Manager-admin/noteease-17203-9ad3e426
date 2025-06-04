import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../services/notes.service';
import { Note, NoteFilter } from '../../models/note.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notes-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-container.component.html',
  styleUrls: ['./notes-container.component.css']
})
export class NotesContainerComponent implements OnInit {
  notes$: Observable<Note[]>;
  categories$: Observable<string[]>;
  searchTerm: string = '';
  selectedCategories: string[] = [];
  isEditMode = false;
  currentNote: Partial<Note> & { categoryInput?: string } = {};
  private isBrowser: boolean;

  constructor(
    private notesService: NotesService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.notes$ = this.notesService.getNotes();
    this.categories$ = this.notesService.getCategories();
  }

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    const filter: NoteFilter = {
      searchTerm: this.searchTerm,
      categories: this.selectedCategories.length ? this.selectedCategories : undefined
    };
    this.notes$ = this.notesService.getNotes(filter);
  }

  onSearch() {
    this.loadNotes();
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.loadNotes();
  }

  createNote() {
    if (this.currentNote.title && this.currentNote.content) {
      const categories = this.processCategoryInput(this.currentNote.categoryInput);
      this.notesService.createNote({
        title: this.currentNote.title,
        content: this.currentNote.content,
        categories: categories
      });
      this.resetForm();
    }
  }

  editNote(note: Note) {
    this.isEditMode = true;
    this.currentNote = {
      ...note,
      categoryInput: note.categories.join(', ')
    };
  }

  updateNote() {
    if (this.currentNote.id && this.currentNote.title && this.currentNote.content) {
      const categories = this.processCategoryInput(this.currentNote.categoryInput);
      this.notesService.updateNote(this.currentNote.id, {
        title: this.currentNote.title,
        content: this.currentNote.content,
        categories: categories
      });
      this.resetForm();
    }
  }

  deleteNote(id: string) {
    if (this.isBrowser && window.confirm('Are you sure you want to delete this note?')) {
      this.notesService.deleteNote(id);
    }
  }

  resetForm() {
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
