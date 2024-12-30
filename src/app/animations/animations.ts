import { animate, style, transition, trigger } from '@angular/animations';

// Fade animations
export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(-10px)' }),
    animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
  ])
]);

export const fadeSimple = trigger('fadeSimple', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ opacity: 0 }))
  ])
]);

// Slide animations
export const slideInOutLeft = trigger('slideInOutLeft', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
  ])
]);

export const slideInOutRight = trigger('slideInOutRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('300ms ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
]);

export const slideInOutTop = trigger('slideInOutTop', [
  transition(':enter', [
    style({ transform: 'translateY(-100%)' }),
    animate('300ms ease-out', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateY(-100%)' }))
  ])
]);

export const slideInOutBottom = trigger('slideInOutBottom', [
  transition(':enter', [
    style({ transform: 'translateY(100%)' }),
    animate('300ms ease-out', style({ transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
  ])
]);

// Scale animations
export const scaleInOut = trigger('scaleInOut', [
  transition(':enter', [
    style({ transform: 'scale(0.95)', opacity: 0 }),
    animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'scale(0.95)', opacity: 0 }))
  ])
]);

// Combined animations
export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 })),
    style({ transform: 'scale(0.95)' }),
    animate('200ms ease-out', style({ transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'scale(0.95)' })),
    animate('200ms ease-in', style({ opacity: 0 }))
  ])
]);

// Helper function to create custom duration animations
export const createFadeAnimation = (duration: string) =>
  trigger('fade', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate(`${duration} ease-out`, style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate(`${duration} ease-in`, style({ opacity: 0 }))
    ])
  ]);

// Constants for common timings
export const AnimationDurations = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms'
} as const;

// Constants for common easings
export const AnimationEasings = {
  EASE_OUT: 'ease-out',
  EASE_IN: 'ease-in',
  EASE_IN_OUT: 'ease-in-out'
} as const;
