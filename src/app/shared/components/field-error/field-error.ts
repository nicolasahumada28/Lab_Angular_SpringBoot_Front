import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { merge, Subscription } from 'rxjs';

@Component({
  imports: [],
  selector: 'app-field-error',
  styleUrl: './field-error.css',
  templateUrl: './field-error.html',
})
export class FieldError implements OnInit, OnDestroy{

  private readonly cdr = inject(ChangeDetectorRef);

  private subscription?: Subscription;

  @Input({ required: true})
  control!: AbstractControl;

  @Input({ required: true})
  label!: string;

  @Input()
  backendError: string | null = null;

  ngOnInit(): void {
    this.subscription = merge (
      this.control.valueChanges,
      this.control.statusChanges
    ).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

}
