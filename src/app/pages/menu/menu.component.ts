import { Component } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  selectedCategory = 'all';

  menuItems: MenuItem[] = [
    { name: 'Maple Latte', description: 'Espresso with steamed milk and pure maple syrup', price: 5.75, category: 'coffee', image: 'assets/images/maple-latte.svg' },
    { name: 'Northern Cold Brew', description: 'Slow-steeped 18 hours with Northern Ontario beans', price: 4.95, category: 'coffee', image: 'assets/images/cold-brew.svg' },
    { name: 'Canadiano', description: 'Classic hot water over a double shot of espresso', price: 3.50, category: 'coffee', image: 'assets/images/canadiano.svg' },
    { name: 'Double Double', description: 'Brewed coffee with double cream and double sugar', price: 2.75, category: 'coffee', image: 'assets/images/double-double.svg' },
    { name: 'Chai Tundra', description: 'Spiced chai with locally sourced honey', price: 4.50, category: 'tea', image: 'assets/images/chai.svg' },
    { name: 'Green Tea Glacier', description: 'Japanese green tea served over ice', price: 3.95, category: 'tea', image: 'assets/images/green-tea.svg' },
    { name: 'Butter Tart', description: 'Classic Canadian butter tart, made fresh daily', price: 3.50, category: 'pastry', image: 'assets/images/butter-tart.svg' },
    { name: 'Nanaimo Bar', description: 'Three-layer no-bake bar from British Columbia', price: 4.25, category: 'pastry', image: 'assets/images/nanaimo.svg' },
    { name: 'Beaver Tail', description: 'Stretched fried dough with cinnamon sugar', price: 5.00, category: 'pastry', image: 'assets/images/beaver-tail.svg' },
    { name: 'Poutine Bowl', description: 'Fries, cheese curds, and house gravy', price: 8.95, category: 'food', image: 'assets/images/poutine.svg' },
    { name: 'Smoked Salmon Bagel', description: 'BC salmon, cream cheese, and capers on a fresh bagel', price: 9.50, category: 'food', image: 'assets/images/salmon-bagel.svg' },
    { name: 'Tourtière Slice', description: 'Québécois-style meat pie served warm', price: 7.25, category: 'food', image: 'assets/images/tourtiere.svg' }
  ];

  get filteredItems(): MenuItem[] {
    if (this.selectedCategory === 'all') {
      return this.menuItems;
    }
    return this.menuItems.filter(item => item.category === this.selectedCategory);
  }

  filterCategory(category: string): void {
    this.selectedCategory = category;
  }
}
