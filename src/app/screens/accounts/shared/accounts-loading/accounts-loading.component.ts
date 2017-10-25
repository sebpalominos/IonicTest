import { Component, Input } from '@angular/core';

@Component({
  selector: 'accounts-loading',
  templateUrl: 'accounts-loading.component.html',
  host: {
    class: 'accounts-loading'
  }
})
export class AccountsLoadingComponent {
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