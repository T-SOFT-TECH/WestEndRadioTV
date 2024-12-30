import {Directive, ElementRef, Input, OnInit} from "@angular/core";
import autoAnimate from "@formkit/auto-animate";


@Directive({
  selector: '[autoAnimate]',
  standalone: true
})
export class AutoAnimationDirective implements OnInit {
  @Input() autoAnimateOptions: Parameters<typeof autoAnimate>[1];

  constructor(private el: ElementRef) {
  }

  ngOnInit() {
    autoAnimate(this.el.nativeElement, this.autoAnimateOptions);
  }
}
