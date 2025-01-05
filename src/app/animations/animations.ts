import {animate, animation, style, transition, trigger, useAnimation} from "@angular/animations";


export const fadeIn = animation([
  style({opacity: 0}),
  animate("300ms", style({opacity: 1}))
]);

export const fadeOut = animation([
  style({opacity: 1}),
  animate("300ms", style({opacity: 0}))
]);

export const fadeInOut = trigger('fadeInOut', [
  transition('void => *', useAnimation(fadeIn)),
  transition('* => void', useAnimation(fadeOut))
]);


export const dropDown = animation([
  style({top: "-100%"}),
  animate("300ms", style({top: "0%"}))
]);

export const dropUp = animation([
  animate("300ms", style({top: "-10%"}))
]);

export const dropDownUp = trigger('dropDownUp', [
  transition('void => *', useAnimation(dropDown)),
  transition('* => void', useAnimation(dropUp))
]);


export const foldUp = animation([
  style({height: "*", overflow: "hidden"}),
  animate("200ms", style({height: "0"}))
]);

export const foldDown = animation([
  style({height: "0", overflow: "hidden"}),
  animate("200ms", style({height: "*"}))
]);

export const foldUpDown = trigger('foldUpDown', [
  transition('void => *', useAnimation(foldDown)),
  transition('* => void', useAnimation(foldUp))
]);


export const zoomIn = animation([
  style({ transform: 'scale(0.5)', opacity: 0 }),
  animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
]);

export const zoomOut = animation([
  style({ transform: 'scale(1)', opacity: 1 }),
  animate('300ms ease-in', style({ transform: 'scale(0.5)', opacity: 0 }))
]);

export const zoomInOut = trigger('zoomInOut', [
  transition('void => *', useAnimation(zoomIn)),
  transition('* => void', useAnimation(zoomOut))
]);

export const slideInRight = animation([
  style({ transform: 'translateX(100%)' }),
  animate('300ms ease-out', style({ transform: 'translateX(0)' }))
]);

export const slideOutRight = animation([
  style({ transform: 'translateX(0)' }),
  animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
]);

export const slideInOutRight = trigger('slideInOutRight', [
  transition('void => *', useAnimation(slideInRight)),
  transition('* => void', useAnimation(slideOutRight))
]);
