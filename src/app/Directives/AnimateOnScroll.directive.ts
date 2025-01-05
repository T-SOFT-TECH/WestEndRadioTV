import { Directive, ElementRef, Input, Renderer2, OnInit, OnDestroy, effect, signal, Output, EventEmitter } from '@angular/core';

export interface AnimationConfig {
  threshold?: number;
  delay?: number;
  duration?: number;
  rootMargin?: string;
  once?: boolean;
}

@Directive({
  standalone: true,
  selector: '[appAnimateOnScroll]'
})
export class AnimateOnScroll implements OnInit, OnDestroy {
  @Input('appAnimateOnScroll') animationClasses: string = 'fade-in';
  @Input() config: AnimationConfig = {};
  @Output() visibilityChange = new EventEmitter<boolean>();

  private observer: IntersectionObserver | null = null;
  private readonly visibilitySignal = signal(false);
  private animations: Animation[] = [];
  private initialClasses: string[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2) {
    const defaultConfig: AnimationConfig = {
      threshold: 0.1,
      delay: 0,
      duration: 500,
      rootMargin: '0px',
      once: false
    };

    this.config = { ...defaultConfig, ...this.config };

    if (typeof IntersectionObserver !== 'undefined') {
      const throttledCallback = this.throttle((entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          const isIntersecting = entry.isIntersecting;
          this.visibilitySignal.set(isIntersecting);
          this.visibilityChange.emit(isIntersecting);

          if (isIntersecting && this.config.once) {
            this.observer?.unobserve(entry.target);
          }
        });
      }, 100);

      this.observer = new IntersectionObserver(throttledCallback, {
        root: null,
        rootMargin: this.config.rootMargin,
        threshold: this.config.threshold
      });

      effect(() => {
        if (this.visibilitySignal()) {
          this.startAnimation();
        } else {
          this.resetAnimation();
        }
      });
    }
  }

  ngOnInit() {
    if (this.observer) {
      this.storeInitialClasses();
      this.setupAnimations();
      this.observer.observe(this.el.nativeElement);
    }
  }

  private storeInitialClasses() {
    this.initialClasses = Array.from(this.el.nativeElement.classList);
  }

  private setupAnimations() {
    const classes = this.animationClasses.split(' ');
    classes.forEach(className => {
      const keyframes = this.getKeyframesForAnimation(className);
      if (keyframes) {
        const animation = new Animation(
          new KeyframeEffect(
            this.el.nativeElement,
            keyframes,
            {
              duration: this.config.duration,
              delay: this.config.delay,
              fill: 'both',
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
          )
        );
        this.animations.push(animation);
      }
    });
  }

  private getKeyframesForAnimation(className: string): Keyframe[] | null {
    const animations: Record<string, Keyframe[]> = {
      'fade-in': [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      'slide-up': [
        { transform: 'translateY(50px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      'slide-down': [
        { transform: 'translateY(-50px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ],
      'slide-left': [
        { transform: 'translateX(-50px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      'slide-right': [
        { transform: 'translateX(50px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 }
      ],
      'scale-up': [
        { transform: 'scale(0.8)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      'rotate-in': [
        { transform: 'rotate(-180deg) scale(0)', opacity: 0 },
        { transform: 'rotate(0) scale(1)', opacity: 1 }
      ]
    };
    return animations[className] || null;
  }

  private startAnimation() {
    this.animations.forEach(animation => {
      animation.play();
    });
  }

  private resetAnimation() {
    this.animations.forEach(animation => {
      animation.cancel();
    });
  }

  private throttle(callback: IntersectionObserverCallback, limit: number) {
    let waiting = false;
    return (...args: Parameters<IntersectionObserverCallback>) => {
      if (!waiting) {
        callback(...args);
        waiting = true;
        setTimeout(() => waiting = false, limit);
      }
    };
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.animations.forEach(animation => animation.cancel());
  }
}
