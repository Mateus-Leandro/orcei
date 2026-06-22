import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Table } from '../../../../shared/components/table/table';
import { IUserView } from '../../../../core/models/user/user.model';
import { DateFormatPipe } from '../../../../shared/pipes/date-pipe/date.pipe';

@Component({
  selector: 'app-user-table',
  imports: [Table],
  templateUrl: './user-table.html',
  styleUrl: './user-table.scss',
})
export class UserTable implements OnChanges {
  @Input({ required: true }) users: IUserView[] = [];
  @Input() totalItems: number = 0;
  @Input() pageIndex: number = 0;

  @Output() clickRow = new EventEmitter<{ id?: string }>();

  @Output()
  pageChange = new EventEmitter<{
    page: number;
    limit: number;
  }>();

  displayedColumns: string[] = ['Nome', 'Data Criação', 'Data Alteração'];

  usersDataSource: Partial<Record<string, unknown>>[] = [];

  constructor(private dateFormatPipe: DateFormatPipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users']) {
      this.mapUsers();
    }
  }

  private mapUsers(): void {
    this.usersDataSource = this.users.map((user) => ({
      id: user.id,
      Nome: user.name,
      'Data Criação': this.dateFormatPipe.transform(user.createdAt),
      'Data Alteração': this.dateFormatPipe.transform(user.updatedAt),
    }));
  }
}
