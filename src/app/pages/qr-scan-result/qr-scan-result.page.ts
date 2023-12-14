import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Content, ContentSrc, PlayerType } from 'src/app/appConstants';
import { AddToPitaraComponent } from 'src/app/components/add-to-pitara/add-to-pitara.component';
import { SheetModalComponent } from 'src/app/components/sheet-modal/sheet-modal.component';
import { AppHeaderService } from 'src/app/services';
import { ContentService } from 'src/app/services/content/content.service';
import { OnTabViewWillEnter } from 'src/app/tabs/on-tabs-view-will-enter';

@Component({
  selector: 'app-qr-scan-result',
  templateUrl: './qr-scan-result.page.html',
  styleUrls: ['./qr-scan-result.page.scss'],
})
export class QrScanResultPage implements OnInit, OnTabViewWillEnter {
  configContents!: Array<any>
  optModalOpen: boolean = false;
  showSheenAnimation: boolean = true;
  scanText: string = '';
  constructor(
    private headerService: AppHeaderService,
    private location: Location,
    private modalCtrl: ModalController,
    private contentService: ContentService,
    private router: Router
  ) { 
    let extras = this.router.getCurrentNavigation()?.extras;
    if(extras) {
      this.scanText = extras.state?.['scannedData'];
      console.log('scan text ', this.scanText);
    }
  }

  tabViewWillEnter(): void {
    this.headerService.showHeader('QrScan Result', true, []);
    this.headerService.showStatusBar();
  }

  ngOnInit() {
    this.headerService.headerEventEmitted$.subscribe((name: any) => {
      if(name == "back") {
        this.location.back();
      } 
    })
    this.configContents = [];
    this.contentService.getContents(this.scanText).then((result) => {
      this.showSheenAnimation = false;
      console.log('Result: ', result);
      this.configContents = result;
    })
  }

  ionViewWillEnter() {
    this.headerService.showHeader('QrScan Result', true, []);
    this.headerService.showStatusBar();
  }

  async playContent(event: Event, content: Content) {
    this.contentService.markContentAsViewed(content)
    await this.router.navigate(['/player'], {state: {content}});
  }

  async moreOtions(content: any) {
    let modal: any;
    if(!this.optModalOpen) {
      this.optModalOpen = true;
      modal = await this.modalCtrl.create({
        component: SheetModalComponent,
        componentProps: {
          content: content
        },
        cssClass: 'sheet-modal',
        breakpoints: [0.3],
        showBackdrop: false,
        initialBreakpoint: 0.3,
        handle: false,
        handleBehavior: "none"
      });
      await modal.present();
    }
    modal.onDidDismiss().then((result: any) => {
      this.optModalOpen = false;
      if(result.data && result.data.type === 'addToPitara') {
          this.addContentToMyPitara(result.data.content || content)
      }
    });
  }

  async addContentToMyPitara(content: ContentSrc) {
    const modal = await this.modalCtrl.create({
      component: AddToPitaraComponent,
      componentProps: {
        content
      },
      cssClass: 'add-to-pitara',
      breakpoints: [0, 1],
      showBackdrop: false,
      initialBreakpoint: 1,
      handle: false,
      handleBehavior: "none"
    });
    await modal.present();
    modal.onWillDismiss().then((result) => {
    });
  }
}