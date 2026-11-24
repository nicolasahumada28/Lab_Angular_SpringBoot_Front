import { Validators } from "@angular/forms";
import { notBlankValidator } from "./not-blank.validator";


export const TASK_TITLE_VALIDATORS = [
    Validators.required,
    notBlankValidator,
    Validators.minLength(3),
    Validators.maxLength(100)
];

export const TASK_DESCRIPTION_VALIDATORS = [
    Validators.maxLength(500)
];