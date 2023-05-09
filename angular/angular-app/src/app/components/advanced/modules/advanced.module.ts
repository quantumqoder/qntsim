import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvancedRoutingModule } from './advanced.routing.module';
import { AdvancedComponent } from '../advanced.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SliderModule } from 'primeng/slider';

@NgModule({
    imports: [
        CommonModule,
        AdvancedRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        AccordionModule,
        SliderModule
    ],
    declarations: [AdvancedComponent]
})
export class AdvancedModule { }