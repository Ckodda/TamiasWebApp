import { Component, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import {
     IonHeader,
     IonToolbar,
     IonTitle,
     IonContent,
     IonButton,
     IonCard,
     IonCardContent,
     IonSpinner,
     IonButtons,
     IonIcon,
     IonText,
     IonCardHeader,
     IonCardTitle,
     IonGrid,
     IonRow,
     IonCol,
     IonInput,
     IonSelect,
     IonSelectOption,

} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { addOutline, refreshOutline, searchOutline } from "ionicons/icons";

import { TableComponent, TableColumn, ActionButton } from "../components/table/table.component";
import { GetLoansRequest } from "../../sdk/Requests/Loan/GetLoansRequest";
import { GetLoansAction } from "../../sdk/Actions/Loan/GetLoansAction";
import { LoanResponse } from "../../sdk/Responses/Loan/LoanResponse";
import { ToastService } from "../components/toast/toast.service";

import { FormsModule } from "@angular/forms";


@Component({
     selector: 'app-loans',
     templateUrl: './loans.component.html',
     styleUrls: ['./loans.component.scss'],
     standalone: true,
     imports: [
          CommonModule,
          RouterLink,
          FormsModule,
          IonHeader,
          IonToolbar,
          IonTitle,
          IonContent,
          IonButton,
          IonSpinner,
          IonCard,
          IonCardContent,
          IonButtons,
          IonIcon,
          TableComponent,
          IonText,
          IonCardHeader,
          IonCardTitle,
          IonGrid,
          IonRow,
          IonCol,
          IonInput,
          IonSelect,
          IonSelectOption,
     ]
})
export class LoansComponent implements OnInit {
     public loans = signal<LoanResponse[]>([]);
     public isLoading = signal<boolean>(true);
     public validationErrors = signal<any>(null);
     public totalCount = signal<number>(0);

     public filters: GetLoansRequest = {
          Page: 1,
          PageSize: 10,
          LoanStatus: undefined,
          IsActive: true
     };

     public loanColumns: TableColumn[] = [];
     public actionButtons: ActionButton[] = [];

     constructor(
          private getLoansAction: GetLoansAction,
          private toastService: ToastService,
          private router: Router
     ) {
          addIcons({ addOutline, searchOutline, refreshOutline });
     }

     ngOnInit(): void {
          this.loanColumns = [
               { key: 'Id', label: 'ID', size: '12', sizeMd: '1'},
               { key: 'LenderName', label: 'Prestamista', size: '12', sizeMd: '2', },
               { key: 'PrincipalAmount', label: 'Monto Principal', size: '12', sizeMd: '2'},
               { key: 'InterestAmount', label: 'Interés', size: '12', sizeMd: '1' },
               { key: 'TotalToRepay', label: 'Total a Pagar', size: '12', sizeMd: '1'},
               { key: 'RepaymentDueDate', label: 'Fecha de Vencimiento', size: '12', sizeMd: '2'},
               { key: 'LoanStatus', label: 'Estado', size: '12', sizeMd: '1' },
               { key: 'IsActive', label: 'Activo', size: '6', sizeMd: '1', type: 'badge' },
               { key: 'actions', label: 'Acciones', size: '6', sizeMd: '1', type: 'actions' },
           
          ];

          this.actionButtons = [
               { icon: 'pencil-outline', color: 'primary', action: 'edit', label: '' },
               { icon: 'trash-outline', color: 'danger', action: 'delete', label: '' }
          ];

          this.LoadData();
     }

     LoadData() {
          this.isLoading.set(true);
          this.validationErrors.set(null);
          this.getLoansAction.Execute(this.filters).subscribe({
               next: (res) => {
                    if (res.Code === 200 && res.Content?.Items) {
                         this.loans.set(res.Content.Items);
                         this.totalCount.set(res.Content.TotalCount);
                    }
                    this.isLoading.set(false);
               },
               error: (err) => {
                     const apiError = err.error;
                     if (apiError && apiError.Code === 422 && apiError.Content) {
                       this.validationErrors.set(apiError.Content);
                     } else {
                         this.toastService.showError(apiError?.Message || 'Error al cargar los préstamos.');
                     }
                     this.isLoading.set(false);
               }
          });
     }

     ResetFilters() {
          this.filters = {
               Page: 1,
               PageSize: 10,
          };
          this.LoadData();
     }

     onTableAction(event: { action: string; item: LoanResponse }) {
          if (event.action === 'edit') {
               this.router.navigate(['/loans/edit', event.item.Id]);
          } else if (event.action === 'delete') {
               this.toastService.showSuccess(`Eliminar préstamo con ID: ${event.item.Id}`);
          }   
     }

     onTablePageChange(pageNumber: number) {
          this.filters.Page = pageNumber;
          this.LoadData();
     }

     onTablePageSizeChange(pageSize: number) {
          this.filters.PageSize = pageSize;
          this.filters.Page = 1;
          this.LoadData();
     }

     // A diferencia de CostCenters, la creación es por navegación
     navigateToCreate() {
          this.router.navigate(['/loans/create']);
     }
  
}