import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContainerPageLayout } from '../../../layouts/container-page-layout/container-page-layout';
import { MatCardModule } from '@angular/material/card';
import { ButtonComponent } from '../button/button';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-entity-form-component',
  imports: [ContainerPageLayout, MatCardModule, ButtonComponent, ReactiveFormsModule, MatIcon],
  templateUrl: './entity-form-component.html',
  styleUrl: './entity-form-component.scss',
})
export class EntityFormComponent {
  @Output() submitEvent = new EventEmitter<void>();
  @Output() cancelEvent = new EventEmitter<void>();
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) titleCard: string = '';
  @Input({ required: true }) subtitle: string = '';
  @Input({ required: true }) icon: string = '';
}
