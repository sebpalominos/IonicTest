import { Component, Input } from '@angular/core';

@Component({
  selector: 'categories-loading',
  templateUrl: 'categories-loading.component.html',
  host: {
    class: 'categories-loading'
  }
})
export class CategoriesLoadingComponent {
  loadingScreenIconUrls: string[];
  showSplash: boolean;
  ngOnInit() {
    this.loadingScreenIconUrls = [
      'financial/card-back logo',
      'financial/wallet',
      'financial/card-front',
    ].map(iconPath => `assets/icons/squidink/svg64/${iconPath}.svg`);
    setTimeout(() => {
      this.showSplash = true;
    }, 200);
  }
}