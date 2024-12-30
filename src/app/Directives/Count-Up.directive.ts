import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[countUp]',
  standalone: true
})
export class CountUpDirective {
  @Input('countUp') targetNumber = 0;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const duration = 2500;
    const steps = 60;
    const stepValue = this.targetNumber / steps;
    let currentValue = 0;

    const interval = setInterval(() => {
      currentValue += stepValue;
      if (currentValue >= this.targetNumber) {
        currentValue = this.targetNumber;
        clearInterval(interval);
      }
      this.el.nativeElement.textContent = Math.round(currentValue);
    }, duration / steps);
  }
}
