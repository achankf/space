export function setIfDiff<T>(element: Element, val: T) {
    const str = val.toString();
    if (element.textContent !== str) {
        element.textContent = str;
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
