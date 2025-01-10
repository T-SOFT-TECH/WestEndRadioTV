import {Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Listener} from '../../../model/listeners.model';
import L from 'leaflet';

@Component({
  selector: 'app-listeners-map',
  imports: [],
  templateUrl: './listeners-map.component.html',
  styleUrl: './listeners-map.component.scss'
})
export class ListenersMapComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer') private mapContainer!: ElementRef;
  @Input() listeners: Listener[] = [];
  @Input() mapType: 'live' | 'history' = 'live';

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;
  private readonly DARK_STYLE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  ngOnInit() {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['listeners'] || changes['mapType']) && this.map && this.markerLayer) {
      this.updateMarkers();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (!this.mapContainer) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: true,
    });

    L.tileLayer(this.DARK_STYLE, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);
    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (!this.markerLayer || !this.map) return;
    this.markerLayer.clearLayers();

    const locationGroups = this.groupListenersByLocation();

    Object.values(locationGroups).forEach(group => {
      if (!group.location.lat || !group.location.lon) return;

      const marker = L.marker(
        [group.location.lat, group.location.lon],
        {
          icon: L.divIcon({
            className: 'custom-div-icon',
            html: this.getMarkerHtml(group.count, this.mapType),
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })
        }
      );

      const popupContent = this.getPopupContent(group);
      marker.bindPopup(popupContent, {
        className: 'custom-popup'
      });

      this.markerLayer?.addLayer(marker);
    });
  }

  private getMarkerHtml(count: number, type: "live" | "history"): string {
    const pulseColor = type === 'live' ? 'primary' : 'secondary';
    return `
      <div class="relative">
        <div class="absolute -inset-2 bg-${pulseColor}-500/20 rounded-full ${type === 'live' ? 'animate-pulse' : ''}"></div>
        <div class="bg-${pulseColor}-500 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
          ${count}
        </div>
      </div>
    `;
  }

  private getPopupContent(group: { location: any, count: number, listeners: Listener[] }): string {
    const timestamps = this.mapType === 'history'
      ? `<div>First seen: ${new Date(group.listeners[0].connected_on * 1000).toLocaleString()}</div>`
      : '';

    return `
      <div class="p-3 min-w-[200px]">
        <div class="font-bold text-lg mb-2">${group.location.description}</div>
        <div class="text-sm space-y-1">
          <div>Listeners: ${group.count}</div>
          <div>Streams: ${Array.from(new Set(group.listeners.map(l => l.mount_name))).join(', ')}</div>
          ${timestamps}
        </div>
      </div>
    `;
  }

  private groupListenersByLocation(): { [key: string]: { location: any, count: number, listeners: Listener[] } } {
    return this.listeners.reduce((acc, listener) => {
      const key = `${listener.location.lat},${listener.location.lon}`;
      if (!acc[key]) {
        acc[key] = {
          location: listener.location,
          count: 0,
          listeners: []
        };
      }
      acc[key].count++;
      acc[key].listeners.push(listener);
      return acc;
    }, {} as { [key: string]: { location: any, count: number, listeners: Listener[] } });
  }
}
