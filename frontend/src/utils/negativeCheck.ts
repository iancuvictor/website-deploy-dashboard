import type { FocusEvent } from "react";

export default function negativeCheck(e: FocusEvent<HTMLInputElement>, minValue: number) {
    if (+e.target.value <= minValue && e.target.value !== '') {
        return e.target.value = String(minValue)
    } else {
        return e.target.value
    }
}