import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonPopover, IonSearchbar, IonList, IonItem, IonLabel, IonSpinner, IonContent, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';

@Component({
  selector: 'app-searchable-select',
  templateUrl: './searchable-select.component.html',
  styleUrls: ['./searchable-select.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonButton, IonIcon, IonPopover, IonSearchbar, 
    IonList, IonItem, IonLabel, IonSpinner, IonContent, IonText
  ],
})
export class SearchableSelectComponent {
  @Input() placeholder: string = '';
  @Input() triggerId: string = 'search-select-' + Math.random().toString(36).substring(2, 9);

  private _items = signal<any[]>([]);
  @Input() set items(value: any[] | null) {
    this._items.set(value || []);
  }
  @Input() loading: boolean = false;
  @Input() itemLabelFn: (item: any) => string = (item) => item?.toString();
  @Input() itemNoteFn: (item: any) => string = () => '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() itemSelected = new EventEmitter<any>();

  public searchTerm = signal<string>('');
  public isPopoverOpen = signal<boolean>(false);

  constructor() {
    addIcons({ searchOutline });
  }

  public filteredItems = computed(() => {
    const items = this._items();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return items;
    return items.filter(item => 
      this.itemLabelFn(item).toLowerCase().includes(term) || 
      this.itemNoteFn(item).toLowerCase().includes(term)
    );
  });

  onSelect(item: any) {
    this.itemSelected.emit(item);
    this.isPopoverOpen.set(false);
    this.searchTerm.set('');
  }

  onSearch(event: any) {
    const term = event.detail.value || '';
    this.searchTerm.set(term);
    this.searchChange.emit(term);
  }
}
