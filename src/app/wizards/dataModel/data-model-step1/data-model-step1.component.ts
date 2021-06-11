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
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { HelpDialogueHandlerService } from '@mdm/services/helpDialogue.service';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ControlContainer, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WizardStep } from '@mdm/wizards/wizards.model';
import { DataModelMainComponent } from '../data-model-main/data-model-main.component';

@Component({
  selector: 'mdm-data-model-step1',
  templateUrl: './data-model-step1.component.html',
  styleUrls: ['./data-model-step1.component.sass'],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class DataModelStep1Component implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('myForm', { static: false }) myForm: NgForm;
  allDataModelTypes: any;
  step: WizardStep<DataModelMainComponent>;
  model: any;

  formChangesSubscription: Subscription;
  constructor(
    private helpDialogueHandler: HelpDialogueHandlerService,
    private resources: MdmResourcesService
  ) {}

  ngOnInit() {

    this.model = this.step.scope.model;
    this.resources.dataModel.types().toPromise().then(dataTypes => {
      this.allDataModelTypes = dataTypes.body;
  });
  }

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(() => {
        this.step.invalid = this.myForm.invalid;
    });
  }

  loadHelp = () => {
    this.helpDialogueHandler.open('Create_a_new_model');
  };
}
