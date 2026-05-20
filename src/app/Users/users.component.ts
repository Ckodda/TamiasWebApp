import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonBadge,
  IonText,
  IonCard,
  ModalController,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, pencilOutline, trashOutline, addOutline } from 'ionicons/icons';
import { GetUsersAction } from "src/sdk/Actions/User/GetUsersAction";
import { GetUsersRequest } from "src/sdk/Requests/User/GetUsersRequest";
import { UserResponse } from "src/sdk/Responses/Auth";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonBadge,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonSpinner
  ]
})
export class UsersComponent implements OnInit
{
  public users = signal<UserResponse[]>([]);
  public isLoading = signal<boolean>(false);
  public validationErrors = signal<any>(null);

  public filters: GetUsersRequest = {
    Id: undefined,
    FullName: '',
    Email: '',
    IsActive: null as any,
    PageNumber: 1,
    PageSize: 10
  };

  constructor(
    private getUsersAction: GetUsersAction,
    private modalController: ModalController
  ) {
    addIcons({ searchOutline, refreshOutline, filterOutline, pencilOutline, trashOutline, addOutline });
  }

  ngOnInit() {
    this.LoadData();
  }

  LoadData() {
    this.isLoading.set(true);
    this.validationErrors.set(null);

    this.getUsersAction.Execute(this.filters).subscribe({
      next: (response) => {
        if (response.Code === 200 && response.Content) {
          this.users.set(response.Content.Items);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        const apiError = err.error;
        if (apiError && apiError.Code === 422 && apiError.Content) {
          this.validationErrors.set(apiError.Content);
        }
        this.isLoading.set(false);
      }
    });
  }

  ResetFilters() {
    this.filters = { Id: undefined, FullName: '', Email: '', IsActive: null as any, PageNumber: 1, PageSize: 10 };
    this.LoadData();
  }
}