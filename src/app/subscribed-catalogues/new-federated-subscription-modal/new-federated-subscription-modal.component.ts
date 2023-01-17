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
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FolderDetail,
  Importer,
  PublishedDataModelLink
} from '@maurodatamapper/mdm-resources';
import { ModalDialogStatus } from '@mdm/constants/modal-dialog-status';

export interface NewFederatedSubscriptionModalConfig {
  contentLinks: PublishedDataModelLink[];
  importers: Importer[];
}

export interface NewFederatedSubscriptionModalResponse {
  status: ModalDialogStatus;
  folder?: FolderDetail;
  contentLink?: PublishedDataModelLink;
  importer?: Importer;
}

@Component({
  selector: 'mdm-new-federated-subscription-modal',
  templateUrl: './new-federated-subscription-modal.component.html',
  styleUrls: ['./new-federated-subscription-modal.component.scss']
})
export class NewFederatedSubscriptionModalComponent implements OnInit {
  contentLinks: PublishedDataModelLink[];
  importers: Importer[];

  formGroup: FormGroup = new FormGroup({
    folder: new FormControl(null, [Validators.required]), // eslint-disable-line @typescript-eslint/unbound-method
    format: new FormControl(null),
    importer: new FormControl(null)
  });

  get format() {
    return this.formGroup.get('format');
  }

  get folder() {
    return this.formGroup.get('folder');
  }

  get importer() {
    return this.formGroup.get('importer');
  }

  constructor(
    private dialogRef: MatDialogRef<
      NewFederatedSubscriptionModalComponent,
      NewFederatedSubscriptionModalResponse
    >,
    @Inject(MAT_DIALOG_DATA) public data: NewFederatedSubscriptionModalConfig
  ) {}

  ngOnInit(): void {
    this.contentLinks = this.data.contentLinks;
    this.importers = this.data.importers ?? [];
  }

  confirm() {
    if (this.formGroup.invalid) {
      return;
    }

    const selectedFolders = this.folder.value as FolderDetail[];

    this.dialogRef.close({
      status: ModalDialogStatus.Ok,
      folder: selectedFolders[0],
      contentLink: this.format.value,
      importer: this.importer.value
    });
  }

  cancel() {
    this.dialogRef.close({ status: ModalDialogStatus.Cancel });
  }
}
