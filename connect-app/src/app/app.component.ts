import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { StorageService } from './services/storage.service';
import { PlatformService } from './services/platform.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading = false;
  error: string | null = null;
  isDarkMode = false;

  constructor(
    private storage: StorageService,
    private platform: PlatformService
  ) {}

  ngOnInit() {
    // Initialize theme
    const savedTheme = this.storage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    } else {
      // Check system preference
      const prefersDark = this.platform.matchMedia?.matches;
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

  retryOperation() {
    this.error = null;
    // Implement retry logic here
    // This could be triggering a reload or re-fetching data
    this.platform.window?.location.reload();
  }
}
