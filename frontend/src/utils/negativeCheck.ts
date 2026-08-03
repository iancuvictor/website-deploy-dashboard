import type { ChangeEvent } from "react";

export default function negativeCheck(e: ChangeEvent<HTMLInputElement>, minValue: number) {
    if (+e.target.value <= minValue && +e.target.value === 0 && e.target.value !== '') {
        return e.target.value = String(minValue)
    } else {
        return e.target.value
    }
}