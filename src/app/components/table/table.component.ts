import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonBadge,
  IonText,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonCard
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';

export interface TableColumn {
  key: string;
  label: string;
  size: string;
  sizeMd: string;
  type?: 'text' | 'badge' | 'actions';
  cssClass?: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonBadge,
    IonText,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonCard
  ]
})
export class TableComponent {
  @Input() items: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number = 0;
  @Input() pageNumber: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalLabel: string = 'registros';

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  constructor() {
    addIcons({ pencilOutline, trashOutline, chevronBackOutline, chevronForwardOutline });
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onPrevPage() {
    if (this.pageNumber > 1) this.pageChange.emit(this.pageNumber - 1);
  }

  onNextPage() {
    if (this.pageNumber < this.totalPages) this.pageChange.emit(this.pageNumber + 1);
  }

  onSizeChange() {
    this.pageSizeChange.emit(this.pageSize);
  }
}