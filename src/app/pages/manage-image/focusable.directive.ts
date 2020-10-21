import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Inject, Input, PLATFORM_ID, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFocusable]'
})
export class FocusableDirective {
  @Input('appFocusable') public id: number = 0;
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  public focus(): void {
    if (!this.isBrowser) {
      return;
    }
    this.elementRef.nativeElement.scrollIntoView({ behavior: "smooth" });
    this.renderer.addClass(this.elementRef.nativeElement, 'focused');
    setTimeout(() => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'focused');
    }, 2000);
  }
}
