import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from '@angular/common';
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
import { ToastService } from "../components/toast/toast.service";
import { addIcons } from 'ionicons';
import { searchOutline, refreshOutline, filterOutline, addOutline } from 'ionicons/icons';
import { GetUsersAction } from "src/sdk/Actions/User/GetUsersAction";
import { GetUsersRequest } from "src/sdk/Requests/User/GetUsersRequest";
import { UserResponse } from "src/sdk/Responses/Auth";
import { CreateComponent } from './CreateUser/create.component';
import { UpdateComponent } from './UpdateUser/update.component';
import { TableComponent, TableColumn } from '../components/table/table.component';
import { FormsModule } from "@angular/forms";

@Component({
     selector: 'app-users',
     templateUrl: './users.component.html',
     styleUrls: ['./users.component.scss'],
     standalone: true,
     imports: [
          CommonModule,
          // FormsModule se mantiene para los filtros
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
          IonSpinner,
          TableComponent, // Importamos el componente de tabla genérico
          UpdateComponent
     ]
})
export class UsersComponent implements OnInit
{
     public users = signal<UserResponse[]>([]);
     public userColumns: TableColumn[] = [];
     public totalCount = signal<number>(0);
     public isLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null);

     public filters: GetUsersRequest = {
          Id: undefined,
          FullName: '',
          Email: '',
          IsActive: null,
          PageNumber: 1,
          PageSize: 10
     };

     constructor(
          private getUsersAction: GetUsersAction,
          private modalController: ModalController,
          private toastService: ToastService
     ) {
          addIcons({ searchOutline, refreshOutline, filterOutline, addOutline });
     }

     ngOnInit() {
          this.userColumns = [
               { key: 'Id', label: 'Id', size: '12', sizeMd: '1' },
               { key: 'FullName', label: 'Nombre Completo', size: '12', sizeMd: '4' },
               { key: 'Email', label: 'Correo Electrónico', size: '12', sizeMd: '4' },
               { key: 'IsActive', label: 'Estado', size: '6', sizeMd: '1', type: 'badge', cssClass: 'ion-text-center' },
               { key: 'actions', label: 'Acciones', size: '6', sizeMd: '2', type: 'actions', cssClass: 'ion-text-center' }
          ];
          this.LoadData();
     }

     LoadData() {
          this.isLoading.set(true);
          this.validationErrors.set(null);

          this.getUsersAction.Execute(this.filters).subscribe({
               next: (response) => {
                    if (response.Code === 200 && response.Content) {
                         this.users.set(response.Content.Items);
                         this.totalCount.set(response.Content.TotalCount);
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
          this.filters = { Id: undefined, FullName: '', Email: '', IsActive: null, PageNumber: 1, PageSize: 10 };
          this.LoadData();
     }

     onTablePageSizeChange(pageSize: number) {
          this.filters.PageSize = pageSize;
          this.filters.PageNumber = 1;
          this.LoadData();
     }

     onTablePageChange(pageNumber: number) {
          this.filters.PageNumber = pageNumber;
          this.LoadData();
     }

     onTableEdit(item: UserResponse) {
          this.openUpdateModal(item);
     }

     onTableDelete(item: UserResponse) {
          // Implementar lógica de eliminación
     }

     async openCreateModal() {
          const modal = await this.modalController.create({
               component: CreateComponent,
               breakpoints: [0, 0.5, 0.8],
               initialBreakpoint: 0.8
          });
          await modal.present();
          const { role } = await modal.onWillDismiss();
          if (role === 'created') {
               this.toastService.showSuccess('Se registró correctamente');
               this.LoadData();
          }
     }

     async openUpdateModal(user: UserResponse) {
          const modal = await this.modalController.create({
               component: UpdateComponent,
               componentProps: { user },
               breakpoints: [0, 0.5, 0.8],
               initialBreakpoint: 0.8
          });
          await modal.present();
          const { role } = await modal.onWillDismiss();
          if (role === 'updated') {
               this.toastService.showSuccess('Se actualizó correctamente');
               this.LoadData();
          }
     }
}