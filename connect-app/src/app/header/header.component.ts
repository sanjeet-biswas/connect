import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { PlatformService } from '../services/platform.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  isMobileMenuOpen = false;
  isScrolled = false;

  constructor(
    private storage: StorageService,
    private platform: PlatformService
  ) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 0;
  }

  ngOnInit() {
    // Check for saved theme preference
    const savedTheme = this.storage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    } else {
      // Check system preference
      const prefersDark = this.platform.window?.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode = prefersDark ?? false;
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.storage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    this.platform.document?.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
