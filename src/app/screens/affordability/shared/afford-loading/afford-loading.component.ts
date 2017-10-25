import { Component, Input } from '@angular/core';

@Component({
  selector: 'afford-loading',
  templateUrl: 'afford-loading.component.html',
  host: {
    class: 'afford-loading'
  }
})
export class AffordabilityLoadingComponent {
  loadingScreenIconUrls: string[];
  showSplash: boolean;
  ngOnInit() {
    this.loadingScreenIconUrls = [
      'financial/bill',
      'financial/chart',
      'financial/calculator-2',
    ].map(iconPath => `assets/icons/squidink/svg64/${iconPath}.svg`);
    setTimeout(() => {
      this.showSplash = true;
    }, 400);
  }
}