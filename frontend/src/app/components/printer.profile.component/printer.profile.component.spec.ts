import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterProfileComponent } from './printer.profile.component';

describe('PrinterProfileComponent', () => {
  let component: PrinterProfileComponent;
  let fixture: ComponentFixture<PrinterProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrinterProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrinterProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
