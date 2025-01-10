import {Component, computed, inject, signal} from '@angular/core';
import {AzuracastService} from '../../../services/azuracast.service';
import {Listener} from '../../../model/listeners.model';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {AutoAnimationDirective} from '../../../Directives/auto-Animate.directive';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {
  heroUsers,
  heroClock,
  heroSignal,
  heroChartBar,
  heroMagnifyingGlass,
  heroChevronUp,
  heroChevronDown,
  heroChevronUpDown,
  heroArrowLeft,
  heroArrowRight,
  heroDocumentArrowDown,
  heroFunnel
} from '@ng-icons/heroicons/outline';
import {ListenersMapComponent} from '../../components/listeners-map/listeners-map.component';

interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-listeners',
  imports: [
    FormsModule,
    DatePipe,
    AutoAnimationDirective,
    NgIcon,
  ],
  providers: [
    provideIcons({
      heroUsers,
      heroClock,
      heroSignal,
      heroChartBar,
      heroMagnifyingGlass,
      heroChevronUp,
      heroChevronDown,
      heroChevronUpDown,
      heroArrowLeft,
      heroArrowRight,
      heroDocumentArrowDown,
      heroFunnel
    })
  ],
  templateUrl: './listeners.component.html',
  styleUrl: './listeners.component.scss'
})
export class ListenersComponent {
  private azuracast = inject(AzuracastService);

  protected searchTerm = signal('');
  protected streamFilter = signal('');
  protected listeners = signal<Listener[]>([]);
  protected historySearchTerm = signal('');
  protected historyStreamFilter = signal('');
  protected historicalListeners = signal<Listener[]>([]);
  protected tabs = ['live', 'history'] as const;
  protected activeTab = signal<'live' | 'history'>('live');
  protected isLoading = signal(false);
  protected sortConfig = signal<SortConfig>({
    column: '',
    direction: 'desc'
  });

  // Date Range
  protected dateRange = signal({
    start: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)),
    end: new Date()
  });

  // Pagination
  protected pageSize = signal(10);
  protected currentPage = signal(1);

  // Table Columns
  protected readonly liveColumns: TableColumn[] = [
    { key: 'ip', label: 'IP', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'connected_time', label: 'Time Connected', sortable: true },
    { key: 'mount_name', label: 'Stream', sortable: true },
    { key: 'client', label: 'Client', sortable: true }
  ];

  protected readonly historyColumns: TableColumn[] = [
    { key: 'connected_on', label: 'Date', sortable: true },
    { key: 'ip', label: 'IP', sortable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'connected_time', label: 'Duration', sortable: true },
    { key: 'mount_name', label: 'Stream', sortable: true },
    { key: 'client', label: 'Client', sortable: true }
  ];

  // Stats Computations
  protected liveStats = computed(() => ({
    uniqueListeners: new Set(this.listeners().map(l => l.ip)).size,
    totalHours: (this.listeners()
      .reduce((acc, curr) => acc + curr.connected_time, 0) / 3600).toFixed(2),
    currentListeners: this.listeners().length,
    totalConnections: this.listeners().length,
    peakListeners: Math.max(this.listeners().length, 0)
  }));

  protected historicalStats = computed(() => ({
    uniqueListeners: new Set(this.historicalListeners().map(l => l.ip)).size,
    totalHours: (this.historicalListeners()
      .reduce((acc, curr) => acc + curr.connected_time, 0) / 3600).toFixed(2),
    currentListeners: 0,
    totalConnections: this.historicalListeners().length,
    peakListeners: Math.max(...Array.from({ length: 24 }, (_, i) =>
      this.historicalListeners().filter(l => new Date(l.connected_on * 1000).getHours() === i).length
    ))
  }));

  protected getCurrentStats = computed(() =>
    this.activeTab() === 'live' ? this.liveStats() : this.historicalStats()
  );

  // Filtered Data Computations
  protected filteredListeners = computed(() => {
    let result = this.listeners();

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      result = result.filter(l =>
        l.ip.toLowerCase().includes(term) ||
        l.location.description.toLowerCase().includes(term) ||
        l.device.client.toLowerCase().includes(term)
      );
    }

    if (this.streamFilter()) {
      result = result.filter(l =>
        this.streamFilter() === 'local' ? l.mount_is_local : !l.mount_is_local
      );
    }

    return this.sortListeners(result);
  });

  protected filteredHistoricalListeners = computed(() => {
    let result = this.historicalListeners();

    if (this.historySearchTerm()) {
      const term = this.historySearchTerm().toLowerCase();
      result = result.filter(l =>
        l.ip.toLowerCase().includes(term) ||
        l.location.description.toLowerCase().includes(term) ||
        l.device.client.toLowerCase().includes(term)
      );
    }

    if (this.historyStreamFilter()) {
      result = result.filter(l =>
        this.historyStreamFilter() === 'local' ? l.mount_is_local : !l.mount_is_local
      );
    }

    result = this.sortListeners(result);
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return result.slice(startIndex, startIndex + this.pageSize());
  });

  protected getTotalPages = computed(() => {
    return Math.ceil(this.historicalListeners().length / this.pageSize());
  });

  constructor() {
    this.loadListeners();
    setInterval(() => {
      if (this.activeTab() === 'live') {
        this.loadListeners();
      }
    }, 30000);
  }

  // Sorting Methods
  protected sortData(column: string) {
    this.sortConfig.update(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  protected getSortIcon(column: string): 'none' | 'asc' | 'desc' {
    if (this.sortConfig().column !== column) return 'none';
    return this.sortConfig().direction;
  }

  private sortListeners(listeners: Listener[]): Listener[] {
    const { column, direction } = this.sortConfig();
    if (!column) return listeners;

    return [...listeners].sort((a, b) => {
      let valueA = this.getSortValue(a, column);
      let valueB = this.getSortValue(b, column);

      const sortOrder = direction === 'asc' ? 1 : -1;

      if (valueA < valueB) return -1 * sortOrder;
      if (valueA > valueB) return 1 * sortOrder;
      return 0;
    });
  }

  private getSortValue(listener: Listener, column: string): any {
    switch (column) {
      case 'ip': return listener.ip;
      case 'location': return listener.location.description;
      case 'connected_time': return listener.connected_time;
      case 'mount_name': return listener.mount_name;
      case 'client': return listener.device.client;
      case 'connected_on': return listener.connected_on;
      default: return '';
    }
  }

  // Data Loading Methods
  private loadListeners() {
    this.azuracast.getListeners().subscribe({
      next: (data) => this.listeners.set(data),
      error: (error) => console.error('Error loading listeners:', error)
    });
  }

  protected loadHistoricalData() {
    this.isLoading.set(true);
    const { start, end } = this.dateRange();

    this.azuracast.getHistoricalListeners(start, end).subscribe({
      next: (data) => {
        this.historicalListeners.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading historical data:', error);
        this.isLoading.set(false);
      }
    });
  }

  // Utility Methods
  protected formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  protected switchTab(tab: typeof this.tabs[number]) {
    this.activeTab.set(tab as 'live' | 'history');
    if (tab === 'live') {
      this.loadListeners();
    } else {
      this.loadHistoricalData();
    }
  }

  protected updateDateRange(type: 'start' | 'end', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dateRange.update(current => ({
      ...current,
      [type]: new Date(value)
    }));
  }

  protected readonly Math = Math;

  protected getTopLocation(): string {
    const listeners = this.activeTab() === 'live' ?
      this.filteredListeners() :
      this.filteredHistoricalListeners();

    const locationCounts = listeners.reduce((acc, listener) => {
      const loc = listener.location.description;
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocation = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return topLocation ?
      `${topLocation[0]} (${topLocation[1]} listeners)` :
      'No data available';
  }

  protected getActiveRegionsCount(): string {
    const listeners = this.activeTab() === 'live' ?
      this.filteredListeners() :
      this.filteredHistoricalListeners();

    const uniqueRegions = new Set(
      listeners.map(l => l.location.description.split(',').pop()?.trim())
    );

    return `${uniqueRegions.size} regions`;
  }

}
