import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: false,
  template: `
    <ion-searchbar
      [placeholder]="placeholder"
      [value]="value"
      (ionInput)="onSearchInput($event)"
      (ionClear)="onClear()"
      [debounce]="debounceTime">
    </ion-searchbar>
  `
})
export class SearchComponent implements OnInit {
  @Input() placeholder: string = 'Kerko...';
  @Input() value: string = '';
  @Input() debounceTime: number = 500;
  
  @Output() searchChange = new EventEmitter<string>();
  
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchChange.emit(searchTerm);
    });
  }

  onSearchInput(event: any) {
    const searchTerm = event.target.value;
    this.searchSubject.next(searchTerm);
  }

  onClear() {
    this.searchChange.emit('');
  }
}