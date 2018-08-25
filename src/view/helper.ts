export function setIfDiff(element: Element, strVal: string) {
    if (element.textContent !== strVal) {
        element.textContent = strVal;
    }
}

export function clearChildren(element: Element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}

export function batchChildren(it: Iterable<Element>) {
    const fragment = document.createDocumentFragment();
    for (const e of it) {
        fragment.appendChild(e);
    }
    return fragment;
}
