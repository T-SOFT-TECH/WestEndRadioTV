// scroll-animation.directive.ts
import {Directive, ElementRef, OnInit, OnDestroy, PLATFORM_ID, Inject, Input} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[scrollAnimation]',
  standalone: true
})
export class ScrollAnimationDirective implements OnInit, OnDestroy {
  private observer: IntersectionObserver | null = null;

  @Input() animationDelay = 3000; // Delay in milliseconds


  constructor(
    private element: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fadeIn');
            }, this.animationDelay);
            this.observer?.unobserve(entry.target);
          }
        });
      });
    }
  }

  ngOnInit() {
    if (this.observer) {
      this.observer.observe(this.element.nativeElement);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
