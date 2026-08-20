import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDashboard } from './ticket-dashboard';

describe('TicketDashboard', () => {
  let component: TicketDashboard;
  let fixture: ComponentFixture<TicketDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
