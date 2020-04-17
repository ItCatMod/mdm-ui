import {Component, OnInit, ViewChildren, ViewChild, EventEmitter, ElementRef, AfterViewInit} from '@angular/core';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { ResourcesService } from '../../services/resources.service';
import { merge, Observable, from } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {MdmPaginatorComponent} from "../../shared/mdm-paginator/mdm-paginator";

@Component({
  selector: 'mdm-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.sass']
})
export class UsersTableComponent implements OnInit, AfterViewInit {
  @ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MdmPaginatorComponent, { static: true }) paginator: MdmPaginatorComponent;

  filterEvent = new EventEmitter<string>();
  hideFilters = true;
  filter: string;
  isLoadingResults: boolean;
  totalItemCount: number;
  deleteInProgress: boolean;
  processing: boolean;
  failCount: number;
  total: number;

  displayedColumns: string[] = ['username', 'emailAddress', 'organisation', 'userRole', 'groups', 'status', 'icons'];
  records: any[] = [];

  constructor(private messageHandler: MessageHandlerService, private resources: ResourcesService, private stateHandler: StateHandlerService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.filterEvent.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.filterEvent).pipe(startWith({}), switchMap(() => {
          this.isLoadingResults = true;

          return this.usersFetch(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction, this.filter);
        }),
        map((data: any) => {
          this.totalItemCount = data.body.count;
          this.isLoadingResults = false;
          return data.body.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return [];
        })
      )
      .subscribe(data => {
        this.records = data;
      });
  }

  usersFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {
    const options = { pageSize, pageIndex, sortBy, sortType, filters };

    return this.resources.catalogueUser.get(null, null, options);
  }

  editUser(row) {
    if (row) {
      this.stateHandler.Go('admin.user', { id: row.id, }, null);
    }
  }

  editGroup(row) {
    if (row) {
      this.stateHandler.Go('admin.group', { id: row.id }, null);
    }
  }

  add = () => {
    this.stateHandler.Go('admin.user', { id: null }, null);
  };

  resetPassword(row) {
    from(this.resources.catalogueUser.put(row.id, 'adminPasswordReset', null)).subscribe(() => {
        this.messageHandler.showSuccess('Reset password email sent successfully!');
      },
      error => {
        this.messageHandler.showError('There was a problem sending reset password email.', error);
      }
    );
  }

  toggleDeactivate(row) {
    row.disabled = !row.disabled;
    from(this.resources.catalogueUser.put(row.id, null, { resource: row })).subscribe(() => {
        this.messageHandler.showSuccess('User details updated successfully.');
      },
      error => {
        this.messageHandler.showError('There was a problem updating the user.', error);
      }
    );
  }

  applyFilter = () => {
    let filter: any = '';
    this.filters.forEach((x: any) => {
      const name = x.nativeElement.name;
      const value = x.nativeElement.value;

      if (value !== '') {
        filter += name + '=' + value + '&';
      }
    });
    this.filter = filter;
    this.filterEvent.emit(filter);
  };

  filterClick = () => {
    this.hideFilters = !this.hideFilters;
  }
}
