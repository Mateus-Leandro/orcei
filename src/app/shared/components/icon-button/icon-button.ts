import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-icon-button',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
})
export class IconButton {
  @Input({ required: true }) icon: string = '';
  @Input() iconColor: string = 'var(--secondary)';
}
