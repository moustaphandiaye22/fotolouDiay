import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { Product, PaymentProvider } from '../../models';

@Component({
  selector: 'app-payment-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatRadioModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './payment-dialog.html',
  styleUrl: './payment-dialog.css'
})
export class PaymentDialog {
  selectedProvider: PaymentProvider | null = null;
  paymentProviders = [
    { value: PaymentProvider.WAVE, label: 'Wave', icon: '💰' },
    { value: PaymentProvider.ORANGE_MONEY, label: 'Orange Money', icon: '📱' },
    { value: PaymentProvider.PAYTECH, label: 'PayTech', icon: '💳' },
    { value: PaymentProvider.CARTE, label: 'Carte bancaire', icon: '💳' }
  ];

  constructor(
    public dialogRef: MatDialogRef<PaymentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { produit: Product }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedProvider) {
      this.dialogRef.close(this.selectedProvider);
    }
  }

  formatPrix(prix: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(prix);
  }
}
