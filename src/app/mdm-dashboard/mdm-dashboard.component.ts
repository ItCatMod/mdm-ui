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

import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';
import { Title } from '@angular/platform-browser';
import { MdmFavouritesComponent } from '@mdm/mdm-dashboard/mdm-plugins/mdm-favourites/mdm-favourites.component';
import { AboutComponent } from '@mdm/about/about.component';
import {
  GridsterConfig,
  GridsterItem,
  GridsterComponent,
  GridType,
  CompactType,
} from 'angular-gridster2';
import { InputModalComponent } from '@mdm/modals/input-modal/input-modal.component';
import { MatDialog } from '@angular/material/dialog';
import {
  SelectModalComponent,
  SelectModalItem,
} from '@mdm/modals/select-modal/select-modal.component';
import { ToastrService } from 'ngx-toastr';
import { SecurityHandlerService } from '@mdm/services/handlers/security-handler.service';
import { MdmCommentsComponent } from './mdm-plugins/mdm-comments/mdm-comments.component';
import { MdmRecentActivityComponent } from './mdm-plugins/mdm-recent-activity/mdm-recent-activity.component';
import { MdmTasksComponent } from './mdm-plugins/mdm-tasks/mdm-tasks.component';
import { MdmRecentlyAddedDataModelsComponent } from './mdm-plugins/mdm-recently-added-data-models/mdm-recently-added-data-models.component';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './mdm-dashboard.component.html',
  styleUrls: ['./mdm-dashboard.component.scss'],
})
export class MdmDashboardComponent implements OnInit {
  inEditMode = false;
  @ViewChild(GridsterComponent) gridster: GridsterComponent;
  options: GridsterConfig;

  availableWidgets: Array<SelectModalItem> = [
    { value: 'comments', display: 'Comments' },
    { value: 'recentActivity', display: 'Recent Activity' },
    { value: 'task', display: 'Task' },
    { value: 'recentAddedDataModel', display: 'Recent Added Data Models' },
    { value: 'mdmFavourites', display: 'Favorites' },
  ];
  factory: ComponentFactory = new ComponentFactory();
  widgets: GridsterItem[] = new Array<GridsterItem>();

  dashboardSetting = 'dashboard';
  profile: any;

  constructor(
    private usersSetting: UserSettingsHandlerService,
    private cd: ChangeDetectorRef,
    private title: Title,
    public dialog: MatDialog,
    private toast: ToastrService,
    private securityHandler: SecurityHandlerService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Dashboard');
    this.profile = this.securityHandler.getCurrentUser();
    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      pushItems: true,
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
    };
    this.LayoutGrid();
  }

  private LayoutGrid() {
    const layout = this.usersSetting.get(this.dashboardSetting);
    if (layout) {
      if (layout.length > 0) {
        const data: Array<GridsterItem> = JSON.parse(layout);
        data.forEach((x) => (x.el = this.factory.resolve(x.id)));
        this.widgets = data;
      }
    }
    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    this.title.setTitle('Dashboard');
  }

  Save() {
    this.cd.detectChanges();
    let saveArray: Array<GridsterItem> = Object.assign([], this.widgets);
    this.gridster.grid.forEach((item) => {
      let wid = saveArray.find((x) => x.id === item.item.id);
      wid = item.item;
      wid.el = null;
    });
    this.usersSetting.update(this.dashboardSetting, JSON.stringify(saveArray));
    this.options.resizable.enabled = false;
    this.options.draggable.enabled = false;
    this.options.api.optionsChanged();
    this.LayoutGrid();
    this.inEditMode = !this.inEditMode;
    this.toast.info('Layout has been saved', 'Layout');
  }

  Reset() {
    this.usersSetting.update(this.dashboardSetting, null);
    this.widgets = [];
    this.LayoutGrid();
    this.toast.info('Layout has been reset', 'Layout');
  }

  Edit(): void {
    this.options.resizable.enabled = true;
    this.options.draggable.enabled = true;
    this.options.api.optionsChanged();
    this.inEditMode = !this.inEditMode;
  }

  AddWidget(): void {
    const dialog = this.dialog.open(SelectModalComponent, {
      data: {
        items: this.availableWidgets,
        modalTitle: 'Add a New Widget',
        okBtn: 'Add Widget',
        btnType: 'primary',
        inputLabel: 'Widget name',
        message: 'Please select a widget to add to dashboard',
      },
    });

    dialog.afterClosed().subscribe((result) => {
      if (result) {
        const newItem: GridsterItem = {
          x: 0,
          y: 0,
          id: result,
          rows: 1,
          cols: 1,
          el: this.factory.resolve(result),
        };
        this.widgets.push(newItem);
      }
    });
  }

  RemoveItem($event, item): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.widgets.splice(this.widgets.indexOf(item), 1);
  }
}

export class ComponentFactory {
  constructor() {}

  resolve(name) {
    switch (name) {
      case 'mdmFavourites': {
        return new ComponentPortal(MdmFavouritesComponent);
      }
      case 'comments': {
        return new ComponentPortal(MdmCommentsComponent);
      }
      case 'recentActivity': {
        return new ComponentPortal(MdmRecentActivityComponent);
      }
      case 'task': {
        return new ComponentPortal(MdmTasksComponent);
      }
      case 'recentAddedDataModel': {
        return new ComponentPortal(MdmRecentlyAddedDataModelsComponent);
      }
    }
  }
}
