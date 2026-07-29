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
  IonCard,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, eyeOutline, pencilOutline, trashOutline } from 'ionicons/icons';

export interface TableColumn {
  key: string;
  label: string;
  size: string;
  sizeMd: string;
  type?: 'text' | 'badge' | 'actions';
  cssClass?: string;
  valueFormatter?: (item: any, key: string) => string;
  classFormatter?: (item: any, key: string) => string;
}

export interface ActionButton {
  icon: string;
  color: string;
  action: string;
  label?: string;
  fill?: 'clear' | 'outline' | 'solid' | 'default';
  show?: (item: any) => boolean;
}

@Component({
  selector: 'app-table',
  styleUrls: ['./table.component.scss'],
  templateUrl: './table.component.html',
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
    IonCard,
    IonList,
    IonItem,
    IonListHeader,
    IonLabel
  ]
})
export class TableComponent {
  @Input() items: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actionButtons: ActionButton[] = [];
  @Input() isLoading: boolean = false;
  @Input() totalCount: number = 0;
  @Input() pageNumber: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalLabel: string = 'registros';

  @Output() action = new EventEmitter<{ action: string, item: any }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, eyeOutline, pencilOutline, trashOutline });
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

  handleAction(action: string, item: any, event: Event) {
    event.stopPropagation();
    this.action.emit({ action, item });
  }

  shouldShowButton(button: ActionButton, item: any): boolean {
    if (button.show) {
      return button.show(item);
    }
    return true;
  }
}