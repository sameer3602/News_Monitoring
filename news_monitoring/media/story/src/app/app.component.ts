import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoryComponent } from './story/story.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StoryComponent],
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent {
  title = 'story';
}
