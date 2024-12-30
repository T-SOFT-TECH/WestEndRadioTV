import {computed, Injectable, signal} from '@angular/core';

interface AppState {
  isHeaderVisible: boolean;
  currentShow: {
    title: string;
    host: string;
    startTime: string;
    endTime: string;
    imageUrl: string;
  } | null;
  isLive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  private state = signal<AppState>({
    isHeaderVisible: true,
    currentShow: null,
    isLive: false
  });

  readonly currentShow = computed(() => this.state().currentShow);
  readonly isLive = computed(() => this.state().isLive);
  readonly isHeaderVisible = computed(() => this.state().isHeaderVisible);

  updateCurrentShow(show: AppState['currentShow']): void {
    this.state.update(state => ({
      ...state,
      currentShow: show
    }));
  }

  setLiveStatus(isLive: boolean): void {
    this.state.update(state => ({
      ...state,
      isLive
    }));
  }

  toggleHeader(visible: boolean): void {
    this.state.update(state => ({
      ...state,
      isHeaderVisible: visible
    }));
  }

}
