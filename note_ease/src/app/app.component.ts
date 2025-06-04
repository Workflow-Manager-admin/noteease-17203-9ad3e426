import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotesContainerComponent } from './components/notes-container/notes-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotesContainerComponent],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NoteEase';
}
