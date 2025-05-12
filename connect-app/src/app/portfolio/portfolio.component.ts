import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  activeFilter = 'all';

  filterProjects(category: string) {
    this.activeFilter = category;
    const items = document.querySelectorAll('.portfolio-item');
    
    items.forEach(item => {
      if (category === 'all' || item.getAttribute('data-category') === category) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    // Update active button
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
} 