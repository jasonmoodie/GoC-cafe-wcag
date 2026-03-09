import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

interface CartItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  cartItems: CartItem[] = [
    { name: 'Maple Latte', size: 'Medium', quantity: 2, price: 5.75 },
    { name: 'Butter Tart', size: 'Regular', quantity: 1, price: 3.50 },
    { name: 'Northern Cold Brew', size: 'Large', quantity: 1, price: 5.75 }
  ];

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  get tax(): number {
    return this.subtotal * 0.13;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  removeItem(index: number): void {
    this.cartItems.splice(index, 1);
    // A11Y-ISSUE #21: 4.1.3 Status Messages — No aria-live announcement when item is removed
  }

  updateQuantity(index: number, newQty: number): void {
    if (newQty > 0) {
      this.cartItems[index].quantity = newQty;
    }
    // A11Y-ISSUE #21: 4.1.3 Status Messages — No aria-live announcement when quantity changes
  }
}
