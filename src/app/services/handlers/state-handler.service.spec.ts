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
import {TestBed, ComponentFixture} from '@angular/core/testing';

import {StateHandlerService} from './state-handler.service';
import {UIRouter, StateService, StateDeclaration, StateOrName, RawParams, HrefOptions} from '@uirouter/core';
import { ToastrModule } from 'ngx-toastr';

describe('StateHandlerService', () => {
  let spyRouter: UIRouter;
  let currentText = '';   // What the spyRouter.stateService.current.toString() returns.

  beforeEach(() => {
    /**
     * Build a mock UIRouter and add some spies the tests can use.
     */
    spyRouter = {
      stateService: {
        reload() {
        },
        href(name: string, params): string {
          return name;
        },
        current: {
        } as StateDeclaration
      } as StateService
    } as UIRouter;

    spyOn(spyRouter.stateService, 'reload');  // To verify if reload() is called.

    /**
     * Calls to the routers href() always return the value of the stateOrName
     * giving a predictable value to be checked in the test.
     */
    spyOn(spyRouter.stateService, 'href').and.callFake((stateOrName, params) => {
      return stateOrName.toString();
    });
    /**
     * Allow tests to control the result by setting currentText.
     */
    spyRouter.stateService.current.toString = jasmine.createSpy('toString()').and.callFake(() => currentText);

    /**
     * Set up the test bed to support creation of StateHandlerService instances.
     */
    TestBed.configureTestingModule({
      imports: [
        ToastrModule.forRoot()
      ],
      providers: [
        StateHandlerService,
        {provide: UIRouter, useValue: spyRouter}
      ]
    }).compileComponents();
  });

  it('should be created', () => {
    const handlerService = TestBed.inject(StateHandlerService);
    expect(handlerService).toBeTruthy();
  });

  /**
   * Verifies that calling reload() gets passed through to the UIRouter's
   * reload and that no arguments are passed.
   */
  it('should reload', () => {
    const handlerService = TestBed.inject(StateHandlerService);

    handlerService.reload();
    expect(spyRouter.stateService.reload).toHaveBeenCalledWith();
  });

  /**
   * Getting a Url for a folder.
   */
  it('should get folder url', () => {
    const handlerService = TestBed.inject(StateHandlerService);

    currentText = '';
    const result = handlerService.getURL('folder', null);
    expect(spyRouter.stateService.href).toHaveBeenCalled();
    expect(result).toEqual(handlerService.handler.states.folder);
  });

  /**
   * The handler responds to a request for a simple app result.
   */
  it('should get simple app result', () => {
    const handlerService = TestBed.inject(StateHandlerService);

    const params = {
      mode: 'notAdvanced',
      criteria: 'criteria',
      pageIndex: 1,
      pageSize: 256,
      offset: 0
    };
    currentText = 'appContainer.simpleApp.result';
    const result = handlerService.getURL('terminology', params);

    expect(result).toEqual('appContainer.simpleApp.element');
    expect(params.criteria).toBeNull();
    expect(params.pageIndex).toBeNull();
    expect(params.pageSize).toBeNull();
    expect(params.offset).toBeNull();
  });

  /**
   * Unknown result, expect the name passed into become the result.
   */
  it('should get unknown', () => {
    const handlerService = TestBed.inject(StateHandlerService);
    currentText = '';
    const name = 'Fjord defect';
    const result = handlerService.getURL(name, null);
    expect(result).toEqual(name);
  });
});
