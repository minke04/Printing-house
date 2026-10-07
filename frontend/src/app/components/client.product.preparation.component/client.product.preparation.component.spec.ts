import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProductPreparationComponent } from './client.product.preparation.component';

describe('ClientProductPreparationComponent', () => {
  let component: ClientProductPreparationComponent;
  let fixture: ComponentFixture<ClientProductPreparationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProductPreparationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProductPreparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
