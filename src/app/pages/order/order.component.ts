import { Component } from '@angular/core';

@Component({
  selector: 'app-order',
  standalone: true,
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  submitted = false;
  hasErrors = false;

  submitOrder(): void {
    this.submitted = true;
    this.hasErrors = true;
  }
}
