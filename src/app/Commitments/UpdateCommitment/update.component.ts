import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastService } from "src/app/components/toast/toast.service";
import { UpdateCommitmentAction } from "src/sdk/Actions/Commitment/UpdateCommitmentAction";
import { GetCostCentersAction } from "src/sdk/Actions/CostCenter/GetCostCentersAction";
import { GetCurrenciesAction } from "src/sdk/Actions/Currency/GetCurrenciesAction";

@Component({
     selector: "app-update-commitment",
     templateUrl: "./update.component.html",
     styleUrls: ["./update.component.scss"],
     standalone: true
})

export class UpdateComponent implements OnInit 
{
     public form!: FormGroup;
     public isLoading = signal<boolean>(false);
     public validationErrors = signal<any>(null); // Keep this for general form validation
     public isSubmitted = signal<boolean>(false);

     constructor(
          private fb: FormBuilder,
          private router: Router,
          private updateCommitmentAction: UpdateCommitmentAction,
          private toastService: ToastService,
          private getCurrenciesAction: GetCurrenciesAction,
          private getCostCentersAction: GetCostCentersAction
     ) 
    { }

     ngOnInit(): void {
          this.initForm();
     }
     private initForm() {
          this.form = this.fb.group({
               EventName: ['', Validators.required],
               TargetAmount: [0, [Validators.required, Validators.min(0)]],
               StartDate: ['', Validators.required],
               CostCenterId: [null, Validators.required],
               CurrencyId: [null, Validators.required],
               EventStatus: ['', Validators.required],
          });
     }
}