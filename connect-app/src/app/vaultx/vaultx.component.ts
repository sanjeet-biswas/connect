import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { VaultxService } from './vaultx.service';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { VaultItemType } from './vaultx.types';

@Component({
  selector: 'app-vaultx',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    HttpClientModule
  ],
  templateUrl: './vaultx.component.html',
  styleUrls: ['./vaultx.component.css']
})
export class VaultxComponent implements OnInit {
  items: VaultItemType[] = [];
  filteredItems: VaultItemType[] = [];
  searchQuery: string = '';
  isGridView: boolean = true;
  isLoading: boolean = false;
  error: string | null = null;
  showModal: boolean = false;
  showViewModal: boolean = false;
  selectedItem: VaultItemType | null = null;
  selectedColor: string = '#ffffff';
  isDarkMode = false;
  formData: {
    title: string;
    description: string;
    type: 'document' | 'link' | 'credential';
    metadata: {
      username?: string;
      password?: string;
      url?: string;
    };
  } = {
    title: '',
    description: '',
    type: 'document',
    metadata: {
      username: '',
      password: '',
      url: ''
    }
  };

  constructor(private vaultxService: VaultxService) {
    // Check if we're in a browser environment
    if (typeof document !== 'undefined') {
      this.isDarkMode = true;
      this.applyTheme();
      localStorage.setItem('theme', 'dark');
    }
  }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.isLoading = true;
    this.error = null;
    this.vaultxService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load items:', error);
        this.error = 'Failed to load items. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredItems = this.items;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredItems = this.items.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descriptionMatch = item.description.toLowerCase().includes(query);
      const metadataMatch = item.metadata && (
        (item.metadata.username && item.metadata.username.toLowerCase().includes(query)) ||
        (item.metadata.url && item.metadata.url.toLowerCase().includes(query))
      );
      
      return titleMatch || descriptionMatch || metadataMatch;
    });
  }

  toggleView(): void {
    this.isGridView = !this.isGridView;
  }

  openQuickAction(type: 'document' | 'link' | 'credential'): void {
    this.selectedItem = null;
    this.selectedColor = '#ffffff';
    this.formData = {
      title: '',
      description: '',
      type: type,
      metadata: {
        username: '',
        password: '',
        url: ''
      }
    };
    this.showModal = true;
  }

  openModal(item?: VaultItemType): void {
    if (item) {
      this.selectedItem = { ...item };
      this.selectedColor = item.color;
      this.formData = {
        title: item.title,
        description: item.description,
        type: item.type,
        metadata: {
          username: item.metadata?.username || '',
          password: item.metadata?.password || '',
          url: item.metadata?.url || ''
        }
      };
    } else {
      this.selectedItem = null;
      this.selectedColor = '#ffffff';
      this.formData = {
        title: '',
        description: '',
        type: 'document',
        metadata: {
          username: '',
          password: '',
          url: ''
        }
      };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedItem = null;
    this.selectedColor = '#ffffff';
    this.formData = {
      title: '',
      description: '',
      type: 'document',
      metadata: {
        username: '',
        password: '',
        url: ''
      }
    };
    this.error = null;
  }

  saveItem(formData: any): void {
    if (!formData.title || !formData.type) {
      this.error = 'Title and type are required';
      return;
    }

    const item: Partial<VaultItemType> = {
      title: formData.title,
      description: formData.description || '',
      type: formData.type,
      updatedAt: new Date(),
      metadata: {
        ...(formData.type === 'credential' && {
          username: formData.metadata?.username || '',
          password: formData.metadata?.password || ''
        }),
        ...(formData.type === 'link' && {
          url: formData.metadata?.url || ''
        })
      }
    };

    // Only include ID and createdAt for updates
    if (this.selectedItem) {
      item.id = this.selectedItem.id;
      item.createdAt = this.selectedItem.createdAt;
    }

    console.log('Saving item:', item);

    const operation = this.selectedItem
      ? this.vaultxService.updateItem(item as VaultItemType)
      : this.vaultxService.addItem(item as VaultItemType);

    operation.subscribe({
      next: (response) => {
        console.log('Operation successful:', response);
        this.loadItems();
        this.closeModal();
        this.error = null;
      },
      error: (error) => {
        console.error('Operation failed:', error);
        this.error = this.selectedItem
          ? 'Failed to update item. Please try again.'
          : 'Failed to add item. Please try again.';
      }
    });
  }

  deleteItem(item: VaultItemType): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.vaultxService.deleteItem(item.id).subscribe({
        next: () => {
          this.loadItems();
        },
        error: (error) => {
          this.error = 'Failed to delete item. Please try again.';
        }
      });
    }
  }

  onDrop(event: CdkDragDrop<VaultItemType[]>): void {
    const items = [...this.filteredItems];
    const movedItem = items[event.previousIndex];
    items.splice(event.previousIndex, 1);
    items.splice(event.currentIndex, 0, movedItem);
    this.filteredItems = items;
    
    this.vaultxService.updateOrder(items.map(item => item.id)).subscribe({
      error: (error) => {
        this.error = 'Failed to update item order. Please try again.';
        this.loadItems(); // Reload original order
      }
    });
  }

  retryOperation(): void {
    this.error = null;
    this.loadItems();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
    }
  }

  viewItem(item: VaultItemType): void {
    this.selectedItem = { ...item };
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedItem = null;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show a temporary success message
      const originalError = this.error;
      this.error = 'Copied to clipboard!';
      setTimeout(() => {
        this.error = originalError;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      this.error = 'Failed to copy to clipboard';
    });
  }
} 