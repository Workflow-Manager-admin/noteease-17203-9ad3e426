import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Note, NoteFilter } from '../models/note.model';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private notes = new BehaviorSubject<Note[]>([]);
  private categories = new BehaviorSubject<string[]>([]);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Load notes from localStorage only in browser environment
    if (this.isBrowser) {
      const savedNotes = localStorage.getItem('notes');
      if (savedNotes) {
        this.notes.next(JSON.parse(savedNotes));
        this.updateCategories();
      }
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get all notes with optional filtering
   */
  getNotes(filter?: NoteFilter): Observable<Note[]> {
    return this.notes.pipe(
      map(notes => {
        let filteredNotes = [...notes];
        
        if (filter?.searchTerm) {
          const searchTerm = filter.searchTerm.toLowerCase();
          filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
          );
        }

        if (filter?.categories?.length) {
          filteredNotes = filteredNotes.filter(note =>
            note.categories.some(category => filter.categories?.includes(category))
          );
        }

        return filteredNotes.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Get all available categories
   */
  getCategories(): Observable<string[]> {
    return this.categories.asObservable();
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new note
   */
  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newNote: Note = {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentNotes = this.notes.value;
    this.notes.next([...currentNotes, newNote]);
    this.saveToLocalStorage();
    this.updateCategories();
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing note
   */
  updateNote(id: string, updates: Partial<Note>): void {
    const currentNotes = this.notes.value;
    const updatedNotes = currentNotes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );

    this.notes.next(updatedNotes);
    this.saveToLocalStorage();
    this.updateCategories();
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note
   */
  deleteNote(id: string): void {
    const currentNotes = this.notes.value;
    const updatedNotes = currentNotes.filter(note => note.id !== id);
    
    this.notes.next(updatedNotes);
    this.saveToLocalStorage();
    this.updateCategories();
  }

  private saveToLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('notes', JSON.stringify(this.notes.value));
    }
  }

  private updateCategories(): void {
    const allCategories = new Set<string>();
    this.notes.value.forEach(note => {
      note.categories.forEach(category => allCategories.add(category));
    });
    this.categories.next(Array.from(allCategories));
  }
}
