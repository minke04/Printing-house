import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProcurementsComponent } from './client.procurements.component';

describe('ClientProcurementsComponent', () => {
  let component: ClientProcurementsComponent;
  let fixture: ComponentFixture<ClientProcurementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProcurementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProcurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
