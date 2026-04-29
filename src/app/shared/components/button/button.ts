import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class ButtonComponent {
  @Input({ required: true }) text: string = '';

  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled: boolean = false;
  @Input() bgColor?: string = 'var(--primary)';
  @Input() textColor: string = 'var(--font-primary)';
  @Input() width: string = 'auto';
  @Input() height: string = 'auto';
  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
}
