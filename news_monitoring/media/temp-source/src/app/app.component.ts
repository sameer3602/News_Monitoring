import { Component } from '@angular/core';
import { SourceListComponent } from './source-list/source-list.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  imports: [SourceListComponent,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'temp-source';
}
