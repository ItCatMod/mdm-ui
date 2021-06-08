/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageService } from '@mdm/services/message.service';
import { SharedService } from '@mdm/services/shared.service';
import { StateService, UIRouterGlobals } from '@uirouter/core';
import { StateHandlerService } from '@mdm/services/handlers/state-handler.service';
import { Subscription } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { EditingService } from '@mdm/services/editing.service';
import { MatDialog } from '@angular/material/dialog';
import {
  MessageHandlerService,
  SecurityHandlerService,
  ValidatorService
} from '@mdm/services';
import { ProfileBaseComponent } from '@mdm/profile-base/profile-base.component';
import {
  DataClass,
  DataClassDetail,
  DataClassDetailResponse
} from '@maurodatamapper/mdm-resources';
import { Access } from '@mdm/model/access';
import { TabCollection } from '@mdm/model/ui.model';
import { DefaultProfileItem } from '@mdm/model/defaultProfileModel';
import { min, max } from 'lodash';
import { TabCollection } from '@mdm/model/ui.model';

@Component({
  selector: 'mdm-data-class',
  templateUrl: './data-class.component.html',
  styleUrls: ['./data-class.component.sass']
})
export class DataClassComponent
  extends ProfileBaseComponent
  implements OnInit, AfterViewInit {
  @ViewChild('tab', { static: false }) tabGroup: MatTabGroup;
  dataClass: DataClassDetail;
  showSecuritySection: boolean;
  subscription: Subscription;
  showSearch = false;
  showExtraTabs = false;
  activeTab: any;
  parentDataClass = { id: null };
  parentDataModel = {};
  isEditable: boolean;
  max: any;
  min: any;
  error = '';
  aliases: any[] = [];
  access: Access;
  tabs = new TabCollection(['description', 'elements', 'context', 'data', 'rules', 'annotations', 'history']);

  newMinText: any;
  newMaxText: any;

  descriptionView = 'default';
  annotationsView = 'default';

  showEditDescription = false;

  constructor(
    resourcesService: MdmResourcesService,
    private messageService: MessageService,
    private uiRouterGlobals: UIRouterGlobals,
    private sharedService: SharedService,
    private stateHandler: StateHandlerService,
    private securityHandler: SecurityHandlerService,
    private title: Title,
    editingService: EditingService,
    dialog: MatDialog,
    messageHandler: MessageHandlerService,
    validator: ValidatorService
  ) {
    super(resourcesService, dialog, editingService, messageHandler, validator);
  }

  ngOnInit() {
    if (
      this.isGuid(this.uiRouterGlobals.params.id) &&
      (!this.uiRouterGlobals.params.id ||
        !this.uiRouterGlobals.params.dataModelId)
    ) {
      this.stateHandler.NotFound({ location: false });
      return;
    }

    if (
      this.uiRouterGlobals.params.id &&
      this.uiRouterGlobals.params.dataClassId &&
      this.uiRouterGlobals.params.dataClassId.trim() !== ''
    ) {
      this.parentDataClass = { id: this.uiRouterGlobals.params.dataClassId };
    }

    this.activeTab = this.tabs.getByName(this.uiRouterGlobals.params.tabView).index;
    this.tabSelected(this.activeTab);

    this.showExtraTabs = this.sharedService.isLoggedIn();

    this.title.setTitle('Data Class');

    this.subscription = this.messageService.changeSearch.subscribe(
      (message: boolean) => {
        this.showSearch = message;
      }
    );

    this.dataClassDetails(
      this.uiRouterGlobals.params.dataModelId,
      this.uiRouterGlobals.params.id,
      this.parentDataClass.id
    );
  }

  ngAfterViewInit(): void {
    this.editingService.setTabGroupClickEvent(this.tabGroup);
  }

  dataClassDetails(model, id, parentDataClass?) {
    if (!parentDataClass) {
      this.resourcesService.dataClass
        .get(model, id)
        .subscribe((result: DataClassDetailResponse) => {
          this.dataClass = result.body;

          this.access = this.securityHandler.elementAccess(this.dataClass);

          this.catalogueItem = this.dataClass;
          this.isEditable = this.dataClass.availableActions?.includes('update');

          this.parentDataModel = {
            id: result.body.model,
            finalised: this.dataClass.breadcrumbs[0].finalised
          };

          this.UsedProfiles('dataClass', id);
          this.UnUsedProfiles('dataClass', id);
          this.messageService.FolderSendMessage(this.dataClass);
          this.messageService.dataChanged(this.dataClass);

          if (
            this.dataClass.minMultiplicity &&
            this.dataClass.minMultiplicity === -1
          ) {
            this.min = '*';
          } else {
            this.min = this.dataClass.minMultiplicity;
          }

          if (
            this.dataClass.maxMultiplicity &&
            this.dataClass.maxMultiplicity === -1
          ) {
            this.max = '*';
          } else {
            this.max = this.dataClass.maxMultiplicity;
          }
        });
    } else {
      this.resourcesService.dataClass
        .getChildDataClass(model, parentDataClass, id)
        .subscribe((result: DataClassDetailResponse) => {
          this.dataClass = result.body;
          this.parentDataModel = {
            id: result.body.model,
            finalised: this.dataClass.breadcrumbs[0].finalised
          };
          this.isEditable = this.dataClass.availableActions?.includes('update');

          this.messageService.FolderSendMessage(this.dataClass);
          this.messageService.dataChanged(this.dataClass);
          this.UsedProfiles('dataClass', id);
          this.UnUsedProfiles('dataClass', id);
          this.catalogueItem = this.dataClass;
          this.access = this.securityHandler.elementAccess(this.dataClass);
        });
    }
  }

  save(saveItems: any) {
    this.error = '';

    const resource: DataClass = {
      id: this.catalogueItem.id,
      label: this.catalogueItem.label,
      domainType: this.catalogueItem.domainType
    };

    saveItems.forEach((item: DefaultProfileItem) => {
      if (item.maxMultiplicity !== undefined) {
        if ((item.minMultiplicity as string) === '*') {
          item.minMultiplicity = -1;
        }

        if ((item.maxMultiplicity as string) === '*') {
          item.maxMultiplicity = -1;
        }

        resource.minMultiplicity = item.minMultiplicity as number;
        resource.maxMultiplicity = item.maxMultiplicity;
      } else {
        resource[item.displayName.toLocaleLowerCase()] = item.value;
      }
    });

    if (!this.catalogueItem.parentDataClass) {
      this.resourcesService.dataClass
        .update(this.catalogueItem.model, this.catalogueItem.id, resource)
        .subscribe(
          (result: DataClassDetailResponse) => {
            this.catalogueItem = result.body;
            this.messageHandler.showSuccess('Data Class updated successfully.');
            this.editingService.stop();
            this.messageService.dataChanged(result.body);
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Class.',
              error
            );
          }
        );
    } else {
      this.resourcesService.dataClass
        .updateChildDataClass(
          this.dataClass.model,
          this.dataClass.parentDataClass,
          this.dataClass.id,
          resource
        )
        .subscribe(
          (result: DataClassDetailResponse) => {
            this.messageHandler.showSuccess('Data Class updated successfully.');
            this.editingService.stop();
            this.catalogueItem = result.body;
          },
          (error) => {
            this.messageHandler.showError(
              'There was a problem updating the Data Class.',
              error
            );
          }
        );
    }
  }

  toggleShowSearch() {
    this.messageService.toggleSearch();
  }

  tabSelected(index: number) {
    const tab = this.tabs.getByIndex(index);
    this.stateHandler.Go('dataClass', { tabView: tab.name }, { notify: false });
  }

  validateMultiplicity(min, max) {
    const errorMessage = this.validator.validateMultiplicities(min, max);
    if (errorMessage) {
      this.error = errorMessage;
      return false;
    }
    return true;
  }
}
