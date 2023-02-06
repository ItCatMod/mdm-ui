/*
Copyright 2020-2023 University of Oxford
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SubscribedCatalogueDetailComponent } from '@mdm/subscribed-catalogues/subscribed-catalogue-detail/subscribed-catalogue-detail.component';
import { ModelPathComponent } from '@mdm/utility/model-path/model-path.component';

describe('EnumerationValuesDetailsComponent', () => {
  let component: SubscribedCatalogueDetailComponent;
  let fixture: ComponentFixture<SubscribedCatalogueDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModelPathComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscribedCatalogueDetailComponent);
    component = fixture.componentInstance;
    component.subscribedCatalogue = {
      url: '',
      label: '',
      subscribedCatalogueType: 'test',
      subscribedCatalogueAuthenticationType: ''
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
