
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import {
  Teacher,
  Course,
  TeacherRequest,
  RespSingleDto,
  RespSliceDto,
  SimpleStringFilterDto,
  LongIdDto,
  PaginatedResponse
} from '../interfaces/backend-interfaces';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10, search: string = ''): Observable<PaginatedResponse<Teacher>> {
    const body: SimpleStringFilterDto = {
      filter: search,
      pagination: {
        pageNumber: page,
        pageSize: size
      }
    };

    return this.http.post<RespSliceDto<Teacher>>(`${this.baseUrl}/filterTeachers`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in getAll teachers:', error);
          return throwError(() => new Error(error.message || 'Error loading teachers'));
        })
      );
  }

  getById(id: number): Observable<Teacher> {
    const body: LongIdDto = { id: id };
    return this.http.post<RespSingleDto<Teacher>>(`${this.baseUrl}/getTeacher`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in getById teacher:', error);
          return throwError(() => new Error(error.message || 'Error loading teacher'));
        })
      );
  }

  create(teacher: TeacherRequest): Observable<Teacher> {
    return this.http.post<RespSingleDto<Teacher>>(`${this.baseUrl}/upsertTeacher`, teacher)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in create teacher:', error);
          return throwError(() => new Error(error.message || 'Error creating teacher'));
        })
      );
  }

  update(id: number, teacher: TeacherRequest): Observable<Teacher> {
    const body = { ...teacher, id: id };
    return this.http.post<RespSingleDto<Teacher>>(`${this.baseUrl}/upsertTeacher`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error in update teacher:', error);
          return throwError(() => new Error(error.message || 'Error updating teacher'));
        })
      );
  }

  delete(id: number): Observable<void> {
    const body: LongIdDto = { id: id };
    return this.http.post<RespSingleDto<void>>(`${this.baseUrl}/deleteTeacher`, body)
      .pipe(
        map(response => {
          if (response.errors && response.errors.length > 0) {
            throw new Error(response.errors.join(', '));
          }
          return void 0;
        }),
        catchError(error => {
          console.error('Error in delete teacher:', error);
          return throwError(() => new Error(error.message || 'Error deleting teacher'));
        })
      );
  }
}