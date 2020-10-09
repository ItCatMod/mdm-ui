/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { DataElementResult } from '@mdm/model/dataElementModel';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.sass']
})
export class DataElementComponent implements OnInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  dataElementOutput: DataElementResult;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  parentId: string;
  afterSave: (result: { body: { id: any } }) => void;
  editMode = false;
  showExtraTabs = false;
  activeTab: any;
  dataClass = { id: null };
  dataModel = { id: null };


  constructor(
    private resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private stateService: StateService,
    private stateHandler: StateHandlerService,
    private title: Title
  ) {
    // tslint:disable-next-line: deprecation
    if (!this.stateService.params.id || !this.stateService.params.dataModelId || !this.stateService.params.dataClassId) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.id && this.stateService.params.dataModelId && this.stateService.params.dataModelId.trim() !== '') {
      // tslint:disable-next-line: deprecation
      this.dataModel = { id: this.stateService.params.dataModelId };
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.id && this.stateService.params.dataClassId && this.stateService.params.dataClassId.trim() !== '') {
      // tslint:disable-next-line: deprecation
      this.dataClass = { id: this.stateService.params.dataClassId };
    }

    // tslint:disable-next-line: deprecation
    if (this.stateService.params.edit === 'true') {
      this.editMode = true;
    }
  }

  ngOnInit() {
    // tslint:disable-next-line: deprecation
    this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;

    this.showExtraTabs = this.sharedService.isLoggedIn();
    this.title.setTitle('Data Element');
    // tslint:disable-next-line: deprecation
    this.dataElementDetails(this.stateService.params.dataModelId, this.dataClass.id, this.stateService.params.id);
    this.subscription = this.messageService.changeSearch.subscribe((message: boolean) => {
      this.showSearch = message;
    });
    // tslint:disable-next-line: deprecation
    this.afterSave = (result: { body: { id: any } }) => this.dataElementDetails(this.stateService.params.dataModelId, this.dataClass.id, result.body.id);
  }

  getTabDetailByName(tabName) {
    switch (tabName) {
      case 'content':
        return { index: 0, name: 'content' };
      case 'properties':
        return { index: 1, name: 'properties' };
      case 'comments':
        return { index: 2, name: 'comments' };
      case 'links':
        return { index: 3, name: 'links' };
      case 'summaryMetadata':
        return { index: 4, name: 'summaryMetadata' };
      case 'attachments':
        return { index: 5, name: 'attachments' };
      default:
        return { index: 0, name: 'content' };
    }
  }

  dataElementDetails(dataModelId: any, dataClassId: string, id: string) {
    if (this.resourcesService.dataElement) {
      this.resourcesService.dataElement.get(dataModelId, dataClassId, id).subscribe((result: { body: DataElementResult }) => {
        this.dataElementOutput = result.body;
        this.messageService.FolderSendMessage(this.dataElementOutput);
        this.messageService.dataChanged(this.dataElementOutput);

        if (this.dataElementOutput) {
          // tslint:disable-next-line: deprecation
          this.activeTab = this.getTabDetailByName(this.stateService.params.tabView).index;
          this.tabSelected(this.activeTab);
        }
      });
    }
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  getTabDetailByIndex(index) {
    switch (index) {
      case 0:
        return { index: 0, name: 'properties' };
      case 1:
        return { index: 1, name: 'comments' };
      case 2:
        return { index: 2, name: 'links' };
      case 3:
        return { index: 3, name: 'summaryMetadata' };
      case 4:
        return { index: 4, name: 'attachments' };
      default:
        return { index: 0, name: 'properties' };
    }
  }

  tabSelected(index) {
    const tab = this.getTabDetailByIndex(index);
    this.stateHandler.Go(
      'dataElement',
      { tabView: tab.name },
      { notify: false, location: tab.index !== 0 }
    );
    this.activeTab = tab.index;
  }
}
