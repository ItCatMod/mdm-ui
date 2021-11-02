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
import { Component, OnInit, Input } from '@angular/core';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';

@Component({
  selector: 'mdm-profile-picture',
  templateUrl: './profile-picture.component.html',
  styleUrls: ['./profile-picture.component.sass']
})
export class ProfilePictureComponent implements OnInit {
  @Input() user: any;
  @Input() userId : Uuid;
  image: any;
  dynamicTooltipText: string;
  constructor(private resoucesService: MdmResourcesService) {}

  ngOnInit() {

    if(this.userId){
    this.resoucesService.userImage.getUserImageFile(this.userId).subscribe(result =>
      {
        this.image = result.body;
      });
    }
  }
}
