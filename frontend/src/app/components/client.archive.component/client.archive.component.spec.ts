import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientArchiveComponent } from './client.archive.component';

describe('ClientArchiveComponent', () => {
  let component: ClientArchiveComponent;
  let fixture: ComponentFixture<ClientArchiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientArchiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
