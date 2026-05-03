import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-icon-button',
  imports: [MatIconModule, MatButtonModule, MatTooltip],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
})
export class IconButton {
  @Input({ required: true }) icon: string = '';
  @Input() iconColor: string = 'var(--secondary)';
  @Input() bgColor: string = 'var(--primary)';
  @Input() tooltip: string = '';
}
