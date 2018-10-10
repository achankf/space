(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[0],{

/***/ "../myalgo-ts/dist/array/index.js":
/*!****************************************!*\
  !*** ../myalgo-ts/dist/array/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./minheap */ "../myalgo-ts/dist/array/minheap.js"));
__export(__webpack_require__(/*! ./sortedList */ "../myalgo-ts/dist/array/sortedList.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXJyYXkvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwrQkFBMEI7QUFDMUIsa0NBQTZCIn0=

/***/ }),

/***/ "../myalgo-ts/dist/array/minheap.js":
/*!******************************************!*\
  !*** ../myalgo-ts/dist/array/minheap.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Array-based binary heap.
 */
class MinHeap extends wrapper_1.MyIterable {
    constructor(cmp) {
        super();
        this.cmp = cmp;
        this.arr = [];
        /** Remove the most important (minimum) item in the heap. This action mutates the heap. */
        this.pop = () => {
            const ret = pop(this.arr, this.arr.length, this.cmp);
            const poped = this.arr.pop();
            console.assert(ret === poped);
            return ret;
        };
        /**
         * Sort the collection in reverse order (i.e. low-to-high priority of MIN
         * heap <-- note MIN). This method resets the heap and mutate the data array in-place.
         */
        this.reverseSort = () => {
            const arr = this.arr;
            this.arr = []; // clears the array in case for reusing this heap
            for (let len = arr.length; len > 0; len--) {
                // pop works by swapping the root to the end and then correct the structure by bubbledown the root
                pop(arr, len, this.cmp);
            }
            return arr;
        };
        /**
         * Sort the collection in order (i.e. high-to-low priority of MIN heap <-- note MIN).
         * This method resets the heap and mutate the data array in-place.
         */
        this.sortInPlace = () => {
            const sorted = this.reverseSort();
            let first = 0;
            let last = sorted.length - 1;
            // reverse the reverse-sorted array
            while (first < last) {
                swap(sorted, first, last);
                ++first;
                --last;
            }
            return sorted;
        };
        /**
         * Sort the collection in order (i.e. high-to-low priority of MIN heap <-- note MIN).
         * This operation doesn't mutate the heap but a slice of the sorted data will be created.
         */
        this.sort = () => {
            const ret = this.sortHelper();
            return wrapper_1.wrapIt(ret);
        };
        /**
         * Add an item into the heap.
         */
        this.add = (data) => {
            const idx = this.arr.length;
            this.arr.push(data);
            bubbleUp(this.arr, idx, this.cmp);
        };
        this.iterate = () => {
            return this.sortHelper();
        };
        this.sortHelper = () => {
            return sort(this.arr.slice(), this.cmp);
        };
    }
    /**
     * Make an array copy of it and heapify it.
     * @param it the data
     * @param cmp the comparator
     */
    static heapify(cmp, ...arr) {
        return MinHeap.inPlaceWrap(cmp, arr);
    }
    /**
     * Create a heap in-place by mutating the given array. The caller should consider the ownership of arr.
     * @param arr an array to be mutated in-place
     * @param cmp the comparator
     */
    static inPlaceWrap(cmp, arr) {
        return MinHeap.unsafeWrap(heapifyArray(arr, cmp), cmp);
    }
    /**
     * Wraps a heapified array into a MinHeap without any checking whatsoever.
     * @param arr an heapified array slice, presumably generated from MinHeap.slice()
     * @param cmp the comparator
     */
    static unsafeWrap(arr, cmp) {
        const ret = new MinHeap(cmp);
        ret.arr = arr;
        return ret;
    }
    /** Returns the number of items in the heap */
    get size() { return this.arr.length; }
    /** Get the most important (minimum) item in the heap. */
    get top() { return this.isEmpty ? undefined : this.arr[0]; }
}
exports.MinHeap = MinHeap;
function* sort(heapifiedArray, cmp) {
    const arr = heapifiedArray;
    let val = pop(arr, arr.length, cmp);
    while (val !== undefined) {
        yield arr.pop();
        val = pop(arr, arr.length, cmp);
    }
}
function heapifyArray(arr, cmp) {
    for (let i = Math.floor((arr.length - 1) / 2); i >= 0; i--) {
        bubbleDown(arr, i, arr.length, cmp);
    }
    return arr;
}
function parent(n) {
    return Math.floor((n + 1) / 2) - 1;
}
function leftChild(i) {
    return 2 * i + 1;
}
function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
// pop swaps the root to the end of the array; caller is responsible for memeory management
// not handling memory here because pop() is crucial for the in-place sort
function pop(arr, length, cmp) {
    const lenMinus = length - 1;
    if (length === 0) {
        return;
    }
    else if (length === 1) {
        // since this method only does swapping in arr, there's no need to swap when arr only has 1 item
        return arr[lenMinus];
    }
    const ret = arr[0];
    swap(arr, 0, lenMinus); // replace root with the last element and then bubbledown
    bubbleDown(arr, 0, lenMinus, cmp);
    return ret;
}
function bubbleDown(arr, startIdx, length, cmp) {
    const itemVal = arr[startIdx];
    let prev = startIdx; // iterator starting at the root node defined by start
    while (true) {
        let candidate = leftChild(prev);
        if (candidate >= length) { // left-child doesn't exist
            break; // implied that right child doesn't exist too
        }
        // children found, pick the lowest of the 2 children
        const left = arr[candidate];
        const rightIdx = candidate + 1;
        if (rightIdx < length && // right-child exists and
            cmp(arr[rightIdx], left) < 0 // right child is less than left-child
        ) {
            candidate = rightIdx; // pick the right child
        }
        // compare "me" with the lowest child
        if (cmp(itemVal, arr[candidate]) < 0) {
            break; // "I" am the lowest
        }
        swap(arr, prev, candidate);
        prev = candidate;
    }
}
function bubbleUp(arr, startIdx, cmp) {
    console.assert(startIdx === arr.length - 1);
    // keep swapping with ancestors if the given item is smaller than them
    let cur = startIdx;
    while (cur > 0) {
        const par = parent(cur);
        if (cmp(arr[cur], arr[par]) < 0) {
            swap(arr, cur, par);
        }
        cur = par;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWluaGVhcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcnJheS9taW5oZWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQXFEO0FBRXJEOztHQUVHO0FBQ0gsTUFBYSxPQUFXLFNBQVEsb0JBQWE7SUFtQ3pDLFlBQW9CLEdBQTJCO1FBQzNDLEtBQUssRUFBRSxDQUFDO1FBRFEsUUFBRyxHQUFILEdBQUcsQ0FBd0I7UUFGdkMsUUFBRyxHQUFRLEVBQUUsQ0FBQztRQVN0QiwwRkFBMEY7UUFDbkYsUUFBRyxHQUFHLEdBQUcsRUFBRTtZQUNkLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQzdCLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQzlCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFBO1FBS0Q7OztXQUdHO1FBQ0ksZ0JBQVcsR0FBRyxHQUFHLEVBQUU7WUFDdEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGlEQUFpRDtZQUNoRSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDdkMsa0dBQWtHO2dCQUNsRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDM0I7WUFDRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUMsQ0FBQTtRQUVEOzs7V0FHRztRQUNJLGdCQUFXLEdBQUcsR0FB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

/***/ }),

/***/ "../myalgo-ts/dist/array/sortedList.js":
/*!*********************************************!*\
  !*** ../myalgo-ts/dist/array/sortedList.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const binarySearch_1 = __webpack_require__(/*! ../comparison/binarySearch */ "../myalgo-ts/dist/comparison/binarySearch.js");
const merge_1 = __webpack_require__(/*! ../comparison/merge */ "../myalgo-ts/dist/comparison/merge.js");
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * A sorted list, only valid as long as data mutation doesn't affect toKey()'s return values. It
 * performs lazy insertion, at the cost of other operations, which potentially leads binary merges (think merge sort).
 * Readings are as fast as binary search can offer.
 * Using this structure either if you need to frequent writes or freqent reads, but not both.
 */
class SortedList extends wrapper_1.MyIterable {
    constructor(toKey, cmp) {
        super();
        this.toKey = toKey;
        this.cmp = cmp;
        this.data = [];
        /**
         * Unsorted list of items to be inserted into this.data whenever necessary.
         */
        this.pendList = [];
        /**
         * Insert items into the list.
         */
        this.add = (...items) => {
            this.pendList.push(...items);
            return this;
        };
        this.has = (key) => {
            return this.search(key) !== undefined;
        };
        this.clone = () => SortedList.lightWrap(this.getData().slice(), this.toKey, this.cmp);
        this.slice = (start, end) => this.getData().slice(start, end);
        /**
         * Get everything from the target and above.
         */
        this.right = (key) => SortedList.lightWrap(right(this.getData(), key, this.toKey, this.cmp), this.toKey, this.cmp);
        /**
         * Get everything lower and equal to the target.
         */
        this.left = (key) => SortedList.lightWrap(left(this.getData(), key, this.toKey, this.cmp), this.toKey, this.cmp);
        /** Get items found by the boundary. If nothing is found, return an empty array. */
        this.get = (bound1, bound2) => {
            const r = bound2 === undefined ?
                this.search(bound1) :
                this.range(bound1, bound2);
            if (r === undefined) {
                return [];
            }
            const [low, high] = r;
            return this.slice(low, high + 1);
        };
        this.range = (bound1, bound2) => {
            if (this.isEmpty) {
                return undefined;
            }
            return binarySearch_1.binarySearchRange(this.getData(), bound1, bound2, this.toKey, this.cmp);
        };
        /** Count the number of elements within the boundary */
        this.countRange = (bound1, bound2) => {
            if (this.isEmpty) {
                return 0;
            }
            const r = bound2 === undefined ?
                this.search(bound1) :
                this.range(bound1, bound2);
            if (r === undefined) {
                return 0;
            }
            const [low, high] = r;
            const ret = high - low + 1;
            return ret;
        };
        /** Get an item by its index. Not sure how this is useful when the point of
         * this data structure is range search (with get()).
         */
        this.getAt = (idx) => {
            return this.getData()[idx];
        };
        /** Delete items specified by the index. */
        this.deleteAt = (idx, len = 1) => {
            console.assert(len >= 0);
            if (len >= 1) {
                if (idx >= 0 && idx < this.size) {
                    this.getData().splice(idx, len); // this.getData() would possibly perform sort and merge
                }
            }
            return this;
        };
        /**
         * Delete everything that equals item
         * @param key the target
         */
        this.delete = (key) => {
            if (this.isEmpty) {
                return this;
            }
            const data = this.getData();
            const range1 = binarySearch_1.binarySearch(data, key, this.toKey, this.cmp);
            if (range1 === undefined) {
                return this;
            }
            const [low, high] = range1;
            const len = high - low + 1;
            console.assert(len >= 1);
            data.splice(low, len);
            return this;
        };
        /**
         * Returns a range that contains the target and its duplicates
         * @param key the target
         */
        this.search = (key) => binarySearch_1.binarySearch(this.getData(), key, this.toKey, this.cmp);
        this.iterate = () => this.getData();
        this.getData = () => {
            if (this.pendList.length > 0) {
                const sortedPending = SortedList.sort(this.pendList, this.toKey, this.cmp);
                this.data = merge_1.mergeK(this.toKey, this.cmp, sortedPending, this.data);
                this.pendList = [];
            }
            return this.data;
        };
    }
    static wrap(data, toKey, cmp) {
        const sorted = SortedList.sort(Array.from(data), toKey, cmp);
        return SortedList.lightWrap(sorted, toKey, cmp);
    }
    static lightWrap(data, toKey, cmp) {
        const ret = new SortedList(toKey, cmp);
        ret.data = data;
        return ret;
    }
    static sort(data, toKey, cmp) {
        return data.sort((a, b) => cmp(toKey(a), toKey(b)));
    }
    get size() { return this.data.length + this.pendList.length; }
    get isEmpty() { return this.size === 0; }
}
exports.SortedList = SortedList;
function right(data, item, toKey, cmp) {
    if (data.length === 0) {
        return [];
    }
    const idx = binarySearch_1.lowerBound(data, item, toKey, cmp);
    return data.slice(idx);
}
function left(data, item, toKey, cmp) {
    if (data.length === 0) {
        return [];
    }
    const idx = binarySearch_1.upperBound(data, item, toKey, cmp);
    return data.slice(0, idx + 1);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGVkTGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcnJheS9zb3J0ZWRMaXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkRBQXFHO0FBQ3JHLCtDQUE2QztBQUM3Qyw2Q0FBNkM7QUFFN0M7Ozs7O0dBS0c7QUFDSCxNQUFhLFVBQWlCLFNBQVEsb0JBQWE7SUErQi9DLFlBQ1ksS0FBa0IsRUFDbEIsR0FBMkI7UUFFbkMsS0FBSyxFQUFFLENBQUM7UUFIQSxVQUFLLEdBQUwsS0FBSyxDQUFhO1FBQ2xCLFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBVC9CLFNBQUksR0FBUSxFQUFFLENBQUM7UUFFdkI7O1dBRUc7UUFDSyxhQUFRLEdBQVEsRUFBRSxDQUFDO1FBUzNCOztXQUVHO1FBQ0ksUUFBRyxHQUFHLENBQUMsR0FBRyxLQUFVLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQzdCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQTtRQUVNLFFBQUcsR0FBRyxDQUFDLEdBQU0sRUFBRSxFQUFFO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLENBQUM7UUFDMUMsQ0FBQyxDQUFBO1FBTU0sVUFBSyxHQUFHLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpGLFVBQUssR0FBRyxDQUFDLEtBQWMsRUFBRSxHQUFZLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRWxGOztXQUVHO1FBQ0ksVUFBSyxHQUFHLENBQUMsR0FB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

/***/ }),

/***/ "../myalgo-ts/dist/boundary.js":
/*!*************************************!*\
  !*** ../myalgo-ts/dist/boundary.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function reorder(bound1, bound2) {
    let low;
    let high;
    if (bound1 > bound2) {
        low = bound2;
        high = bound1;
    }
    else {
        low = bound1;
        high = bound2;
    }
    return [low, high];
}
/** Ensure the val is fixed between the boundaries. */
function clamp(val, bound1, bound2) {
    const [low, high] = reorder(bound1, bound2);
    return Math.min(high, Math.max(low, val));
}
exports.clamp = clamp;
/**
 *  Returns an indicator between 0 and 1 from the low side.
 *  Use 1-position to get an indicator from the high side.
 */
function position(cursor, bound1, bound2) {
    const [low, high] = reorder(bound1, bound2);
    const numerator = cursor - low;
    const denominator = high - low;
    if (numerator < 0) {
        return 0; // none
    }
    if (denominator === 0) {
        return 1; // infinity
    }
    return Math.min(1, numerator / denominator);
}
exports.position = position;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm91bmRhcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYm91bmRhcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFTLE9BQU8sQ0FBQyxNQUFjLEVBQUUsTUFBYztJQUMzQyxJQUFJLEdBQUcsQ0FBQztJQUNSLElBQUksSUFBSSxDQUFDO0lBQ1QsSUFBSSxNQUFNLEdBQUcsTUFBTSxFQUFFO1FBQ2pCLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDYixJQUFJLEdBQUcsTUFBTSxDQUFDO0tBQ2pCO1NBQU07UUFDSCxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQ2IsSUFBSSxHQUFHLE1BQU0sQ0FBQztLQUNqQjtJQUNELE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUVELHNEQUFzRDtBQUN0RCxTQUFnQixLQUFLLENBQUMsR0FBVyxFQUFFLE1BQWMsRUFBRSxNQUFjO0lBQzdELE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUhELHNCQUdDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsTUFBYztJQUNuRSxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUMvQixNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBRS9CLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtRQUNmLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTztLQUNwQjtJQUNELElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVc7S0FDeEI7SUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBWkQsNEJBWUMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/comparison/binarySearch.js":
/*!****************************************************!*\
  !*** ../myalgo-ts/dist/comparison/binarySearch.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function binsearchHelper(arr, target, toKey, cmp, low, high) {
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midVal = toKey(arr[mid]);
        const order = cmp(midVal, target);
        if (!Number.isFinite(order)) {
            throw new Error("cmp doesn't return finite number");
        }
        if (order < 0) {
            low = mid + 1;
        }
        else if (order > 0) {
            high = mid - 1;
        }
        else {
            return [mid, low, high];
        }
    }
    return [undefined, low, high];
}
function findLeft(arr, target, toKey, cmp, ret, oldLow) {
    let prev = ret;
    let prevLow = oldLow;
    while (true) {
        const rightMost = prev - 1;
        const [foundAt, low] = binsearchHelper(arr, target, toKey, cmp, prevLow, rightMost);
        if (foundAt === undefined) {
            return prev;
        }
        console.assert(foundAt <= rightMost); // i.e. progress
        prev = foundAt;
        prevLow = low;
    }
}
function findRight(arr, target, toKey, cmp, ret, oldHigh) {
    let prev = ret;
    let prevHigh = oldHigh;
    while (true) {
        const leftMost = prev + 1;
        const [foundAt, , high] = binsearchHelper(arr, target, toKey, cmp, leftMost, prevHigh);
        if (foundAt === undefined) {
            return prev;
        }
        console.assert(foundAt >= leftMost); // i.e. progress
        prev = foundAt;
        prevHigh = high;
    }
}
/**
 * Perform binary search for the first index that matches the target. If not
 * found, return 0 if target is less than every items in the array, otherwise arr.length.
 */
function lowerBound(arr, target, toKey, cmp) {
    if (arr.length === 0) {
        return 0;
    }
    const [foundAt, low] = binsearchHelper(arr, target, toKey, cmp, 0, arr.length - 1);
    if (foundAt === undefined) {
        return low;
    }
    return findLeft(arr, target, toKey, cmp, foundAt, low);
}
exports.lowerBound = lowerBound;
/**
 * Perform binary search for the last index that matches the target.
 * If not found, return 0 if target is less than every items in the array,
 * otherwise arr.length.
 */
function upperBound(arr, target, toKey, cmp) {
    if (arr.length === 0) {
        return 0;
    }
    const [foundAt, low, high] = binsearchHelper(arr, target, toKey, cmp, 0, arr.length - 1);
    if (foundAt === undefined) {
        return low;
    }
    return findRight(arr, target, toKey, cmp, foundAt, high);
}
exports.upperBound = upperBound;
/**
 * Binary search to get a range where the target is matched.
 */
function binarySearch(arr, target, toKey, cmp) {
    if (arr.length === 0) {
        return undefined;
    }
    // use binary search to find the duplicates
    {
        const [foundAt, low, high] = binsearchHelper(arr, target, toKey, cmp, 0, arr.length - 1);
        if (foundAt === undefined) {
            return undefined;
        }
        const lowFinal = findLeft(arr, target, toKey, cmp, foundAt, low);
        const highFinal = findRight(arr, target, toKey, cmp, foundAt, high);
        return [lowFinal, highFinal];
    }
}
exports.binarySearch = binarySearch;
/**
 * Test whether an item exist in the array. Just binary search.
 */
function binarySearchExist(arr, target, toKey, cmp) {
    if (arr.length === 0) {
        return undefined;
    }
    const [isFound] = binsearchHelper(arr, target, toKey, cmp, 0, arr.length - 1);
    return isFound !== undefined;
}
exports.binarySearchExist = binarySearchExist;
/**
 * Insert an item to a sorted array, search with binary search, O(n) due to copying.
 *  This algorithm mutates arr. This function mutates the array.
 */
function binaryInsert(arr, target, toKey, cmp) {
    if (arr.length === 0) {
        return [target];
    }
    const idx = lowerBound(arr, toKey(target), toKey, cmp);
    const empty = arr.splice(idx, 0, target);
    console.assert(empty.length === 0);
    return arr;
}
exports.binaryInsert = binaryInsert;
/**
 * Delete item and its duplicates from a sorted array.
 */
function binaryDelete(arr, item, toKey, cmp) {
    if (arr.length !== 0) {
        const range1 = binarySearch(arr, item, toKey, cmp);
        if (range1 !== undefined) {
            const [low, high] = range1;
            const len = high - low + 1;
            arr.splice(low, len);
        }
    }
    return arr;
}
exports.binaryDelete = binaryDelete;
/**
 * Perform a range search on a boundary fromed by bound1 and bound2. The order of bound1 and bound2 doesn't matter.
 */
function binarySearchRange(arr, bound1, bound2, toKey, cmp) {
    if (arr.length === 0) {
        return undefined;
    }
    let low;
    let high;
    const order = cmp(bound1, bound2);
    if (order < 0) {
        low = bound1;
        high = bound2;
    }
    else if (order > 0) {
        low = bound2;
        high = bound1;
    }
    else {
        // just binary search
        return binarySearch(arr, bound1, toKey, cmp);
    }
    const lowB = lowerBound(arr, low, toKey, cmp);
    let upperB = upperBound(arr, high, toKey, cmp);
    if (upperB === arr.length && arr.length > 0) {
        // upperBound finds the last index where high is located, but high is greater than all items in arr, so the upperbound is arr.length by definition. This method, on the other hand, return a range defined by 2 indices of the array.
        upperB = arr.length - 1;
    }
    console.assert(lowB <= upperB);
    return [lowB, upperB];
}
exports.binarySearchRange = binarySearchRange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5U2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBhcmlzb24vYmluYXJ5U2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsU0FBUyxlQUFlLENBQ3BCLEdBQVEsRUFDUixNQUFTLEVBQ1QsS0FBa0IsRUFDbEIsR0FBMkIsRUFDM0IsR0FBVyxFQUNYLElBQVk7SUFHWixPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUU7UUFDaEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN6QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUM7UUFDaEMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVsQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN6QixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7U0FDdkQ7UUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDWCxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztTQUNqQjthQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNsQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztTQUNsQjthQUFNO1lBQ0gsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDM0I7S0FDSjtJQUVELE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FDYixHQUFRLEVBQ1IsTUFBUyxFQUNULEtBQWtCLEVBQ2xCLEdBQTJCLEVBQzNCLEdBQVcsRUFDWCxNQUFjO0lBR2QsSUFB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

/***/ }),

/***/ "../myalgo-ts/dist/comparison/cmpList.js":
/*!***********************************************!*\
  !*** ../myalgo-ts/dist/comparison/cmpList.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** comparator of lists, compared item-by-item. */
function cmpList(cmp, as, bs) {
    const [cmpResult] = cmpListHelper(cmp, as, bs);
    return cmpResult;
}
exports.cmpList = cmpList;
function listEqual(cmp, as, bs) {
    return cmpList(cmp, as, bs) === 0;
}
exports.listEqual = listEqual;
/** Find the first index where as and bs diverge. */
function listDiff(cmp, as, bs) {
    const [, diffAt] = cmpListHelper(cmp, as, bs);
    return diffAt;
}
exports.listDiff = listDiff;
/** returns [comparator result, difference location (or undefined if both lists are equal)] */
function cmpListHelper(cmp, as, bs) {
    let i = 0;
    while (true) {
        if (i === as.length) {
            if (i === bs.length) {
                return [0, undefined]; // as and bs have same length, run out of items to compare
            }
            return [-1, i]; // as is shorter than bs and they share the same prefix
        }
        if (i === bs.length) {
            return [1, i]; // bs is shorter
        }
        const a = as[i];
        const b = bs[i];
        const cmpRet = cmp(a, b);
        if (cmpRet !== 0) {
            return [cmpRet, i];
        }
        ++i;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21wTGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wYXJpc29uL2NtcExpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBa0Q7QUFDbEQsU0FBZ0IsT0FBTyxDQUNuQixHQUEyQixFQUMzQixFQUFPLEVBQ1AsRUFBTztJQUVQLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQyxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBUEQsMEJBT0M7QUFFRCxTQUFnQixTQUFTLENBQ3JCLEdBQTJCLEVBQzNCLEVBQU8sRUFDUCxFQUFPO0lBRVAsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQU5ELDhCQU1DO0FBRUQsb0RBQW9EO0FBQ3BELFNBQWdCLFFBQVEsQ0FDcEIsR0FBMkIsRUFDM0IsRUFBTyxFQUNQLEVBQU87SUFFUCxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxhQUFhLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM5QyxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBUEQsNEJBT0M7QUFFRCw4RkFBOEY7QUFDOUYsU0FBUyxhQUFhLENBQ2xCLEdBQTJCLEVBQzNCLEVBQU8sRUFDUCxFQUFPO0lBRVAsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsT0FBTyxJQUFJLEVBQUU7UUFDVCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQywwREFBMEQ7YUFDcEY7WUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyx1REFBdUQ7U0FDMUU7UUFDRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0I7U0FDbEM7UUFFRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2QsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0QjtRQUNELEVBQUUsQ0FBQyxDQUFDO0tBQ1A7QUFDTCxDQUFDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/comparison/index.js":
/*!*********************************************!*\
  !*** ../myalgo-ts/dist/comparison/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./binarySearch */ "../myalgo-ts/dist/comparison/binarySearch.js"));
__export(__webpack_require__(/*! ./cmpList */ "../myalgo-ts/dist/comparison/cmpList.js"));
__export(__webpack_require__(/*! ./isSorted */ "../myalgo-ts/dist/comparison/isSorted.js"));
__export(__webpack_require__(/*! ./merge */ "../myalgo-ts/dist/comparison/merge.js"));
__export(__webpack_require__(/*! ./uniq */ "../myalgo-ts/dist/comparison/uniq.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcGFyaXNvbi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9DQUErQjtBQUMvQiwrQkFBMEI7QUFDMUIsZ0NBQTJCO0FBQzNCLDZCQUF3QjtBQUN4Qiw0QkFBdUIifQ==

/***/ }),

/***/ "../myalgo-ts/dist/comparison/isSorted.js":
/*!************************************************!*\
  !*** ../myalgo-ts/dist/comparison/isSorted.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Test if "it" is sorted in ascending order.
 */
function isSorted(it, cmp) {
    return wrapper_1.wrapIt(it)
        .pin((prev, cur) => cmp(prev, cur) <= 0)
        .every((x) => x);
}
exports.isSorted = isSorted;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXNTb3J0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcGFyaXNvbi9pc1NvcnRlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUF5QztBQUV6Qzs7R0FFRztBQUNILFNBQWdCLFFBQVEsQ0FBSSxFQUFlLEVBQUUsR0FBMkI7SUFDcEUsT0FBTyxnQkFBTSxDQUFDLEVBQUUsQ0FBQztTQUNaLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3ZDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUpELDRCQUlDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/comparison/merge.js":
/*!*********************************************!*\
  !*** ../myalgo-ts/dist/comparison/merge.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const minheap_1 = __webpack_require__(/*! ../array/minheap */ "../myalgo-ts/dist/array/minheap.js");
const binarySearch_1 = __webpack_require__(/*! ./binarySearch */ "../myalgo-ts/dist/comparison/binarySearch.js");
/**
 * The binary heap based, k-way merge algorithm of sorted lists. Merging 2
 * lists is specialized to either single-item insertion based on binary search,
 * or with multiple items merge sort's binary merge. This method doesn't mutate
 * its arguments.
 * @param toKey turn list items into values that are compared
 * @param cmp the comparator
 * @param lists a list of *sorted* lists of Ts
 */
function mergeK(toKey, cmp, ...lists) {
    const nonEmpty = lists.filter((list) => list.length > 0);
    switch (nonEmpty.length) {
        case 0:
            return [];
        case 1:
            return nonEmpty[0].slice();
        case 2:
            // merge a single item - use binary search
            const list0 = nonEmpty[0];
            const list1 = nonEmpty[1];
            if (list0.length === 1) {
                return binarySearch_1.binaryInsert(list1.slice(), list0[0], toKey, cmp);
            }
            if (list1.length === 1) {
                return binarySearch_1.binaryInsert(list0.slice(), list1[0], toKey, cmp);
            }
            // merge them directly, no need for the fancy loop below
            return Array.from(merge2(list0, list1, toKey, cmp));
    }
    // 3 or more lists -- use heap-based merge
    const heap = minheap_1.MinHeap.inPlaceWrap(([listA, idxA], [listB, idxB]) => cmp(toKey(listA[idxA]), toKey(listB[idxB])), nonEmpty.map((_, i) => [nonEmpty[i], 0]));
    const ret = [];
    while (true) {
        const [lst, idx] = heap.pop();
        ret.push(lst[idx]);
        const next = idx + 1;
        if (heap.size === 0) {
            return next < lst.length ?
                ret.concat(lst.slice(next)) :
                ret;
        }
        if (next < lst.length) {
            heap.add([lst, next]);
        }
    }
}
exports.mergeK = mergeK;
function merge2(sorted1, sorted2, toKey, cmp) {
    console.assert(sorted1.length > 0 && sorted2.length > 0); // this part is handled by mergeK
    let idx1 = 0;
    let idx2 = 0;
    const ret = [];
    while (true) {
        const t1 = sorted1[idx1];
        const t2 = sorted2[idx2];
        if (cmp(toKey(t1), toKey(t2)) < 0) {
            ret.push(t1);
            ++idx1;
        }
        else {
            ret.push(t2);
            ++idx2;
        }
        if (idx1 === sorted1.length) {
            return ret.concat(sorted2.slice(idx2));
        }
        if (idx2 === sorted2.length) {
            return ret.concat(sorted1.slice(idx1));
        }
    }
    // unreachable
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcGFyaXNvbi9tZXJnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEyQztBQUMzQyxpREFBOEM7QUFFOUM7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQixNQUFNLENBQ2xCLEtBQWtCLEVBQ2xCLEdBQTJCLEVBQzNCLEdBQUcsS0FBWTtJQUVmLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFekQsUUFBUSxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ3JCLEtBQUssQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO1FBQ2QsS0FBSyxDQUFDO1lBQ0YsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsS0FBSyxDQUFDO1lBQ0YsMENBQTBDO1lBQzFDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEIsT0FBTywyQkFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzVEO1lBQ0QsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDcEIsT0FBTywyQkFBWSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzVEO1lBRUQsd0RBQXdEO1lBQ3hELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxN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

/***/ }),

/***/ "../myalgo-ts/dist/comparison/uniq.js":
/*!********************************************!*\
  !*** ../myalgo-ts/dist/comparison/uniq.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const iter_1 = __webpack_require__(/*! ../iter */ "../myalgo-ts/dist/iter/index.js");
/**
 * Return a list of unique values from a sorted list of values in ascending order, based on the given comparator.
 * @param sortedVals a sorted list
 * @param cmp the comparator
 */
function uniq(sortedVals, cmp) {
    return iter_1.wrapIt(uniqHelper(sortedVals, cmp));
}
exports.uniq = uniq;
function* uniqHelper(sortedVals, cmp) {
    let isFirst = true;
    let cur;
    for (const val of sortedVals) {
        if (isFirst) {
            cur = val;
            isFirst = false;
            continue;
        }
        const order = cmp(val, cur);
        if (order > 0) {
            yield cur;
            cur = val;
        }
        else if (order < 0) {
            throw new Error("input iterable is not sorted in ascending order (based on cmp)");
        }
        // otherwise val and cur are equal
    }
    if (cur === undefined) {
        return;
    }
    yield cur; // either the last value is unique, or the previous value is not unique but haven't reported
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pcS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wYXJpc29uL3VuaXEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrQ0FBaUM7QUFFakM7Ozs7R0FJRztBQUNILFNBQWdCLElBQUksQ0FBSSxVQUF1QixFQUFFLEdBQTJCO0lBQ3hFLE9BQU8sYUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBRkQsb0JBRUM7QUFFRCxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUksVUFBdUIsRUFBRSxHQUEyQjtJQUV4RSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDbkIsSUFBSSxHQUFPLENBQUM7SUFDWixLQUFLLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRTtRQUUxQixJQUFJLE9BQU8sRUFBRTtZQUNULEdBQUcsR0FBRyxHQUFHLENBQUM7WUFDVixPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ2hCLFNBQVM7U0FDWjtRQUVELE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ1gsTUFBTSxHQUFHLENBQUM7WUFDVixHQUFHLEdBQUcsR0FBRyxDQUFDO1NBQ2I7YUFBTSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO1NBQ3JGO1FBQ0Qsa0NBQWtDO0tBQ3JDO0lBRUQsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1FBQ25CLE9BQU87S0FDVjtJQUVELE1BQU0sR0FBRyxDQUFDLENBQUMsNEZBQTRGO0FBQzNHLENBQUMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/graph/aStar.js":
/*!****************************************!*\
  !*** ../myalgo-ts/dist/graph/aStar.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const minheap_1 = __webpack_require__(/*! ../array/minheap */ "../myalgo-ts/dist/array/minheap.js");
const tuple_1 = __webpack_require__(/*! ../tuple */ "../myalgo-ts/dist/tuple.js");
/**
 * The A* pathfinding algorithm. If "to" is left undefined,
 * this method act as Dijkstra's algorithm, searching for all destinations from a single source.
 * @param vertices The set of vertices
 * @param neighbours The neighbours of a given vertex
 * @param weight The weight function, distance from vertex u to vertex v.
 * @param source The source
 * @param destination The destination, if any
 * @param heuristic The heuristic function for A*
 */
function aStar(vertices, neighbours, weight, source, heuristic = () => 0, ...destinations) {
    /*
    modified from https://www.redblobgames.com/pathfinding/a-star/introduction.html
        frontier = PriorityQueue()
        frontier.put(start, 0)
        came_from = {}
        cost_so_far = {}
        came_from[start] = None
        cost_so_far[start] = 0

        while not frontier.empty():
        current = frontier.get()

        if current == goal:
            break

        for next in graph.neighbors(current):
            new_cost = cost_so_far[current] + graph.cost(current, next)
            if next not in cost_so_far or new_cost < cost_so_far[next]:
                cost_so_far[next] = new_cost
                priority = new_cost + heuristic(goal, next)
                frontier.put(next, priority)
                came_from[next] = current
    */
    if (!vertices.has(source)) {
        throw new Error("source is not a node in the graph");
    }
    if (destinations.some((t) => !vertices.has(t))) {
        throw new Error("destination is not a node in the graph");
    }
    const allDest = new Set(destinations);
    if (allDest.has(source)) {
        console.assert(false, "source and destination are the same, what are you searching for?");
        return undefined;
    }
    const isDijkstra = destinations.length === 0;
    const distance = new Map([[source, 0]]);
    const parent = new Map();
    const frontier = minheap_1.MinHeap.heapify(([, a], [, b]) => a - b, tuple_1.makePair(source, 0));
    while (!frontier.isEmpty) {
        const [cur] = frontier.pop();
        if (allDest.has(cur)) {
            allDest.delete(cur);
            if (allDest.size === 0) {
                return { distance, parent };
            }
        }
        for (const next of neighbours(cur)) {
            const oldDist = distance.get(next);
            const curDist = distance.get(cur);
            console.assert(curDist !== undefined);
            const partDistance = weight(cur, next);
            console.assert(partDistance !== undefined);
            if (partDistance <= 0) {
                throw new Error("weight must be positive (for progress to happen)");
            }
            const newDist = curDist + partDistance;
            if (oldDist !== undefined && newDist >= oldDist) {
                continue;
            }
            distance.set(next, newDist);
            const estimate = !isDijkstra ?
                Math.min(...destinations.map((t) => heuristic(t, next))) :
                0;
            if (estimate < 0) {
                throw new Error("heuristic estimate should be non-negative");
            }
            const priority = newDist + estimate;
            frontier.add([next, priority]);
            parent.set(next, cur);
        }
    }
    // return something when doing all-destination search
    if (isDijkstra) {
        return { distance, parent };
    }
    // reach here when doing single-destination search but not found the destination
    return undefined;
}
exports.aStar = aStar;
/**
 * The A* pathfinding algorithm. If "to" is left undefined,
 * this method act as Dijkstra's algorithm, searching for all destinations from a single source.
 * @param graph The graph as adjacency list.
 * @param weight The weight function, distance from vertex u to vertex v.
 * @param source The source
 * @param destination The destination, if any
 * @param heuristic The heuristic function for A*
 */
function aStarAdjList(graph, weight, source, heuristic = () => 0, ...destinations) {
    return aStar(new Set(graph.keys()), (u) => graph.get(u), // aStar checks nullability
    weight, source, heuristic, ...destinations);
}
exports.aStarAdjList = aStarAdjList;
function extractPath(parent, source, destination) {
    let cur = destination;
    const ret = [];
    if (parent.get(cur) === undefined) {
        return undefined; // no valid path
    }
    while (true) {
        ret.push(cur);
        if (cur === source) {
            return ret;
        }
        cur = parent.get(cur);
    }
}
exports.extractPath = extractPath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYVN0YXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ3JhcGgvYVN0YXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBMkM7QUFFM0Msb0NBQW9DO0FBR3BDOzs7Ozs7Ozs7R0FTRztBQUNILFNBQWdCLEtBQUssQ0FDakIsUUFBZ0IsRUFDaEIsVUFBeUIsRUFDekIsTUFBOEIsRUFDOUIsTUFBUyxFQUNULFlBQW9DLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFDM0MsR0FBRyxZQUFpQjtJQUNwQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXNCRTtJQUVGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztLQUN4RDtJQUVELElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQzdEO0lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFdEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLGtFQUFrRSxDQUFDLENBQUM7UUFDMUYsT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFFRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQUM3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBWSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBUSxDQUFDO0lBRS9C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

/***/ }),

/***/ "../myalgo-ts/dist/graph/breadthFirstTraversal.js":
/*!********************************************************!*\
  !*** ../myalgo-ts/dist/graph/breadthFirstTraversal.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Breadth First, pre-order Traversal
 * @param root the root node
 * @param neighbours a function that return edges of a node
 * @param key turns a node into a unique value, needed if the neighbours
 *  are derived values instead of pointing to the actual nodes in the graph, then a key function must be provided.
 */
function bfsPreOrder(root, neighbours, maxDepth = Infinity) {
    return wrapper_1.wrapIt(bfsPreOrderHelper(root, neighbours, maxDepth));
}
exports.bfsPreOrder = bfsPreOrder;
function* bfsPreOrderHelper(root, neighbours, maxDepth) {
    const workList = [[root, 0]];
    const visited = new Set();
    while (workList.length > 0) {
        const [cur, depth] = workList.shift();
        yield [cur, depth];
        visited.add(cur);
        const depth1 = depth + 1;
        if (depth1 <= maxDepth) {
            for (const nei of neighbours(cur)) {
                if (!visited.has(nei)) {
                    visited.add(nei);
                    workList.push([nei, depth1]);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWR0aEZpcnN0VHJhdmVyc2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dyYXBoL2JyZWFkdGhGaXJzdFRyYXZlcnNhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUF5QztBQUV6Qzs7Ozs7O0dBTUc7QUFDSCxTQUFnQixXQUFXLENBQ3ZCLElBQU8sRUFDUCxVQUFzQyxFQUN0QyxRQUFRLEdBQUcsUUFBUTtJQUVuQixPQUFPLGdCQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUM7QUFORCxrQ0FNQztBQUVELFFBQVEsQ0FBQyxDQUFDLGlCQUFpQixDQUN2QixJQUFPLEVBQ1AsVUFBc0MsRUFDdEMsUUFBZ0I7SUFFaEIsTUFBTSxRQUFRLEdBQXVCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO0lBQzdCLE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDeEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFHLENBQUM7UUFDdkMsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDekIsSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFO1lBQ3BCLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDakIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUNoQzthQUNKO1NBQ0o7S0FDSjtBQUNMLENBQUMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/graph/depthFirstTraversal.js":
/*!******************************************************!*\
  !*** ../myalgo-ts/dist/graph/depthFirstTraversal.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Depth First, pre-order traversal
 * @param root the root node
 * @param neighbours a function that return edges of a node
 * @param isVisited a function that indicates whether a node is visited; optional if the graph is a tree
 * @param markVisited a function that marks a node as visited; optional if the graph is a tree
 */
function dfsPreOrder(root, neighbours) {
    return wrapper_1.wrapIt(dfsPreOrderHelper(root, neighbours));
}
exports.dfsPreOrder = dfsPreOrder;
function* dfsPreOrderHelper(root, neighbours) {
    const workList = [[root, 0]];
    const visited = new Set();
    while (workList.length > 0) {
        const [cur, depth] = workList.pop();
        if (!visited.has(cur)) {
            yield [cur, depth];
            visited.add(cur);
            const depth1 = depth + 1;
            for (const nei of neighbours(cur)) {
                workList.push([nei, depth1]);
            }
        }
    }
}
exports.dfsPreOrderHelper = dfsPreOrderHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwdGhGaXJzdFRyYXZlcnNhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaC9kZXB0aEZpcnN0VHJhdmVyc2FsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQXlDO0FBRXpDOzs7Ozs7R0FNRztBQUNILFNBQWdCLFdBQVcsQ0FDdkIsSUFBTyxFQUNQLFVBQXNDO0lBRXRDLE9BQU8sZ0JBQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBTEQsa0NBS0M7QUFFRCxRQUFlLENBQUMsQ0FBQyxpQkFBaUIsQ0FDOUIsSUFBTyxFQUNQLFVBQXNDO0lBRXRDLE1BQU0sUUFBUSxHQUF1QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUssQ0FBQztJQUU3QixPQUFPLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3hCLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqQixNQUFNLE1BQU0sR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMvQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDaEM7U0FDSjtLQUNKO0FBQ0wsQ0FBQztBQW5CRCw4Q0FtQkMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/graph/floydWarshall.js":
/*!************************************************!*\
  !*** ../myalgo-ts/dist/graph/floydWarshall.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * All-pair shortest paths, Floyd-Warshall algorithm
 * @see https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
 */
class FloydWarshall {
    constructor(graph, weight) {
        /*
        let dist be a |V| * |V| array of minimum distances initialized to Infinity
        let next be a |V| * |V| array of vertex indices initialized to null

        procedure FloydWarshallWithPathReconstruction ()
        for each edge (u,v)
            dist[u][v] ← w(u,v)  // the weight of the edge (u,v)
            next[u][v] ← v
        for k from 1 to |V| // standard Floyd-Warshall implementation
            for i from 1 to |V|
                for j from 1 to |V|
                    if dist[i][j] > dist[i][k] + dist[k][j] then
                    dist[i][j] ← dist[i][k] + dist[k][j]
                    next[i][j] ← next[i][k]
        */
        this.vertices = [...graph.keys()];
        this.verticesIdx = new Map(Array
            .from(this.vertices)
            .map((v, i) => [v, i]));
        const vSize = graph.size;
        const dist = new Array(vSize);
        // note: next is a reference to this.nextMap, which is a reference to a newly allocated array
        const next = this.nextMap = new Array(vSize);
        for (let i = 0; i < vSize; ++i) {
            dist[i] = new Array(vSize).fill(Infinity);
            next[i] = new Array(vSize);
            dist[i][i] = 0;
        }
        for (const [u, vs] of graph) {
            for (const v of vs) {
                const uIdx = this.verticesIdx.get(u);
                const vIdx = this.verticesIdx.get(v);
                dist[uIdx][vIdx] = weight(u, v);
                next[uIdx][vIdx] = vIdx;
            }
        }
        for (let k = 0; k < vSize; k++) {
            for (let i = 0; i < vSize; ++i) {
                for (let j = 0; j < vSize; j++) {
                    const distIncludeK = dist[i][k] + dist[k][j];
                    if (dist[i][j] > distIncludeK) {
                        dist[i][j] = distIncludeK;
                        next[i][j] = next[i][k];
                    }
                }
            }
        }
    }
    next(u, v) {
        const vIdx = this.verticesIdx.get(v);
        const uIdx = this.verticesIdx.get(u);
        const nextIdx = this.nextMap[uIdx][vIdx];
        if (nextIdx !== undefined) {
            return this.vertices[nextIdx];
        }
        return undefined;
    }
}
exports.FloydWarshall = FloydWarshall;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxveWRXYXJzaGFsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaC9mbG95ZFdhcnNoYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0E7OztHQUdHO0FBQ0gsTUFBYSxhQUFhO0lBTXRCLFlBQ0ksS0FBdUIsRUFDdkIsTUFBOEI7UUFFOUI7Ozs7Ozs7Ozs7Ozs7O1VBY0U7UUFDRixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUs7YUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFFekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQVcsS0FBSyxDQUFDLENBQUM7UUFFeEMsNkZBQTZGO1FBQzdGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxLQUFLLENBQVcsS0FBSyxDQUFDLENBQUM7UUFFdkQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO1FBRUQsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRTtZQUN6QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFFLENBQUM7Z0JBQ3RDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBRSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQzthQUMzQjtTQUNKO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFO2dCQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM1QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLEVBQUU7d0JBQzNCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUM7d0JBQzFCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzNCO2lCQUNKO2FBQ0o7U0FDSjtJQUNMLENBQUM7SUFFTSxJQUFJLENBQUMsQ0FBSSxFQUFFLENBQUk7UUFDbEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFFLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFFLENBQUM7UUFDdEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBMUVELHNDQTBFQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/graph/index.js":
/*!****************************************!*\
  !*** ../myalgo-ts/dist/graph/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./aStar */ "../myalgo-ts/dist/graph/aStar.js"));
__export(__webpack_require__(/*! ./breadthFirstTraversal */ "../myalgo-ts/dist/graph/breadthFirstTraversal.js"));
__export(__webpack_require__(/*! ./depthFirstTraversal */ "../myalgo-ts/dist/graph/depthFirstTraversal.js"));
__export(__webpack_require__(/*! ./floydWarshall */ "../myalgo-ts/dist/graph/floydWarshall.js"));
__export(__webpack_require__(/*! ./kruskalMST */ "../myalgo-ts/dist/graph/kruskalMST.js"));
__export(__webpack_require__(/*! ./stableMarriage */ "../myalgo-ts/dist/graph/stableMarriage.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ3JhcGgvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2QkFBd0I7QUFDeEIsNkNBQXdDO0FBRXhDLDJDQUFzQztBQUN0QyxxQ0FBZ0M7QUFDaEMsa0NBQTZCO0FBQzdCLHNDQUFpQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/graph/kruskalMST.js":
/*!*********************************************!*\
  !*** ../myalgo-ts/dist/graph/kruskalMST.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const unionfind_1 = __webpack_require__(/*! ../set/unionfind */ "../myalgo-ts/dist/set/unionfind.js");
/**
 * Minimum spanning tree, Kruskal's algorithm
 * @param vertices vertices
 * @param neighbours neighbours that forms an edge with a given vertex
 * @param weight the weight of each edge
 */
function kruskalMST(vertices, neighbours, weight) {
    /*
    https://en.wikipedia.org/wiki/Kruskal%27s_algorithm
    KRUSKAL(G):
    1 A = ∅
    2 foreach v ∈ G.V:
    3    MAKE-SET(v)
    4 foreach (u, v) in G.E ordered by weight(u, v), increasing:
    5    if FIND-SET(u) ≠ FIND-SET(v):
    6       A = A ∪ {(u, v)}
    7       UNION(u, v)
    8 return A
    */
    const sets = new unionfind_1.UnionFind();
    const edges = Array
        .from(vertices)
        .reduce((acc, u) => {
        for (const v of neighbours(u)) {
            acc.push([u, v]);
        }
        return acc;
    }, new Array())
        .sort(([u1, v1], [u2, v2]) => weight(u1, v1) - weight(u2, v2)); // sort by weight on ascending order
    const ret = new Map(Array
        .from(vertices)
        .map((v) => [v, []]));
    for (const [u, v] of edges) {
        if (!sets.isSameSet(u, v)) {
            ret.get(u).push(v);
            ret.get(v).push(u);
            sets.union(u, v);
        }
    }
    return ret;
}
exports.kruskalMST = kruskalMST;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3J1c2thbE1TVC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaC9rcnVza2FsTVNULnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0RBQTZDO0FBRzdDOzs7OztHQUtHO0FBQ0gsU0FBZ0IsVUFBVSxDQUN0QixRQUFnQixFQUNoQixVQUFzQyxFQUN0QyxNQUE4QjtJQUU5Qjs7Ozs7Ozs7Ozs7TUFXRTtJQUVGLE1BQU0sSUFBSSxHQUFHLElBQUkscUJBQVMsRUFBSyxDQUFDO0lBQ2hDLE1BQU0sS0FBSyxHQUFHLEtBQUs7U0FDZCxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ2QsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDLEVBQUUsSUFBSSxLQUFLLEVBQVUsQ0FBQztTQUN0QixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQ0FBb0M7SUFFeEcsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSztTQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ2QsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFcEMsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRTtRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDcEI7S0FDSjtJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQTFDRCxnQ0EwQ0MifQ==

/***/ }),

/***/ "../myalgo-ts/dist/graph/stableMarriage.js":
/*!*************************************************!*\
  !*** ../myalgo-ts/dist/graph/stableMarriage.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const minheap_1 = __webpack_require__(/*! ../array/minheap */ "../myalgo-ts/dist/array/minheap.js");
function setupCandidates(men, women) {
    const candidates = new Map();
    for (const [man, pref] of men) {
        const heap = minheap_1.MinHeap.inPlaceWrap((a, b) => pref(b) - pref(a), Array
            .from(women.keys())
            .filter((x) => pref(x) !== undefined));
        candidates.set(man, heap);
    }
    return candidates;
}
/**
 * Gale-Shapley Stable Marriage algorithm. Preference is a number ranking from highest to
 * lowest (say a=3.432, b=1, a has higher preference) or no preference (undefined).
 * Please make sure the preference function is pure (no side-effects), and ideally its
 * results are memoized by the caller.
 * @param men a map of all men and their preference (in a closure)
 * @param women a map of all women and their preference (in a closure)
 * @returns all matched couples, mapping women to men
 */
function stableMarriage(men, women) {
    const candidates = setupCandidates(men, women);
    const engaged = new Map();
    const freeMen = Array.from(men.keys());
    while (freeMen.length > 0) {
        const man = freeMen.pop();
        const priority = candidates.get(man);
        while (!priority.isEmpty) {
            const topWoman = priority.pop();
            const womanPref = women.get(topWoman);
            const aPref = womanPref(man);
            if (aPref === undefined) {
                // woman doesn't even consider man as a candidate
                continue;
            }
            // man is a valid candidate
            const prevMan = engaged.get(topWoman);
            // woman is free
            if (prevMan === undefined) {
                engaged.set(topWoman, man);
                break;
            }
            // woman is engaged
            const bPref = womanPref(prevMan); // to be engaged, woman must have a preference on prevMen
            if (aPref > bPref) {
                // current man replaces the previous one
                engaged.set(topWoman, man);
                freeMen.push(prevMan);
                break;
            }
            // woman rejects the man
        }
    }
    return engaged;
}
exports.stableMarriage = stableMarriage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhYmxlTWFycmlhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZ3JhcGgvc3RhYmxlTWFycmlhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBMkM7QUFHM0MsU0FBUyxlQUFlLENBQ3BCLEdBQTRELEVBQzVELEtBQTREO0lBRTVELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO0lBQ2xELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUU7UUFFM0IsTUFBTSxJQUFJLEdBQUcsaUJBQU8sQ0FBQyxXQUFXLENBQzVCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUUsRUFDN0IsS0FBSzthQUNBLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDbEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQzVDLENBQUM7UUFDRixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUM3QjtJQUNELE9BQU8sVUFBVSxDQUFDO0FBQ3RCLENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQWdCLGNBQWMsQ0FDMUIsR0FBNEQsRUFDNUQsS0FBNEQ7SUFHNUQsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQyxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBYyxDQUFDO0lBQ3RDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFFdkMsT0FBTyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUN2QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFHLENBQUM7UUFDM0IsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQztRQUN0QyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUN0QixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFHLENBQUM7WUFDakMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUUsQ0FBQztZQUN2QyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFN0IsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUNyQixpREFBaUQ7Z0JBQ2pELFNBQVM7YUFDWjtZQUNELDJCQUEyQjtZQUUzQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXRDLGdCQUFnQjtZQUNoQixJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixNQUFNO2FBQ1Q7WUFFRCxtQkFBbUI7WUFDbkIsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMseURBQXlEO1lBRTVGLElBQUksS0FBSyxHQUFHLEtBQUssRUFBRTtnQkFDZix3Q0FBd0M7Z0JBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QixNQUFNO2FBQ1Q7WUFFRCx3QkFBd0I7U0FDM0I7S0FDSjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ25CLENBQUM7QUE5Q0Qsd0NBOENDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/index.js":
/*!**********************************!*\
  !*** ../myalgo-ts/dist/index.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./array */ "../myalgo-ts/dist/array/index.js"));
__export(__webpack_require__(/*! ./boundary */ "../myalgo-ts/dist/boundary.js"));
__export(__webpack_require__(/*! ./comparison */ "../myalgo-ts/dist/comparison/index.js"));
__export(__webpack_require__(/*! ./graph */ "../myalgo-ts/dist/graph/index.js"));
__export(__webpack_require__(/*! ./iter */ "../myalgo-ts/dist/iter/index.js"));
__export(__webpack_require__(/*! ./map */ "../myalgo-ts/dist/map/index.js"));
__export(__webpack_require__(/*! ./math2D */ "../myalgo-ts/dist/math2D.js"));
__export(__webpack_require__(/*! ./memo */ "../myalgo-ts/dist/memo.js"));
__export(__webpack_require__(/*! ./mut */ "../myalgo-ts/dist/mut.js"));
__export(__webpack_require__(/*! ./numbers */ "../myalgo-ts/dist/numbers.js"));
__export(__webpack_require__(/*! ./rand */ "../myalgo-ts/dist/rand/index.js"));
__export(__webpack_require__(/*! ./set */ "../myalgo-ts/dist/set/index.js"));
__export(__webpack_require__(/*! ./tuple */ "../myalgo-ts/dist/tuple.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2QkFBd0I7QUFDeEIsZ0NBQTJCO0FBQzNCLGtDQUE2QjtBQUM3Qiw2QkFBd0I7QUFDeEIsNEJBQXVCO0FBQ3ZCLDJCQUFzQjtBQUN0Qiw4QkFBeUI7QUFDekIsNEJBQXVCO0FBQ3ZCLDJCQUFzQjtBQUN0QiwrQkFBMEI7QUFDMUIsNEJBQXVCO0FBQ3ZCLDJCQUFzQjtBQUN0Qiw2QkFBd0IifQ==

/***/ }),

/***/ "../myalgo-ts/dist/iter/combine.js":
/*!*****************************************!*\
  !*** ../myalgo-ts/dist/iter/combine.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ./wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Combine a list of iterators together, treating like a single one.
 * @param its a list of iterables
 */
function combine(...its) {
    return wrapper_1.wrapIt(combineHelper(its));
}
exports.combine = combine;
function* combineHelper(its) {
    for (const it of its) {
        for (const item of it) {
            yield item;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYmluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pdGVyL2NvbWJpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1Q0FBbUM7QUFFbkM7OztHQUdHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFJLEdBQUcsR0FBdUI7SUFDakQsT0FBTyxnQkFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFGRCwwQkFFQztBQUVELFFBQVEsQ0FBQyxDQUFDLGFBQWEsQ0FBSSxHQUF1QjtJQUM5QyxLQUFLLE1BQU0sRUFBRSxJQUFJLEdBQUcsRUFBRTtRQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLEVBQUUsRUFBRTtZQUNuQixNQUFNLElBQUksQ0FBQztTQUNkO0tBQ0o7QUFDTCxDQUFDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/iter/genBy.js":
/*!***************************************!*\
  !*** ../myalgo-ts/dist/iter/genBy.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ./wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Generate a sequence based on generator, infinite is left out count.
 * @param generator generator that creates values for the sequence
 * @param count number of items to generate
 */
function genBy(generator) {
    function* genByHelper() {
        for (let i = 0; true; ++i) {
            yield generator(i);
        }
    }
    return wrapper_1.wrapIt(genByHelper());
}
exports.genBy = genBy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuQnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaXRlci9nZW5CeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFtQztBQUVuQzs7OztHQUlHO0FBQ0gsU0FBZ0IsS0FBSyxDQUFJLFNBQTJCO0lBQ2hELFFBQVEsQ0FBQyxDQUFDLFdBQVc7UUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RCO0lBQ0wsQ0FBQztJQUNELE9BQU8sZ0JBQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFQRCxzQkFPQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/iter/index.js":
/*!***************************************!*\
  !*** ../myalgo-ts/dist/iter/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./combine */ "../myalgo-ts/dist/iter/combine.js"));
__export(__webpack_require__(/*! ./genBy */ "../myalgo-ts/dist/iter/genBy.js"));
__export(__webpack_require__(/*! ./repeat */ "../myalgo-ts/dist/iter/repeat.js"));
__export(__webpack_require__(/*! ./wrapper */ "../myalgo-ts/dist/iter/wrapper.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaXRlci9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLCtCQUEwQjtBQUUxQiw2QkFBd0I7QUFDeEIsOEJBQXlCO0FBQ3pCLCtCQUEwQiJ9

/***/ }),

/***/ "../myalgo-ts/dist/iter/repeat.js":
/*!****************************************!*\
  !*** ../myalgo-ts/dist/iter/repeat.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ./wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/** Repeat the given value indefinitely. */
function repeat(t) {
    return wrapper_1.wrapIt(repeatHelper(t));
}
exports.repeat = repeat;
function* repeatHelper(t) {
    while (true) {
        yield t;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwZWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2l0ZXIvcmVwZWF0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQW1DO0FBRW5DLDJDQUEyQztBQUMzQyxTQUFnQixNQUFNLENBQUksQ0FBSTtJQUMxQixPQUFPLGdCQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUZELHdCQUVDO0FBRUQsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFJLENBQUk7SUFDMUIsT0FBTyxJQUFJLEVBQUU7UUFDVCxNQUFNLENBQUMsQ0FBQztLQUNYO0FBQ0wsQ0FBQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/iter/wrapper.js":
/*!*****************************************!*\
  !*** ../myalgo-ts/dist/iter/wrapper.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function* map(it, mapper) {
    let i = 0;
    for (const t of it) {
        yield mapper(t, i);
        ++i;
    }
}
function* flatMap(it, mapper) {
    let i = 0;
    for (const t of it) {
        for (const u of mapper(t, i)) {
            yield u;
        }
        ++i;
    }
}
function reduce(it, reducer, base) {
    let acc = base;
    let i = 0;
    for (const t of it) {
        acc = reducer(acc, t, i);
        ++i;
    }
    return acc;
}
function* take(it, count) {
    let i = 0;
    for (const t of it) {
        if (i >= count) {
            break;
        }
        yield t;
        ++i;
    }
}
function every(it, pred) {
    let i = 0;
    for (const t of it) {
        if (!pred(t, i)) {
            return false;
        }
        ++i;
    }
    return true;
}
function some(it, pred) {
    let i = 0;
    for (const t of it) {
        if (pred(t, i)) {
            return true;
        }
        ++i;
    }
    return false;
}
function forEach(it, callBackFn) {
    let i = 0;
    for (const t of it) {
        if (callBackFn(t, i) === false) {
            return;
        }
        ++i;
    }
}
function* filter(it, pred) {
    let i = 0;
    for (const t of it) {
        if (pred(t, i)) {
            yield t;
        }
        ++i;
    }
}
function* pin(it, hammer) {
    let isFirst = true;
    let prev;
    for (const cur of it) {
        if (isFirst) {
            isFirst = false;
            prev = cur;
        }
        else {
            yield hammer(prev, cur);
            prev = cur;
        }
    }
}
function countHelper(it) {
    let i = 0;
    for (const _ of it) {
        ++i;
    }
    return i;
}
function first(it) {
    return wrapIt(it).take(1).collect()[0];
}
/**
 * Wraps an iterator with extra functionality.
 * @param it an iterator
 */
function wrapIt(it) {
    return {
        collect: () => Array.from(it),
        count: () => countHelper(it),
        every: (pred) => every(it, pred),
        filter: (pred) => wrapIt(filter(it, pred)),
        first: () => first(it),
        flatMap: (mapper) => wrapIt(flatMap(it, mapper)),
        forEach: (callBackFn) => forEach(it, callBackFn),
        map: (mapper) => wrapIt(map(it, mapper)),
        pin: (hammer) => wrapIt(pin(it, hammer)),
        reduce: (reducer, base) => reduce(it, reducer, base),
        some: (pred) => some(it, pred),
        take: (count) => wrapIt(take(it, count)),
        *[Symbol.iterator]() {
            for (const t of it) {
                yield t;
            }
        },
    };
}
exports.wrapIt = wrapIt;
/**
 * An abstract base class for all data structure from this library.
 */
class MyIterable {
    constructor() {
        this.collect = () => Array.from(this);
        this.count = () => countHelper(this);
        this.first = () => first(this);
        this.flatMap = (mapper) => wrapIt(flatMap(this, mapper));
        this.map = (mapper) => wrapIt(map(this, mapper));
        this.pin = (hammer) => wrapIt(pin(this, hammer));
        this.reduce = (reducer, base) => reduce(this, reducer, base);
        this.some = (pred) => some(this, pred);
        this.every = (pred) => every(this, pred);
        this.filter = (pred) => wrapIt(filter(this, pred));
        this.forEach = (callBackFn) => forEach(this, callBackFn);
        this.take = (count) => wrapIt(take(this, count));
    }
    *[Symbol.iterator]() {
        for (const t of this.iterate()) {
            yield t;
        }
    }
    get isEmpty() { return this.size === 0; }
}
exports.MyIterable = MyIterable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pdGVyL3dyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQU8sRUFBZSxFQUFFLE1BQThCO0lBQy9ELElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ2hCLE1BQU0sTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuQixFQUFFLENBQUMsQ0FBQztLQUNQO0FBQ0wsQ0FBQztBQUVELFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBTyxFQUFlLEVBQUUsTUFBd0M7SUFDN0UsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDaEIsS0FBSyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQzFCLE1BQU0sQ0FBQyxDQUFDO1NBQ1g7UUFDRCxFQUFFLENBQUMsQ0FBQztLQUNQO0FBQ0wsQ0FBQztBQUVELFNBQVMsTUFBTSxDQUFPLEVBQWUsRUFBRSxPQUF1QyxFQUFFLElBQU87SUFDbkYsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO0lBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDaEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDO0tBQ1A7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUksRUFBZSxFQUFFLEtBQWE7SUFDNUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1YsS0FBSyxNQUFNLENBQUMsSUFB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

/***/ }),

/***/ "../myalgo-ts/dist/map/bimap.js":
/*!**************************************!*\
  !*** ../myalgo-ts/dist/map/bimap.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Bi-direction map, based on two Map objects. Use this class for data that has a bijective relationship.
 */
class BiMap extends wrapper_1.MyIterable {
    constructor(...data) {
        super();
        this.iterate = () => {
            return this.leftMap.entries();
        };
        this.leftMap = new Map(data);
        this.rightMap = new Map(data.map(([t, u]) => [u, t]));
    }
    get size() {
        console.assert(this.leftMap.size === this.rightMap.size);
        return this.leftMap.size;
    }
    set(left, right) {
        this.leftMap.set(left, right);
        this.rightMap.set(right, left);
        return this;
    }
    delete(left) {
        const right = this.leftMap.get(left);
        return right !== undefined && this._delete(left, right);
    }
    deleteRight(right) {
        const left = this.rightMap.get(right);
        return left !== undefined && this._delete(left, right);
    }
    get(left) {
        return this.leftMap.get(left);
    }
    getLeft(right) {
        return this.rightMap.get(right);
    }
    has(left) {
        return this.leftMap.has(left);
    }
    hasRight(right) {
        return this.rightMap.has(right);
    }
    keys() {
        return this.leftMap.keys();
    }
    values() {
        return this.leftMap.values();
    }
    _delete(left, right) {
        const ret1 = this.leftMap.delete(left);
        const ret2 = this.rightMap.delete(right);
        console.assert(ret1);
        console.assert(ret2);
        return true;
    }
}
exports.BiMap = BiMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmltYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFwL2JpbWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQTZDO0FBRzdDOztHQUVHO0FBQ0gsTUFBYSxLQUNULFNBQVEsb0JBQWtCO0lBTTFCLFlBQVksR0FBRyxJQUFtQjtRQUM5QixLQUFLLEVBQUUsQ0FBQztRQWtERixZQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUE7UUFuREcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxJQUFXLElBQUk7UUFDWCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU0sR0FBRyxDQUFDLElBQU8sRUFBRSxLQUFRO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFPO1FBQ2pCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLE9BQU8sS0FBSyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sV0FBVyxDQUFDLEtBQVE7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTSxHQUFHLENBQUMsSUFBTztRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVNLE9BQU8sQ0FBQyxLQUFRO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLEdBQUcsQ0FBQyxJQUFPO1FBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sUUFBUSxDQUFDLEtBQVE7UUFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sSUFBSTtRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBTU8sT0FBTyxDQUFDLElBQU8sRUFBRSxLQUFRO1FBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFyRUQsc0JBcUVDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/map/dictionary.js":
/*!*******************************************!*\
  !*** ../myalgo-ts/dist/map/dictionary.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const trie_1 = __webpack_require__(/*! ./trie */ "../myalgo-ts/dist/map/trie.js");
class Dictionary {
    constructor() {
        this.dict = new trie_1.Trie();
    }
    set(s, key, val) {
        const fixed = fixString(s);
        for (const s2 of enumerateSubstr(fixed)) {
            this.dict
                .getOrSet(Array.from(s2), () => new Map())
                .set(key, val);
        }
        return this;
    }
    batchSet(s, results) {
        const fixed = fixString(s);
        for (const s2 of enumerateSubstr(fixed)) {
            const oldResults = this.dict
                .getOrSet(Array.from(s2), () => new Map());
            for (const [k, v] of results) {
                oldResults.set(k, v);
            }
        }
        return this;
    }
    search(s) {
        const fixed = fixString(s);
        const ret = this.dict.get(Array.from(fixed)) || new Map();
        return ret.entries();
    }
    delete(s, key) {
        const fixed = fixString(s);
        let ret = false;
        for (const s2 of enumerateSubstr(fixed)) {
            const search = this.dict.get(Array.from(s2));
            if (search !== undefined) {
                const check = search.delete(key);
                console.assert(ret && check); // otherwise inconsistent structure
                ret = true;
            }
        }
        return ret;
    }
}
exports.Dictionary = Dictionary;
function fixString(s) {
    return s
        .replace(/\s/g, "")
        .toLowerCase();
}
function* enumerateSubstr(s) {
    const n = s.length;
    for (let i = 0; i < n; i++) {
        for (let len = 1; len <= n - i; len++) {
            yield s.substr(i, len);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGljdGlvbmFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXAvZGljdGlvbmFyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUU5QixNQUFhLFVBQVU7SUFBdkI7UUFDWSxTQUFJLEdBQUcsSUFBSSxXQUFJLEVBQXVCLENBQUM7SUEyQ25ELENBQUM7SUF6Q1UsR0FBRyxDQUFDLENBQVMsRUFBRSxHQUFNLEVBQUUsR0FBTTtRQUNoQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0IsS0FBSyxNQUFNLEVBQUUsSUFBSSxlQUFlLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDckMsSUFBSSxDQUFDLElBQUk7aUJBQ0osUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztpQkFDekMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN0QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxRQUFRLENBQUMsQ0FBUyxFQUFFLE9BQWtCO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSTtpQkFDdkIsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLEtBQUssTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQzFCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3hCO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sTUFBTSxDQUFDLENBQVM7UUFDbkIsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzFELE9BQU8sR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxNQUFNLENBQUMsQ0FBUyxFQUFFLEdBQU07UUFDM0IsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztRQUNoQixLQUFLLE1BQU0sRUFBRSxJQUFJLGVBQWUsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLG1DQUFtQztnQkFDakUsR0FBRyxHQUFHLElBQUksQ0FBQzthQUNkO1NBQ0o7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQTVDRCxnQ0E0Q0M7QUFFRCxTQUFTLFNBQVMsQ0FBQyxDQUFTO0lBQ3hCLE9BQU8sQ0FBQztTQUNILE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1NBQ2xCLFdBQVcsRUFBRSxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxRQUFRLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBUztJQUMvQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDeEIsS0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUU7WUFDbkMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMxQjtLQUNKO0FBQ0wsQ0FBQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/map/groupBy.js":
/*!****************************************!*\
  !*** ../myalgo-ts/dist/map/groupBy.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function groupBy(it, keyFn) {
    const ret = new Map();
    for (const t of it) {
        const key = keyFn(t);
        let arr = ret.get(key);
        if (arr === undefined) {
            arr = [];
            ret.set(key, arr);
        }
        arr.push(t);
    }
    return ret;
}
exports.groupBy = groupBy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXBCeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXAvZ3JvdXBCeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFNBQWdCLE9BQU8sQ0FBTyxFQUFlLEVBQUUsS0FBa0I7SUFDN0QsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNoQixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7WUFDbkIsR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNULEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCO1FBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNmO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBWkQsMEJBWUMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/map/index.js":
/*!**************************************!*\
  !*** ../myalgo-ts/dist/map/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./bimap */ "../myalgo-ts/dist/map/bimap.js"));
__export(__webpack_require__(/*! ./dictionary */ "../myalgo-ts/dist/map/dictionary.js"));
__export(__webpack_require__(/*! ./groupBy */ "../myalgo-ts/dist/map/groupBy.js"));
__export(__webpack_require__(/*! ./join */ "../myalgo-ts/dist/map/join.js"));
__export(__webpack_require__(/*! ./sortedTrie */ "../myalgo-ts/dist/map/sortedTrie.js"));
__export(__webpack_require__(/*! ./trie */ "../myalgo-ts/dist/map/trie.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFwL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQXdCO0FBRXhCLGtDQUE2QjtBQUM3QiwrQkFBMEI7QUFDMUIsNEJBQXVCO0FBQ3ZCLGtDQUE2QjtBQUM3Qiw0QkFBdUIifQ==

/***/ }),

/***/ "../myalgo-ts/dist/map/join.js":
/*!*************************************!*\
  !*** ../myalgo-ts/dist/map/join.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const combine_1 = __webpack_require__(/*! ../iter/combine */ "../myalgo-ts/dist/iter/combine.js");
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
const intersect_1 = __webpack_require__(/*! ../set/intersect */ "../myalgo-ts/dist/set/intersect.js");
const tuple_1 = __webpack_require__(/*! ../tuple */ "../myalgo-ts/dist/tuple.js");
function combineByKeys(keys, maps, combinator) {
    return new Map(wrapper_1.wrapIt(keys)
        .map((key) => {
        const v = combinator(...wrapper_1.wrapIt(maps)
            .map((map) => map.get(key))
            .filter((val) => val !== undefined));
        return tuple_1.makePair(key, v);
    }));
}
/**
 * Think of this as the full outer join in SQL.
 */
function outerJoin(combinator, ...maps) {
    const keys = new Set(combine_1.combine(...maps.map((map) => map.keys())));
    return combineByKeys(keys, maps, combinator);
}
exports.outerJoin = outerJoin;
/** Think of this as SQL's left join. */
function leftJoin(combinator, leftMap, ...rightMaps) {
    const keys = leftMap.keys();
    return combineByKeys(keys, [leftMap, ...rightMaps], combinator);
}
exports.leftJoin = leftJoin;
/** Think of this as SQL's inner join. */
function innerJoin(combinator, ...maps) {
    const keys = intersect_1.intersect(...maps.map((map) => new Set(map.keys())));
    return combineByKeys(keys, maps, combinator);
}
exports.innerJoin = innerJoin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiam9pbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXAvam9pbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEwQztBQUMxQyw2Q0FBeUM7QUFDekMsZ0RBQTZDO0FBQzdDLG9DQUFvQztBQUdwQyxTQUFTLGFBQWEsQ0FDbEIsSUFBaUIsRUFDakIsSUFBa0MsRUFDbEMsVUFBNkI7SUFFN0IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxnQkFBTSxDQUFDLElBQUksQ0FBQztTQUN0QixHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtRQUNULE1BQU0sQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLGdCQUFNLENBQUMsSUFBSSxDQUFDO2FBQy9CLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQzthQUMzQixNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNaLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLFNBQVMsQ0FDckIsVUFBNkIsRUFDN0IsR0FBRyxJQUErQjtJQUVsQyxNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQU5ELDhCQU1DO0FBRUQsd0NBQXdDO0FBQ3hDLFNBQWdCLFFBQVEsQ0FDcEIsVUFBNkIsRUFDN0IsT0FBMkIsRUFDM0IsR0FBRyxTQUFvQztJQUV2QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsT0FBTyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsU0FBUyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQVBELDRCQU9DO0FBRUQseUNBQXlDO0FBQ3pDLFNBQWdCLFNBQVMsQ0FDckIsVUFBNkIsRUFDN0IsR0FBRyxJQUErQjtJQUVsQyxNQUFNLElBQUksR0FBRyxxQkFBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQU5ELDhCQU1DIn0=

/***/ }),

/***/ "../myalgo-ts/dist/map/sortedTrie.js":
/*!*******************************************!*\
  !*** ../myalgo-ts/dist/map/sortedTrie.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const cmpList_1 = __webpack_require__(/*! ../comparison/cmpList */ "../myalgo-ts/dist/comparison/cmpList.js");
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
const trie_1 = __webpack_require__(/*! ./trie */ "../myalgo-ts/dist/map/trie.js");
/**
 * A variant of Trie, where keys are list of 1 type and sorted by a comparator.
 * A use case is if you have an adjacency list of undirected graphs
 * and you want to store their edges (say, u->v and v->u) without duplicates.
 */
class SortedTrie extends wrapper_1.MyIterable {
    constructor(cmp, ...list) {
        super();
        this.cmp = cmp;
        this.get = (key) => {
            return this.data.get(SortedTrie.sortKey(this.cmp, key));
        };
        this.has = (key) => this.data.has(SortedTrie.sortKey(this.cmp, key));
        this.delete = (key) => {
            return this.data.delete(SortedTrie.sortKey(this.cmp, key));
        };
        this.set = (key, val) => {
            return this.data.set(SortedTrie.sortKey(this.cmp, key), val);
        };
        this.getOrSet = (key, setter) => {
            return this.data.getOrSet(SortedTrie.sortKey(this.cmp, key), setter);
        };
        this.keys = () => {
            return wrapper_1.wrapIt(this.iterate())
                .map(([key]) => key);
        };
        this.values = () => {
            return wrapper_1.wrapIt(this.iterate())
                .map(([, val]) => val);
        };
        /** Create a new sorted trie with the same comparator as this instance (use this when you usually want clear()). */
        this.makeEmpty = () => {
            return new SortedTrie(this.cmp);
        };
        this.iterate = () => {
            return SortedTrie.iterateHelper(this.cmp, this.data);
        };
        this.data = new trie_1.Trie(...list.map(([key, val]) => [
            SortedTrie.sortKey(cmp, key),
            val,
        ]));
    }
    static *iterateHelper(cmp, data) {
        const sorted = Array.from(data).sort(([a], [b]) => cmpList_1.cmpList(cmp, a, b));
        for (const item of sorted) {
            yield item;
        }
    }
    get size() { return this.data.size; }
    get isEmpty() { return this.size === 0; }
}
SortedTrie.sortKey = (cmp, key) => {
    return key.slice().sort(cmp);
};
exports.SortedTrie = SortedTrie;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGVkVHJpZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXAvc29ydGVkVHJpZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUFnRDtBQUNoRCw2Q0FBcUQ7QUFDckQsaUNBQThCO0FBRTlCOzs7O0dBSUc7QUFDSCxNQUFhLFVBQWlDLFNBQVEsb0JBQW1CO0lBaUJyRSxZQUNZLEdBQTJCLEVBQ25DLEdBQUcsSUFBb0I7UUFDdkIsS0FBSyxFQUFFLENBQUM7UUFGQSxRQUFHLEdBQUgsR0FBRyxDQUF3QjtRQWFoQyxRQUFHLEdBQUcsQ0FBQyxHQUFPLEVBQUUsRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVELENBQUMsQ0FBQTtRQUVNLFFBQUcsR0FBRyxDQUFDLEdBQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFcEUsV0FBTSxHQUFHLENBQUMsR0FBTyxFQUFFLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUE7UUFFTSxRQUFHLEdBQUcsQ0FBQyxHQUFPLEVBQUUsR0FBTSxFQUFFLEVBQUU7WUFDN0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakUsQ0FBQyxDQUFBO1FBRU0sYUFBUSxHQUFHLENBQUMsR0FBTyxFQUFFLE1BQWUsRUFBRSxFQUFFO1lBQzNDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pFLENBQUMsQ0FBQTtRQUVNLFNBQUksR0FBRyxHQUFHLEVBQUU7WUFDZixPQUFPLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUN4QixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUE7UUFFTSxXQUFNLEdBQUcsR0FBRyxFQUFFO1lBQ2pCLE9BQU8sZ0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQ3hCLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFBO1FBRUQsbUhBQW1IO1FBQzVHLGNBQVMsR0FBRyxHQUFHLEVBQUU7WUFDcEIsT0FBTyxJQUFJLFVBQVUsQ0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFBO1FBRVMsWUFBTyxHQUFHLEdBQUcsRUFBRTtZQUNyQixPQUFPLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFBO1FBN0NHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxXQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQVcsRUFBRSxDQUFDO1lBQ3RELFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUM1QixHQUFHO1NBQ04sQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBakJPLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBdUIsR0FBMkIsRUFBRSxJQUFpQjtRQUM5RixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsaUJBQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkUsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLEVBQUU7WUFDdkIsTUFBTSxJQUFJLENBQUM7U0FDZDtJQUNMLENBQUM7SUFjRCxJQUFXLElBQUksS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUU1QyxJQUFXLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUEzQmpDLGtCQUFPLEdBQUcsQ0FDckIsR0FBMkIsRUFDM0IsR0FBTyxFQUFNLEVBQUU7SUFDZixPQUFPLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFPLENBQUM7QUFDdkMsQ0FBQyxDQUFBO0FBTkwsZ0NBbUVDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/map/trie.js":
/*!*************************************!*\
  !*** ../myalgo-ts/dist/map/trie.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const depthFirstTraversal_1 = __webpack_require__(/*! ../graph/depthFirstTraversal */ "../myalgo-ts/dist/graph/depthFirstTraversal.js");
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
const tuple_1 = __webpack_require__(/*! ../tuple */ "../myalgo-ts/dist/tuple.js");
function* entries(root) {
    /*
     * A big chunk of this method deals with key reconstruction.
     * Remember, the keys are stored as "characters" on each node.
     * With pre-order depth-first traversal, a node (say, A)
     * - would report itself first
     * - then A's first children
     * - then A's first children's descendents
     * - finally A's other children
     * In other words, the prefix of a key share common ancestors with their children,
     * and we can just pop off suffixes back to the key of A and use it for A's children.
     */
    const allNodes = depthFirstTraversal_1.dfsPreOrder(root, (me) => me.next.values());
    const key = [];
    let curDepth = 0;
    for (const [node, depth] of allNodes) {
        // recover the parent's key
        const depthDiff = curDepth - depth;
        for (let i = 0; i < depthDiff; ++i) {
            key.pop();
            curDepth--;
        }
        if (node.keyChar !== undefined) {
            key.push(node.keyChar);
        }
        else {
            // the root node (empty) is the only node that can have no character; otherwise DFS would
            // stop traversing instead of reporting the "leafs" nodes
            console.assert(depth === 0);
        }
        ++curDepth;
        if (node.val !== undefined) {
            yield tuple_1.makePair(key.slice(), node.val);
        }
    }
}
/**
 * Trie data structure whose keys can either be a tuple or an array.
 */
class Trie extends wrapper_1.MyIterable {
    constructor(...list) {
        super();
        this.root = { next: new Map() };
        this.trieSize = 0;
        this.get = (key) => {
            const node = this.traverse(key);
            return node === undefined ? undefined : node.val;
        };
        this.has = (key) => this.get(key) !== undefined;
        this.delete = (key) => {
            const ancestors = [];
            const node = this.traverse(key, (kc, n) => ancestors.push([kc, n]));
            if (node === undefined || node.val === undefined) {
                return false;
            }
            --this.trieSize;
            // clean up unused structure
            let cur = node;
            for (let i = ancestors.length - 1; i >= 0; i--) {
                // current node is still in used by other keys
                if (cur.next.size !== 0) {
                    break;
                }
                // otherwise delete the current (unused) structure
                const [kc, parent] = ancestors[i];
                console.assert(parent.next.size > 0);
                parent.next.delete(kc);
                cur = parent;
            }
            return true;
        };
        this.set = (key, val) => {
            let temp = this.root;
            key.forEach((keyChar) => {
                if (keyChar === undefined) {
                    throw new Error("undefined not allowed as part of the key");
                }
                let next = temp.next.get(keyChar);
                if (next === undefined) {
                    next = { next: new Map() };
                    temp.next.set(keyChar, next);
                    // fall-through
                }
                next.keyChar = keyChar;
                temp = next;
            });
            temp.val = val;
            ++this.trieSize;
            return this;
        };
        this.getOrSet = (key, setter) => {
            let cur = this.root;
            if (key.some((c) => c === undefined)) {
                throw new Error("undefined is not allowed to be part of the key");
            }
            for (const curChar of key) {
                let next = cur.next.get(curChar);
                if (next === undefined) {
                    next = { next: new Map() };
                    cur.next.set(curChar, next);
                    // fall-through
                }
                next.keyChar = curChar;
                cur = next;
            }
            if (cur.val === undefined) {
                cur.val = setter();
                ++this.trieSize;
            }
            return cur.val;
        };
        this.keys = () => {
            return wrapper_1.wrapIt(entries(this.root))
                .map(([key]) => key);
        };
        this.values = () => {
            return wrapper_1.wrapIt(entries(this.root))
                .map(([, val]) => val);
        };
        /** Get the number of children for a given key (only useful when the key is an array). */
        this.getFanout = (key) => {
            const node = this.traverse(key);
            if (node) {
                return node.next.size;
            }
            return 0;
        };
        this.iterate = () => {
            return entries(this.root);
        };
        this.traverse = (key, visit = () => { }) => {
            let cur = this.root;
            for (const keyChar of key) {
                const temp = cur.next.get(keyChar);
                if (temp === undefined) {
                    return undefined;
                }
                visit(keyChar, cur);
                cur = temp;
            }
            return cur;
        };
        for (const [k, v] of list) {
            this.set(k, v);
        }
    }
    /** Return the number of items the trie */
    get size() { return this.trieSize; }
    get isEmpty() { return this.size === 0; }
}
exports.Trie = Trie;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJpZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXAvdHJpZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNFQUEyRDtBQUMzRCw2Q0FBcUQ7QUFDckQsb0NBQW9DO0FBU3BDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBcUIsSUFBcUI7SUFFdkQ7Ozs7Ozs7Ozs7T0FVRztJQUVILE1BQU0sUUFBUSxHQUFHLGlDQUFXLENBQ3hCLElBQUksRUFDSixDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FDM0IsQ0FBQztJQUVGLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNqQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksUUFBUSxFQUFFO1FBRWxDLDJCQUEyQjtRQUMzQixNQUFNLFNBQVMsR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDaEMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1YsUUFBUSxFQUFFLENBQUM7U0FDZDtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUU7WUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUI7YUFBTTtZQUNILHlGQUF5RjtZQUN6Rix5REFBeUQ7WUFDekQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDL0I7UUFDRCxFQUFFLFFBQVEsQ0FBQztRQUVYLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxTQUFTLEVBQUU7WUFDeEIsTUFBTSxnQkFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQU8sRUFBRSxJ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

/***/ }),

/***/ "../myalgo-ts/dist/math2D.js":
/*!***********************************!*\
  !*** ../myalgo-ts/dist/math2D.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function equal([ax, ay], [bx, by]) {
    return ax === bx && ay === by;
}
exports.equal = equal;
function compare([ax, ay], [bx, by]) {
    if (ax < bx) {
        return -1;
    }
    if (ax > bx) {
        return 1;
    }
    return ay - by;
}
exports.compare = compare;
function subtract([ax, ay], [bx, by]) {
    return [ax - bx, ay - by];
}
exports.subtract = subtract;
function add([ax, ay], [bx, by]) {
    return [ax + bx, ay + by];
}
exports.add = add;
function norm([ax, ay]) {
    return Math.sqrt(ax * ax + ay * ay);
}
exports.norm = norm;
function distance(a, b) {
    return norm(subtract(a, b));
}
exports.distance = distance;
function scalarMult([ax, ay], scalar) {
    return [scalar * ax, scalar * ay];
}
exports.scalarMult = scalarMult;
function manhattanDistance(a, b) {
    const [cx, cy] = subtract(a, b);
    return Math.abs(cx) + Math.abs(cy);
}
exports.manhattanDistance = manhattanDistance;
/** Calculate the projection of a vector by a scalar. */
function project(a, scalar = 1) {
    const n = norm(a);
    console.assert(n !== 0, "caller make sure the given vector is not the origin");
    return scalarMult(a, scalar / n);
}
exports.project = project;
/** Calculate the determinant of a 2D matric. */
function determinant([ax, ay], [bx, by]) {
    return ax * by - bx * ay;
}
exports.determinant = determinant;
function dot([ax, ay], [bx, by]) {
    return ax * bx + ay + by;
}
exports.dot = dot;
/** Test whether a point P is in the rectangle defined by points A and B. */
function isPointInRect([px, py], [ax, ay], [bx, by]) {
    const maxX = Math.max(ax, bx);
    const minX = Math.min(ax, bx);
    const maxY = Math.max(ay, by);
    const minY = Math.min(ay, by);
    return px <= maxX && px >= minX && py <= maxY && py >= minY;
}
exports.isPointInRect = isPointInRect;
// turn this to const enum after this is fixed: https://github.com/Microsoft/TypeScript/issues/16671
var IntersectionKind;
(function (IntersectionKind) {
    IntersectionKind[IntersectionKind["None"] = 0] = "None";
    IntersectionKind[IntersectionKind["Tangent"] = 1] = "Tangent";
    IntersectionKind[IntersectionKind["Intersection"] = 2] = "Intersection";
})(IntersectionKind = exports.IntersectionKind || (exports.IntersectionKind = {}));
/**
 * Test whether a given infinite line, defined by a & b, intersects a circle.
 * @param a a point in the line segment
 * @param b another point in the line segment
 * @param c the center of the target circle
 * @param r the target circle's radius
 * @see https://math.stackexchange.com/a/2035466
 * @see http://mathworld.wolfram.com/Circle-LineIntersection.html
 */
function testLineCircleIntersect(a, b, c, r) {
    // translate a and b by c, to simplify the problem to testing a line to a circle centered around the origin
    const ta = subtract(a, c);
    const tb = subtract(b, c);
    const dr = distance(a, b);
    const dr2 = dr * dr;
    const r2 = r * r;
    const det = determinant(ta, tb);
    const det2 = det * det;
    const discriminant = r2 * dr2 - det2;
    if (discriminant < 0) {
        return IntersectionKind.None;
    }
    else if (discriminant > 0) {
        return IntersectionKind.Intersection;
    }
    else {
        return IntersectionKind.Tangent;
    }
}
exports.testLineCircleIntersect = testLineCircleIntersect;
/**
 * Test whether a given finite line segment, defined by a & b, intersects a circle.
 * @param a a point in the line segment
 * @param b another point in the line segment
 * @param c the center of the target circle
 * @param r the target circle's radius
 */
function testLineSegmentCircleIntersect(a, b, c, r) {
    // for finite line segments, test whether the center is within the rectangle defined by a,b
    if (!isPointInRect(c, a, b)) {
        return IntersectionKind.None;
    }
    return testLineCircleIntersect(a, b, c, r);
}
exports.testLineSegmentCircleIntersect = testLineSegmentCircleIntersect;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aDJELmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hdGgyRC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLFNBQWdCLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQVE7SUFDbEQsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDbEMsQ0FBQztBQUZELHNCQUVDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUTtJQUNwRCxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0tBQUU7SUFDM0IsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQUUsT0FBTyxDQUFDLENBQUM7S0FBRTtJQUMxQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQUpELDBCQUlDO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUTtJQUNyRCxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUZELDRCQUVDO0FBRUQsU0FBZ0IsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUTtJQUNoRCxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQUZELGtCQUVDO0FBRUQsU0FBZ0IsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBUTtJQUNoQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxH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

/***/ }),

/***/ "../myalgo-ts/dist/memo.js":
/*!*********************************!*\
  !*** ../myalgo-ts/dist/memo.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Memoization
 * @param genVal generator whose values will be memoized
 */
function memo(genVal) {
    const memory = new Map();
    return (target) => {
        if (!memory.has(target)) {
            const val = genVal(target);
            memory.set(target, val);
            // fall-through
        }
        return memory.get(target);
    };
}
exports.memo = memo;
/**
 * Similar to memo(), expect the target would generate a range of values through genRange,
 * based on keys derived from keyBy.
 * @param genRange generate a range of values to be memoized, the values for
 *  one key must be disjoint from those of other keys
 * @param keyBy derive keys for genRange()
 */
function memoBy(genRange, keyBy) {
    const memory = new Map();
    return (target) => {
        if (!memory.has(target)) {
            const key = keyBy(target);
            for (const [s, u] of genRange(key)) {
                if (memory.has(s)) {
                    throw new Error("genRange keys overlap (all keys from keyBy must be mapped to disjoint sets");
                }
                memory.set(s, u);
            }
            if (!memory.has(target)) {
                throw new Error("genRange doesn't cover the target");
            }
            // fall-through
        }
        return memory.get(target);
    };
}
exports.memoBy = memoBy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW1vLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7OztHQUdHO0FBQ0gsU0FBZ0IsSUFBSSxDQUFPLE1BQXFCO0lBQzVDLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFRLENBQUM7SUFDL0IsT0FBTyxDQUFDLE1BQVMsRUFBSyxFQUFFO1FBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN4QixlQUFlO1NBQ2xCO1FBQ0QsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBTSxDQUFDO0lBQ25DLENBQUMsQ0FBQztBQUNOLENBQUM7QUFWRCxvQkFVQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLE1BQU0sQ0FBVSxRQUF3QyxFQUFFLEtBQWtCO0lBQ3hGLE1BQU0sTUFBTSxHQUFHLElBQUksR0FBRyxFQUFRLENBQUM7SUFDL0IsT0FBTyxDQUFDLE1BQVMsRUFBSyxFQUFFO1FBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixLQUFLLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNoQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO2lCQUNqRztnQkFDRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNwQjtZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7YUFDeEQ7WUFDRCxlQUFlO1NBQ2xCO1FBQ0QsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBTSxDQUFDO0lBQ25DLENBQUMsQ0FBQztBQUNOLENBQUM7QUFsQkQsd0JBa0JDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/mut.js":
/*!********************************!*\
  !*** ../myalgo-ts/dist/mut.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// mutation library
Object.defineProperty(exports, "__esModule", { value: true });
function getAndSum(map, key, val) {
    const prev = map.get(key) || 0;
    const next = prev + val;
    map.set(key, next);
    return next;
}
exports.getAndSum = getAndSum;
function updateMap(map, key, updater) {
    const prev = map.get(key);
    const next = updater(prev);
    map.set(key, next);
    return next;
}
exports.updateMap = updateMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL211dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsbUJBQW1COztBQUVuQixTQUFnQixTQUFTLENBQUksR0FBbUIsRUFBRSxHQUFNLEVBQUUsR0FBVztJQUNqRSxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25CLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFMRCw4QkFLQztBQUVELFNBQWdCLFNBQVMsQ0FBTyxHQUFjLEVBQUUsR0FBTSxFQUFFLE9BQXdCO0lBQzVFLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDMUIsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25CLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFMRCw4QkFLQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/numbers.js":
/*!************************************!*\
  !*** ../myalgo-ts/dist/numbers.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const join_1 = __webpack_require__(/*! ./map/join */ "../myalgo-ts/dist/map/join.js");
/**
 * Negates all values in the map.
 */
function negate(map) {
    const ret = new Map();
    for (const [key, qty] of map) {
        ret.set(key, -qty);
    }
    return ret;
}
exports.negate = negate;
/**
 * Sum all numbers together
 * @param it a sequence of numbers
 */
function sum(...args) {
    let ret = 0;
    for (const num of args) {
        ret += num;
    }
    return ret;
}
exports.sum = sum;
/** Calculate the average of given numbers. */
function average(arg1, ...args) {
    return (arg1 + sum(...args)) / (args.length + 1);
}
exports.average = average;
/**
 * Map each item to a number and then sum them up together.
 */
function sumBy(mapper, it) {
    let ret = 0;
    for (const t of it) {
        ret += mapper(t);
    }
    return ret;
}
exports.sumBy = sumBy;
/**
 * Accumulate the sum of of maps by the key.
 * @param maps maps of T->number
 */
function sumMaps(...maps) {
    return join_1.outerJoin((...vs) => sum(...vs), ...maps);
}
exports.sumMaps = sumMaps;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9udW1iZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscUNBQXVDO0FBRXZDOztHQUVHO0FBQ0gsU0FBZ0IsTUFBTSxDQUFJLEdBQTRCO0lBQ2xELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxFQUFhLENBQUM7SUFDakMsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRTtRQUMxQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3RCO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBTkQsd0JBTUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixHQUFHLENBQUMsR0FBRyxJQUFjO0lBQ2pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1FBQ3BCLEdBQUcsSUFBSSxHQUFHLENBQUM7S0FDZDtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQU5ELGtCQU1DO0FBRUQsOENBQThDO0FBQzlDLFNBQWdCLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBRyxJQUFjO0lBQ25ELE9BQU8sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUZELDBCQUVDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixLQUFLLENBQUksTUFBd0IsRUFBRSxFQUFlO0lBQzlELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ2hCLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEI7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFORCxzQkFNQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLE9BQU8sQ0FBSSxHQUFHLElBQW9DO0lBQzlELE9BQU8sZ0JBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFGRCwwQkFFQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/rand/diamondSquare.js":
/*!***********************************************!*\
  !*** ../myalgo-ts/dist/rand/diamondSquare.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The diamond-square algorithm; returns a float array with values between 0 and 1 that represents a square grid.
 * @see http://www.gameprogrammer.com/fractal.html#midpoint
 * @see http://jmecom.github.io/blog/2015/diamond-square/
 * @see http://stevelosh.com/blog/2016/08/lisp-jam-postmortem/#tiling-diamond-square
 * @see http://www.playfuljs.com/realistic-terrain-in-130-lines/
 */
function diamondSquare(prng, nside, roughness) {
    console.assert(Number.isInteger(Math.log2(nside - 1)), "nside must be of the form (2^n)+1");
    const data = new Float32Array(nside * nside);
    const stepMax = nside - 1;
    const isValidCoor = ([x, y]) => x >= 0 && x < nside
        && y >= 0 && y < nside;
    const idx = ([x, y]) => y * nside + x;
    const get = (target) => data[idx(target)];
    const set = (target, val) => {
        const i = idx(target);
        console.assert(val > 0);
        console.assert(data[i] === 0);
        data[i] = val;
    };
    const assign = (target, coors, scale) => {
        const validCoors = coors
            .filter(isValidCoor)
            .map(get);
        const sum = validCoors.reduce((prev, cur) => prev + cur, 0);
        const avgValue = sum / validCoors.length;
        const randomness = prng() * scale;
        const height = avgValue + randomness;
        console.assert(Number.isFinite(height));
        set(target, height);
    };
    const diamond = (step, scale) => {
        const halfstep = step / 2;
        for (let y = halfstep; y <= stepMax; y += step) {
            for (let x = halfstep; x <= stepMax; x += step) {
                const coors = [
                    [x - halfstep, y - halfstep],
                    [x + halfstep, y - halfstep],
                    [x - halfstep, y + halfstep],
                    [x + halfstep, y + halfstep],
                ];
                assign([x, y], coors, scale);
            }
        }
    };
    const square = (step, scale) => {
        const halfstep = step / 2;
        let startMiddle = true;
        for (let y = 0; y <= stepMax; y += halfstep) {
            const start = startMiddle ? halfstep : 0;
            startMiddle = !startMiddle;
            for (let x = start; x <= stepMax; x += step) {
                const coors = [
                    [x, y - halfstep],
                    [x, y + halfstep],
                    [x - halfstep, y],
                    [x + halfstep, y],
                ];
                assign([x, y], coors, scale);
            }
        }
    };
    {
        // set up initial values for the 4 corners
        set([0, 0], prng());
        set([0, nside - 1], prng());
        set([nside - 1, 0], prng());
        set([nside - 1, nside - 1], prng());
        let scale = 0.1;
        for (let step = stepMax; step > 1; step /= 2,
            scale = step / nside * roughness) {
            diamond(step, scale);
            square(step, scale);
        }
    }
    const maxHeight = Math.max(...data);
    const minHeight = Math.min(...data);
    const heightDiff = maxHeight - minHeight;
    console.assert(heightDiff > 0); // TODO is this a flat map when assertion fails?
    // normalize values
    const normalized = data.map((x) => (x - minHeight) / heightDiff);
    console.assert(normalized.every((x) => x >= 0 && x <= 1));
    return normalized;
}
exports.diamondSquare = diamondSquare;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbW9uZFNxdWFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yYW5kL2RpYW1vbmRTcXVhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7O0dBTUc7QUFDSCxTQUFnQixhQUFhLENBQ3pCLElBQWtCLEVBQ2xCLEtBQWEsRUFDYixTQUFpQjtJQUdqQixPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO0lBRTVGLE1BQU0sSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztJQUU3QyxNQUFNLE9BQU8sR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFtQixFQUFFLEVBQUUsQ0FDN0MsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSztXQUNoQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDM0IsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBd0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzVELE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBd0IsRUFBRSxHQUFXLEVBQUUsRUFBRTtRQUNsRCxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDeEIsT0FBTyxD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

/***/ }),

/***/ "../myalgo-ts/dist/rand/index.js":
/*!***************************************!*\
  !*** ../myalgo-ts/dist/rand/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./diamondSquare */ "../myalgo-ts/dist/rand/diamondSquare.js"));
__export(__webpack_require__(/*! ./randomGen */ "../myalgo-ts/dist/rand/randomGen.js"));
__export(__webpack_require__(/*! ./shuffleSlice */ "../myalgo-ts/dist/rand/shuffleSlice.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmFuZC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFDQUFnQztBQUNoQyxpQ0FBNEI7QUFDNUIsb0NBQStCIn0=

/***/ }),

/***/ "../myalgo-ts/dist/rand/randomGen.js":
/*!*******************************************!*\
  !*** ../myalgo-ts/dist/rand/randomGen.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const numbers_1 = __webpack_require__(/*! ../numbers */ "../myalgo-ts/dist/numbers.js");
/**
 * Randomly generate items of type T given their probabilities (sum <= 1).
 * When the sum of probability < 1, it's possible to get undefined from the generator.
 * modified from https://stackoverflow.com/a/28933315
 * @param probs a map of objects and their probabilities
 */
exports.randomGen = (probs, rand) => {
    if (numbers_1.sum(...probs.values()) > 1) {
        throw new Error("probability needs to be positive and less than 1");
    }
    const results = [];
    const weights = [];
    for (const [key, p] of probs) {
        if (p <= 0) {
            throw new Error("probability needs to be positive and less than 1");
        }
        results.push(key);
        weights.push(p);
    }
    const randGen = rand === undefined ? Math.random : rand;
    return () => {
        const r = randGen();
        let cummulativeProbs = 0;
        for (let i = 0; i < weights.length; ++i) {
            cummulativeProbs += weights[i];
            if (r < cummulativeProbs) {
                return results[i];
            }
        }
        return undefined;
    };
};
/**
 * The "strict" version of randomGen(), where sum of probabilities (with at least 1 remaining items) must sum up to 1.
 * @param remain the remain element will have a probability of 1-sum(probs) and remain ∉ probs
 * @param probs a map of objects and their probabilities
 */
exports.randomGenStrict = (remain, probs, rand) => {
    if (probs.has(remain)) {
        throw new Error("remain should ∉ probs");
    }
    const gen = exports.randomGen(probs, rand);
    return () => {
        const ret = gen();
        return ret === undefined ? remain : ret;
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tR2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JhbmQvcmFuZG9tR2VuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esd0NBQWlDO0FBRWpDOzs7OztHQUtHO0FBQ1UsUUFBQSxTQUFTLEdBQUcsQ0FBSSxLQUE4QixFQUFFLElBQW1CLEVBQUUsRUFBRTtJQUNoRixJQUFJLGFBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUM7S0FDdkU7SUFFRCxNQUFNLE9BQU8sR0FBUSxFQUFFLENBQUM7SUFDeEIsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO0lBQzdCLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLEVBQUU7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO1NBQ3ZFO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25CO0lBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3hELE9BQU8sR0FBRyxFQUFFO1FBQ1IsTUFBTSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUM7UUFDcEIsSUFBSSxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDekIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7WUFDckMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxHQUFHLGdCQUFnQixFQUFFO2dCQUN0QixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNyQjtTQUNKO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUY7Ozs7R0FJRztBQUNVLFFBQUEsZUFBZSxHQUFHLENBQzNCLE1BQVMsRUFBRSxLQUE4QixFQUN6QyxJQUFtQixFQUNyQixFQUFFO0lBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUM1QztJQUNELE1BQU0sR0FBRyxHQUFHLGlCQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25DLE9BQU8sR0FBRyxFQUFFO1FBQ1IsTUFBTSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDbEIsT0FBTyxHQUFHLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUM1QyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/rand/shuffleSlice.js":
/*!**********************************************!*\
  !*** ../myalgo-ts/dist/rand/shuffleSlice.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/** Shuffle the given collection. */
function shuffleSlice(it) {
    return wrapper_1.wrapIt(shuffleSliceHelper(it));
}
exports.shuffleSlice = shuffleSlice;
function* shuffleSliceHelper(it) {
    const temp = Array.from(it);
    if (temp.length === 0) {
        return;
    }
    while (true) {
        const lastIdx = temp.length - 1;
        const idx = Math.floor(Math.random() * lastIdx);
        yield temp[idx];
        if (idx === lastIdx) {
            return;
        }
        // swap the target with the last item
        temp[idx] = temp.pop();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2h1ZmZsZVNsaWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JhbmQvc2h1ZmZsZVNsaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQXlDO0FBRXpDLG9DQUFvQztBQUNwQyxTQUFnQixZQUFZLENBQUksRUFBZTtJQUMzQyxPQUFPLGdCQUFNLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRkQsb0NBRUM7QUFFRCxRQUFRLENBQUMsQ0FBQyxrQkFBa0IsQ0FBSSxFQUFlO0lBQzNDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFNUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPO0tBQ1Y7SUFFRCxPQUFPLElBQUksRUFBRTtRQUNULE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ2hELE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhCLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtZQUNqQixPQUFPO1NBQ1Y7UUFFRCxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUcsQ0FBQztLQUMzQjtBQUNMLENBQUMifQ==

/***/ }),

/***/ "../myalgo-ts/dist/set/biset.js":
/*!**************************************!*\
  !*** ../myalgo-ts/dist/set/biset.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Bi-direction set, based on two Map objects. Use this class for data that has a bijective relationship.
 */
class BiSet extends wrapper_1.MyIterable {
    constructor(...data) {
        super();
        this.leftMap = new Map();
        this.rightMap = new Map();
        this.iterate = () => {
            return this.leftMap.entries();
        };
        for (const [t, u] of data) {
            this.add(t, u);
        }
    }
    /** Return the number of items in the set. */
    get size() { return this.leftMap.size; }
    /** Add a new pair to the map. */
    add(left, right) {
        this.leftMap.set(left, right);
        this.rightMap.set(right, left);
    }
    /** Delete by the entry mapped by left. */
    deleteLeft(left) {
        const right = this.leftMap.get(left);
        return right !== undefined && this.deleteHelper(left, right);
    }
    /** Delete by the entry mapped by right. */
    deleteRight(right) {
        const left = this.rightMap.get(right);
        return left !== undefined && this.deleteHelper(left, right);
    }
    /** Get the right item by using left as the key. */
    getRight(left) {
        return this.leftMap.get(left);
    }
    /** Get the left item by using right as the key. */
    getLeft(right) {
        return this.rightMap.get(right);
    }
    /** Test if a pair exist based on left as the key. */
    hasLeft(left) {
        return this.leftMap.has(left);
    }
    /** Test if a pair exist based on right as the key. */
    hasRight(right) {
        return this.rightMap.has(right);
    }
    /** Get all items in the left set. */
    lefts() {
        return wrapper_1.wrapIt(this.leftMap.keys());
    }
    /** Get all items in the right set. */
    rights() {
        return wrapper_1.wrapIt(this.rightMap.keys());
    }
    deleteHelper(left, right) {
        const ret1 = this.leftMap.delete(left);
        const ret2 = this.rightMap.delete(right);
        console.assert(ret1);
        console.assert(ret2);
        return true;
    }
}
exports.BiSet = BiSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmlzZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2V0L2Jpc2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQXFEO0FBRXJEOztHQUVHO0FBQ0gsTUFBYSxLQUFZLFNBQVEsb0JBQWtCO0lBSy9DLFlBQVksR0FBRyxJQUFtQjtRQUM5QixLQUFLLEVBQUUsQ0FBQztRQUpKLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBUSxDQUFDO1FBQzFCLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBUSxDQUFDO1FBNER6QixZQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ3JCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNsQyxDQUFDLENBQUE7UUExREcsS0FBSyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtZQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNsQjtJQUNMLENBQUM7SUFFRCw2Q0FBNkM7SUFDN0MsSUFBVyxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFL0MsaUNBQWlDO0lBQzFCLEdBQUcsQ0FBQyxJQUFPLEVBQUUsS0FBUTtRQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCwwQ0FBMEM7SUFDbkMsVUFBVSxDQUFDLElBQU87UUFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckMsT0FBTyxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCwyQ0FBMkM7SUFDcEMsV0FBVyxDQUFDLEtBQVE7UUFDdkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsT0FBTyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxtREFBbUQ7SUFDNUMsUUFBUSxDQUFDLElBQU87UUFDbkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsbURBQW1EO0lBQzVDLE9BQU8sQ0FBQyxLQUFRO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELHFEQUFxRDtJQUM5QyxPQUFPLENBQUMsSUFBTztRQUNsQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxzREFBc0Q7SUFDL0MsUUFBUSxDQUFDLEtBQVE7UUFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQscUNBQXFDO0lBQzlCLEtBQUs7UUFDUixPQUFPLGdCQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxzQ0FBc0M7SUFDL0IsTUFBTTtRQUNULE9BQU8sZ0JBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQU1PLFlBQVksQ0FBQyxJQUFPLEVBQUUsS0FBUTtRQUNsQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBMUVELHNCQTBFQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/set/difference.js":
/*!*******************************************!*\
  !*** ../myalgo-ts/dist/set/difference.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Compute the set difference of source \ others (others treated as 1 set).
 */
function difference(source, ...others) {
    return others.reduce((acc, cur) => {
        const curSet = new Set(cur);
        const next = new Set();
        for (const t of acc) {
            if (!curSet.has(t)) {
                next.add(t);
            }
        }
        return next;
    }, new Set(source));
}
exports.difference = difference;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZmVyZW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXQvZGlmZmVyZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOztHQUVHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFJLE1BQXVCLEVBQUUsR0FBRyxNQUEwQjtJQUNoRixPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUssQ0FBQztRQUMxQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRTtZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNmO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN4QixDQUFDO0FBWEQsZ0NBV0MifQ==

/***/ }),

/***/ "../myalgo-ts/dist/set/index.js":
/*!**************************************!*\
  !*** ../myalgo-ts/dist/set/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./biset */ "../myalgo-ts/dist/set/biset.js"));
__export(__webpack_require__(/*! ./difference */ "../myalgo-ts/dist/set/difference.js"));
__export(__webpack_require__(/*! ./intersect */ "../myalgo-ts/dist/set/intersect.js"));
__export(__webpack_require__(/*! ./unionfind */ "../myalgo-ts/dist/set/unionfind.js"));
__export(__webpack_require__(/*! ./wrapper */ "../myalgo-ts/dist/set/wrapper.js"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2V0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQXdCO0FBRXhCLGtDQUE2QjtBQUM3QixpQ0FBNEI7QUFDNUIsaUNBQTRCO0FBQzVCLCtCQUEwQiJ9

/***/ }),

/***/ "../myalgo-ts/dist/set/intersect.js":
/*!******************************************!*\
  !*** ../myalgo-ts/dist/set/intersect.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const combine_1 = __webpack_require__(/*! ../iter/combine */ "../myalgo-ts/dist/iter/combine.js");
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
const groupBy_1 = __webpack_require__(/*! ../map/groupBy */ "../myalgo-ts/dist/map/groupBy.js");
const wrapper_2 = __webpack_require__(/*! ./wrapper */ "../myalgo-ts/dist/set/wrapper.js");
function intersectHelper(...sets) {
    switch (sets.length) {
        case 0:
            return new Set();
        case 1:
            return new Set(sets[0]);
        case 2:
            let small;
            let big;
            if (sets[0].size > sets[1].size) {
                small = sets[1];
                big = sets[0];
            }
            else {
                small = sets[0];
                big = sets[1];
            }
            return new Set(wrapper_1.wrapIt(small).filter((t) => big.has(t)));
        default:
            return new Set(wrapper_1.wrapIt(groupBy_1.groupBy(combine_1.combine(...sets), (t) => t))
                .filter(([, us]) => sets.length === us.length)
                .map(([t]) => t));
    }
}
/**
 * Find the intersection of given sets.
 * @param sets 1 or more sets
 */
exports.intersect = (...sets) => wrapper_2.wrapSet(intersectHelper(...sets));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJzZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NldC9pbnRlcnNlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBMEM7QUFDMUMsNkNBQXlDO0FBQ3pDLDRDQUF5QztBQUV6Qyx1Q0FBb0M7QUFFcEMsU0FBUyxlQUFlLENBQUksR0FBRyxJQUE0QjtJQUV2RCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDakIsS0FBSyxDQUFDO1lBQ0YsT0FBTyxJQUFJLEdBQUcsRUFBSyxDQUFDO1FBQ3hCLEtBQUssQ0FBQztZQUNGLE9BQU8sSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsS0FBSyxDQUFDO1lBQ0YsSUFBSSxLQUFLLENBQUM7WUFDVixJQUFJLEdBQW9CLENBQUM7WUFFekIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQzdCLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7aUJBQU07Z0JBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEIsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQjtZQUNELE9BQU8sSUFBSSxHQUFHLENBQUMsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVEO1lBQ0ksT0FBTyxJQUFJLEdBQUcsQ0FBQyxnQkFBTSxDQUFDLGlCQUFPLENBQUMsaUJBQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7aUJBQzdDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0I7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ1UsUUFBQSxTQUFTLEdBQUcsQ0FBSSxHQUFHLElBQTRCLEVBQWEsRUFBRSxDQUFDLGlCQUFPLENBQUMsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyJ9

/***/ }),

/***/ "../myalgo-ts/dist/set/unionfind.js":
/*!******************************************!*\
  !*** ../myalgo-ts/dist/set/unionfind.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const wrapper_1 = __webpack_require__(/*! ../iter/wrapper */ "../myalgo-ts/dist/iter/wrapper.js");
/**
 * Union-find data structure with path compression. Deletion of a single element uses
 * the tombstone method, deletion of sets uses brute-force.
 */
class UnionFind extends wrapper_1.MyIterable {
    constructor() {
        super(...arguments);
        this.toId = new Map();
        this.parents = new Map();
        this.id = 0;
        /** All sets that belong to elements in ts becomes 1 set. */
        this.union = (...ts) => {
            if (ts.length > 0) {
                const t0 = ts[0];
                for (let i = 1; i < ts.length; ++i) {
                    const ti = ts[i];
                    this.union2(t0, ti);
                }
            }
            return this;
        };
        /**
         * Test whether left and right are in the same set.
         */
        this.isSameSet = (left, right) => {
            console.assert(left !== undefined);
            console.assert(right !== undefined);
            if (left === right) {
                return true;
            }
            const leftRes = this.find(left);
            if (leftRes === undefined) {
                return false;
            }
            const rightRes = this.find(right);
            if (rightRes === undefined) {
                return false;
            }
            const [lParent] = leftRes;
            const [rParent] = rightRes;
            return lParent === rParent;
        };
        /** Each item in ts becomes its own set. */
        this.tear = (...ts) => {
            // just delete the id mapping, parent structure remain the same
            for (const t of ts) {
                if (this.toId.delete(t)) {
                    this.memoizedSets = undefined;
                    this.add(t);
                }
                // otherwise t is not in the set
            }
            this.recycle();
            return this;
        };
        /** Remove an item. */
        this.delete = (t) => {
            const ret = this.toId.delete(t);
            if (ret) {
                this.memoizedSets = undefined;
            }
            this.recycle();
            return ret;
        };
        /** Creates a copy of this data structure. */
        this.clone = () => {
            const ret = new UnionFind();
            ret.toId = new Map(this.toId);
            ret.parents = new Map(this.parents);
            ret.id = this.id;
            return ret;
        };
        /**
         * Delete items based on ts.
         */
        this.deleteSets = (...ts) => {
            let isDeleted = false;
            for (const t of ts) {
                for (const t1 of this.get(t)) {
                    const id = this.toId.get(t1);
                    this.parents.delete(id);
                    this.toId.delete(t1);
                    isDeleted = true;
                }
            }
            if (isDeleted) {
                this.memoizedSets = undefined;
            }
            this.recycle();
        };
        /** Test whether t is in the set */
        this.has = (t) => this.find(t) !== undefined;
        this.iterate = () => {
            // naive algorithm
            if (this.memoizedSets === undefined) {
                this.memoizedSets = this.aggregate();
            }
            return this.memoizedSets.values();
        };
        this.aggregate = () => {
            const ret = new Map();
            for (const [val, id] of this.toId) {
                const [parent] = this.findInner(id);
                const temp = ret.get(parent);
                if (temp === undefined) {
                    ret.set(parent, new Set([val]));
                }
                else {
                    temp.add(val);
                }
            }
            return ret;
        };
        /** Find the item or add it to its own set */
        this.findMut = (item) => {
            const prev = this.toId.get(item);
            if (prev === undefined) {
                return this.add(item);
            }
            return this.findInner(prev);
        };
        this.union2 = (left, right) => {
            // sanity check
            console.assert(left !== undefined);
            console.assert(right !== undefined);
            this.memoizedSets = undefined;
            const [lRoot, lRank] = this.findMut(left);
            const [rRoot, rRank] = this.findMut(right);
            if (lRoot === rRoot) {
                return this;
            }
            if (lRank < rRank) {
                this.parents.set(lRoot, [rRoot, lRank]);
            }
            else if (lRank > rRank) {
                this.parents.set(rRoot, [lRoot, rRank]);
            }
            else {
                this.parents.set(lRoot, [rRoot, rRank + 1]);
            }
            this.recycle();
            return this;
        };
        this.recycle = () => {
            if (this.garbageRatio < 2) {
                return;
            }
            // otherwise structureSize is twice larger than necessary
            this.memoizedSets = undefined;
            const ret = new UnionFind();
            for (const ts of this) {
                const t1 = ts.values().next().value;
                console.assert(t1 !== undefined); // ts is a grouping of all sets, so each set must have at least 1 element
                for (const t2 of ts) {
                    ret.union(t1, t2);
                }
            }
            // simply replace data
            this.toId = ret.toId;
            this.parents = ret.parents;
            this.id = ret.id;
        };
        this.add = (item) => {
            console.assert(this.toId.get(item) === undefined);
            this.memoizedSets = undefined;
            // set item to be item's parent
            const id = ++this.id;
            this.toId.set(item, id);
            const ret = [id, 0];
            this.parents.set(id, ret);
            return ret;
        };
        this.find = (item) => {
            const prev = this.toId.get(item);
            if (prev === undefined) {
                return undefined;
            }
            return this.findInner(prev);
        };
        this.findInner = (targetId) => {
            const path = [];
            let prev = targetId;
            while (true) {
                const [parent, rank] = this.parents.get(prev);
                if (prev === parent) {
                    // path compression
                    for (const id of path) {
                        this.parents.set(id, [parent, rank]);
                    }
                    const ret = [parent, rank];
                    return ret;
                }
                // collect ancestors for future path compression
                path.push(prev);
                prev = parent;
            }
        };
    }
    /** Get the number of items in this structure. */
    get size() { return this.toId.size; }
    /** Retrieve the entire set belonging to t using the naive algorithm, results are memoized internally. */
    get(t) {
        return wrapper_1.wrapIt(this.getHelper(t));
    }
    *getHelper(t) {
        const result = this.find(t);
        if (result === undefined) { // element doesn't exist
            return;
        }
        const [parent] = result;
        if (this.memoizedSets === undefined) {
            this.memoizedSets = this.aggregate();
        }
        const rets = this.memoizedSets.get(parent);
        if (rets === undefined) {
            return;
        }
        for (const s of rets) {
            yield s;
        }
    }
    get structureSize() { return this.parents.size; }
    get garbageRatio() { return this.size === 0 ? 0 : this.structureSize / this.size; }
}
exports.UnionFind = UnionFind;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pb25maW5kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NldC91bmlvbmZpbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2Q0FBcUQ7QUFHckQ7OztHQUdHO0FBQ0gsTUFBYSxTQUFhLFNBQVEsb0JBQWtCO0lBQXBEOztRQUVZLFNBQUksR0FBRyxJQUFJLEdBQUcsRUFBYSxDQUFDO1FBQzVCLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBNEIsQ0FBQztRQUM5QyxPQUFFLEdBQUcsQ0FBQyxDQUFDO1FBV2YsNERBQTREO1FBQ3JELFVBQUssR0FBRyxDQUFDLEdBQUcsRUFBTyxFQUFFLEVBQUU7WUFDMUIsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDZixNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO29CQUNoQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUN2QjthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFBO1FBRUQ7O1dBRUc7UUFDSSxjQUFTLEdBQUcsQ0FBQyxJQUFPLEVBQUUsS0FBUSxFQUFFLEVBQUU7WUFFckMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUM7WUFDbkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUM7WUFFcEMsSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO2dCQUNoQixPQUFPLElBQUksQ0FBQzthQUNmO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJ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

/***/ }),

/***/ "../myalgo-ts/dist/set/wrapper.js":
/*!****************************************!*\
  !*** ../myalgo-ts/dist/set/wrapper.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const iter_1 = __webpack_require__(/*! ../iter */ "../myalgo-ts/dist/iter/index.js");
const difference_1 = __webpack_require__(/*! ./difference */ "../myalgo-ts/dist/set/difference.js");
const intersect_1 = __webpack_require__(/*! ./intersect */ "../myalgo-ts/dist/set/intersect.js");
/**
 * Add all ts into the set.
 */
function unionMut(set, ...ts) {
    for (const t of ts) {
        set.add(t);
    }
    return set;
}
exports.unionMut = unionMut;
function wrapSet(set) {
    return {
        add: (t) => wrapSet(set.add(t)),
        collect: () => Array.from(set),
        count: () => iter_1.wrapIt(set).count(),
        delete: (t) => set.delete(t),
        difference: (...others) => wrapSet(difference_1.difference(set, ...others)),
        every: (pred) => iter_1.wrapIt(set).every(pred),
        filter: (pred) => makeSet(iter_1.wrapIt(set).filter(pred)),
        first: () => iter_1.wrapIt(set).first(),
        flatMap: (mapper) => iter_1.wrapIt(set).flatMap(mapper),
        forEach: (callBackFn) => iter_1.wrapIt(set).forEach(callBackFn),
        has: (t) => set.has(t),
        intersect: (...others) => intersect_1.intersect(set, ...others),
        map: (mapper) => makeSet(iter_1.wrapIt(set).map(mapper)),
        pin: (hammer) => makeSet(iter_1.wrapIt(set).pin(hammer)),
        reduce: (reducer, base) => iter_1.wrapIt(set).reduce(reducer, base),
        get size() { return set.size; },
        some: (pred) => iter_1.wrapIt(set).some(pred),
        take: (count) => makeSet(iter_1.wrapIt(set).take(count)),
        *[Symbol.iterator]() {
            for (const t of set) {
                yield t;
            }
        },
    };
}
exports.wrapSet = wrapSet;
function makeSet(it) {
    return wrapSet(new Set(it));
}
exports.makeSet = makeSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXQvd3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtDQUFpQztBQUVqQyw2Q0FBMEM7QUFDMUMsMkNBQXdDO0FBRXhDOztHQUVHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFJLEdBQVcsRUFBRSxHQUFHLEVBQU87SUFDL0MsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNkO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBTEQsNEJBS0M7QUFFRCxTQUFnQixPQUFPLENBQUksR0FBVztJQUNsQyxPQUFPO1FBQ0gsR0FBRyxFQUFFLENBQUMsQ0FBSSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDOUIsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7UUFDaEMsTUFBTSxFQUFFLENBQUMsQ0FBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUMvQixVQUFVLEVBQUUsQ0FBQyxHQUFHLE1BQTBCLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyx1QkFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ2xGLEtBQUssRUFBRSxDQUFDLElBQWtDLEVBQUUsRUFBRSxDQUFDLGFBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1FBQ3RFLE1BQU0sRUFBRSxDQUFDLElBQWtDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pGLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFO1FBQ2hDLE9BQU8sRUFBRSxDQUFJLE1BQXdDLEVBQUUsRUFBRSxDQUFDLGFBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3JGLE9BQU8sRUFBRSxDQUFDLFVBQStDLEVBQUUsRUFBRSxDQUFDLGFBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQzdGLEdBQUcsRUFBRSxDQUFDLENBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDekIsU0FBUyxFQUFFLENBQUMsR0FBRyxNQUE4QixFQUFFLEVBQUUsQ0FBQyxxQkFBUyxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUMzRSxHQUFHLEVBQUUsQ0FBSSxNQUE4QixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RSxHQUFHLEVBQUUsQ0FBSSxNQUE4QixFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RSxNQUFNLEVBQUUsQ0FBSSxPQUF5QyxFQUFFLElBQU8sRUFBRSxFQUFFLENBQUMsYUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDO1FBQ3BHLElBQUksSUFBSSxLQUFLLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxFQUFFLENBQUMsSUFBa0MsRUFBRSxFQUFFLENBQUMsYUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDcEUsSUFBSSxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNkLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFO2dCQUNqQixNQUFNLENBQUMsQ0FBQzthQUNYO1FBQ0wsQ0FBQztLQUNKLENBQUM7QUFDTixDQUFDO0FBMUJELDBCQTBCQztBQUVELFNBQWdCLE9BQU8sQ0FBSSxFQUFlO0lBQ3RDLE9BQU8sT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDBCQUVDIn0=

/***/ }),

/***/ "../myalgo-ts/dist/tuple.js":
/*!**********************************!*\
  !*** ../myalgo-ts/dist/tuple.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/** Remove this when Typescript has better support for tuples */
function makePair(t, u) {
    return [t, u];
}
exports.makePair = makePair;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHVwbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdHVwbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnRUFBZ0U7QUFDaEUsU0FBZ0IsUUFBUSxDQUFPLENBQUksRUFBRSxDQUFJO0lBQ3JDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFXLENBQUM7QUFDNUIsQ0FBQztBQUZELDRCQUVDIn0=

/***/ }),

/***/ "./build/database.js":
/*!***************************!*\
  !*** ./build/database.js ***!
  \***************************/
/*! exports provided: Database */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Database", function() { return Database; });
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! myalgo-ts */ "../myalgo-ts/dist/index.js");
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _galaxy_bg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../galaxy_bg */ "./galaxy_bg.wasm");
/* harmony import */ var _view_def__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./view/def */ "./build/view/def.js");



const channelKindValues = [
    0 /* Galaxy */,
    1 /* Tabs */,
    2 /* SwitchTab */,
    3 /* NameSearchUpdate */,
];
const DEFAULT_TABS = [
    {
        kind: 0 /* Galaxy */,
        tabId: Symbol(),
    },
    {
        kind: 3 /* Player */,
        tabId: Symbol(),
    },
    {
        kind: 4 /* Nation */,
        tabId: Symbol(),
    },
    {
        kind: 5 /* Station */,
        tabId: Symbol(),
    },
    {
        kind: 6 /* People */,
        tabId: Symbol(),
    },
    {
        kind: 2 /* Search */,
        tabId: Symbol(),
    },
];
class Database {
    constructor(base) {
        // somewhat-persistent temp data; handled by external views
        this.galaxyViewData = {
            center: [0, 0],
            gridSize: _view_def__WEBPACK_IMPORTED_MODULE_2__["MIN_GRID_SIZE"],
        };
        this.cacheSearchResult = [];
        this.subscribers = new Set();
        this.flags = new Set();
        this.reset(base);
    }
    reset(d) {
        this.galaxy = d.galaxy;
        const tabs = DEFAULT_TABS.slice();
        const galaxyTabId = tabs[0].tabId;
        this.curTabId = galaxyTabId;
        this.setTabsHelper(tabs);
        this.cacheSearchResult = [];
        this.notify(...channelKindValues);
    }
    set searchName(name) {
        clearInterval(this.searchNameId);
        this.searchNameId = setInterval(() => {
            this.cacheSearchResult = this.galaxy.interop_search_name(name);
            this.notify(3 /* NameSearchUpdate */);
            clearInterval(this.searchNameId);
        }, 300);
    }
    get searchNameResult() {
        return this.cacheSearchResult;
    }
    get tabId() {
        return this.curTabId;
    }
    set tabId(tabId) {
        this.switchTabHelper(tabId);
        this.notify();
    }
    calDrawData(tlX, tlY, brX, brY, gridSize) {
        return this.galaxy.interop_cal_draw_data(tlX, tlY, brX, brY, gridSize);
    }
    getPlanetName(planetId) {
        return this.galaxy.get_planet_name(planetId.Planet);
    }
    /*
    public getPlanetInfo(planetId: IPlanetId): IPlanetInfo {
        return this.galaxy.interop_get_planet_info(planetId);
    }
    */
    /*
    public calColonyCivilianDemands(colonyId: IColonyId): Uint32Array {
        return this.galaxy.interop_cal_civilian_demands(colonyId);
    }

    public calSupply(colonyId: IColonyId): Uint32Array {
        return this.galaxy.interop_cal_supply(colonyId);
    }

    public calColonyCorpDemands(colonyId: IColonyId): Uint32Array {
        return this.galaxy.interop_cal_corporate_demands(colonyId);
    }
    */
    /*
    public createPlayer(name: string, job: Job): ISpecialist {
        return this.galaxy.interop_create_player(name, job);
    }
    */
    handleCoorSearch(x, y) {
        const galaxy2 = this.galaxy;
        const results = galaxy2.interop_search(x, y);
        const unwrapped = results.map((result) => {
            const id = result.id;
            return { id, name: result.name };
        });
        switch (unwrapped.length) {
            case 0:
                break;
            case 1:
                const result = results[0];
                const id = result.id;
                if (id !== undefined) {
                    if (id.Planet !== undefined) {
                        const planetId = id;
                        this.switchPlanetTab(planetId);
                    }
                    else if (id.Star !== undefined) {
                        console.log(unwrapped);
                        // TODO ignore for now
                    }
                    else {
                        throw new Error("not handled");
                    }
                }
                break;
            default:
                this.cacheSearchResult = unwrapped;
                console.assert(false); // TODO switch to the search panel
                break;
        }
    }
    get tabs() {
        return this.tabState.slice();
    }
    getPlanetEdges(planetId) {
        return this.galaxy.get_planet_edges(planetId);
    }
    getPlanetPoints(planetId) {
        const ptr = this.galaxy.get_planet_points(planetId);
        const dim = this.galaxy.cal_planet_dim(planetId);
        const memorySize = 2 * dim;
        const ret = new Float32Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_1__["memory"].buffer, ptr, memorySize);
        console.assert(ret.length > 0);
        return ret;
    }
    addPlanetTab(planetId) {
        const tabs = this.tabState;
        // perform linear search; add a new tab if the planet isn't listed in the tabs already
        const tab = tabs.find((x) => x.kind === 1 /* Planet */ &&
            x.planetId.Planet === planetId.Planet);
        if (tab !== undefined) {
            return tab.tabId;
        }
        const tabId = Symbol();
        tabs.push({
            kind: 1 /* Planet */,
            planetId,
            tabId,
        });
        this.setTabsHelper(tabs);
        return tabId;
    }
    switchPlanetTab(planetId) {
        console.log("switching view to planet id:", planetId);
        const tabId = this.addPlanetTab(planetId);
        this.switchTabHelper(tabId);
        this.notify();
    }
    moveTabToFront(tabId) {
        const numBaseTabs = DEFAULT_TABS.length;
        const base = this.tabState.slice(0, numBaseTabs);
        if (base.some((x) => x.tabId === tabId)) {
            return;
        }
        const target = this.tabState.find((x) => x.tabId === tabId);
        console.assert(target !== undefined);
        const rest = this.tabState.slice(numBaseTabs).filter((x) => x.tabId !== tabId);
        this.tabState = [
            ...base,
            target,
            ...rest,
        ];
        const tabLimit = numBaseTabs + 10; // TODO
        const tabLen = this.tabState.length;
        if (tabLen > tabLimit) {
            console.assert(tabLen === tabLimit + 1);
            this.tabState.pop();
        }
    }
    get data() {
        const ret = {
            galaxy: this.galaxy,
        };
        return ret;
    }
    tick() {
        this.galaxy = this.galaxy.cal_next_state();
        this.notify(0 /* Galaxy */);
    }
    addFlags(...flags) {
        Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["unionMut"])(this.flags, ...flags);
    }
    notify(...flags) {
        this.addFlags(...flags);
        for (const subscriber of this.subscribers) {
            subscriber.update(this.flags);
        }
        this.flags.clear();
    }
    add(...observers) {
        for (const subscriber of observers) {
            console.assert(!this.subscribers.has(subscriber), "double-subscribing the same subscriber");
            this.subscribers.add(subscriber);
        }
        this.notify(...channelKindValues);
    }
    delete(subscriber) {
        const isDeleted = this.subscribers.delete(subscriber);
        console.assert(isDeleted, "unsubscribing a non-exist subscriber");
        this.notify(...channelKindValues);
    }
    clear() {
        this.subscribers.clear();
        this.notify(...channelKindValues);
    }
    setTabsHelper(t) {
        console.assert(t !== null && t !== undefined);
        this.tabState = t.slice();
        this.addFlags(1 /* Tabs */);
    }
    switchTabHelper(tabId) {
        const existed = this.tabState.some((x) => x.tabId === tabId);
        console.assert(existed);
        if (this.curTabId !== tabId) {
            this.curTabId = tabId;
            this.addFlags(2 /* SwitchTab */);
        }
    }
}
//# sourceMappingURL=database.js.map

/***/ }),

/***/ "./build/index.js":
/*!************************!*\
  !*** ./build/index.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _galaxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../galaxy */ "./galaxy.js");
/* harmony import */ var _database__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./database */ "./build/database.js");
/* harmony import */ var _model_def__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./model/def */ "./build/model/def.js");
/* harmony import */ var _view_SwitchView__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./view/SwitchView */ "./build/view/SwitchView.js");




const root = document.body;
console.assert(root !== null);
function makeInitialState() {
    const data = {
        galaxy: _galaxy__WEBPACK_IMPORTED_MODULE_0__["Galaxy"].new(),
    };
    const ret = new _database__WEBPACK_IMPORTED_MODULE_1__["Database"](data);
    //   ret.createPlayer("Player", Job.CEO);
    return ret;
}
{
    Object(_galaxy__WEBPACK_IMPORTED_MODULE_0__["bootstrap"])();
    const db = makeInitialState();
    const squadKindKeys = [];
    // tslint:disable-next-line:forin
    for (const key in _galaxy__WEBPACK_IMPORTED_MODULE_0__["SquadKind"]) {
        squadKindKeys.push(key);
    }
    db.galaxy.add_division_template([squadKindKeys[_galaxy__WEBPACK_IMPORTED_MODULE_0__["SquadKind"].Robot], squadKindKeys[_galaxy__WEBPACK_IMPORTED_MODULE_0__["SquadKind"].Infantry]], _galaxy__WEBPACK_IMPORTED_MODULE_0__["CombatStyle"].Push, false);
    const template = db.galaxy.get_division_template(0);
    console.log(template);
    console.log(_galaxy__WEBPACK_IMPORTED_MODULE_0__["SquadKind"][template.squads[0]]);
    db.galaxy.train_division(0);
    db.galaxy.train_division(0);
    db.galaxy.train_division(0);
    db.galaxy.train_division(0);
    const switchView = new _view_SwitchView__WEBPACK_IMPORTED_MODULE_3__["SwitchView"](db);
    const breakpointButton = document.createElement("input");
    breakpointButton.value = "Debugger";
    breakpointButton.type = "button";
    breakpointButton.onclick = () => {
        debugger;
    };
    const endTurnButton = document.createElement("input");
    endTurnButton.value = "End Turn";
    endTurnButton.type = "button";
    endTurnButton.onclick = () => db.tick();
    const restPanel = document.createElement("div");
    restPanel.className = "restPanel";
    const testPanel = document.createElement("div");
    testPanel.style.display = "flex";
    const planetDim = document.createElement("div");
    const observers = [];
    /*
    const [width, height] = db.galaxy.get_planet_tile_dimension();
    planetDim.textContent = `width:${width}, height:${height}`;
    const colonyLabel = document.createElement("div");
    const tileTable = document.createElement("table");
    tileTable.style.borderCollapse = "collapse";

    const privateMoneyLabel = document.createElement("div");
    const publicMoneyLabel = document.createElement("div");

    const industryLabel = document.createElement("div");

    const productTable = document.createElement("table");
    productTable.style.borderCollapse = "collapse";

    const colonySet = document.createElement("fieldset");
    const colonyLegend = document.createElement("legend");
    colonyLegend.textContent = "Colony";

    colonySet.appendChild(colonyLegend);
    colonySet.appendChild(colonyLabel);
    colonySet.appendChild(publicMoneyLabel);
    colonySet.appendChild(privateMoneyLabel);
    colonySet.appendChild(planetDim);
    colonySet.appendChild(industryLabel);
    colonySet.appendChild(productTable);

    testPanel.appendChild(colonySet);
    testPanel.appendChild(tileTable);

    const select = testPanel.appendChild(document.createElement("select"));
    select.multiple = true;
    select.onchange = () => {
        const selected = [];
        for (const option of select.options) {
            if (option.selected) {
                selected.push(option.value);
            }
        }

        console.table(selected.map((idx) => {
            const army = db.galaxy.get_army(Number(idx));
            const obj = {
                exoskeleton: army.exoskeleton,
                rifle: army.rifle,
                saber: army.saber,
                troops: army.troops,
                uniform: army.uniform,
            };
            list.push({
                idx, obj,
            });
            army.free();
            return ({ idx, army });
        }));
    };

    const neighbourColonies = testPanel.appendChild(new NeighbourColoniesView(db));

    observers.push(() => {
        neighbourColonies.update();
    });

    observers.push(() => {
        const numArmies = db.galaxy.get_armies_len();
        if (numArmies > select.children.length) {
            const start = select.children.length;
            const diff = numArmies - select.children.length;
            for (let i = 0; i < diff; i++) {
                const id = i + start;
                const option1 = select.appendChild(document.createElement("option"));
                option1.textContent = `Army ${id}`;
                option1.value = id.toString();
            }
        } else if (numArmies < select.children.length) {
            const diff = select.children.length - numArmies;
            for (let i = 0; i < diff; i++) {
                select.lastElementChild!.remove();
            }
        }
    });

    {
        // initial test data
        //  const galaxy = db.galaxy;
        //  const [x, y] = [3, 5];
        //  galaxy.mark_controlled_tile(x, y, true);
        // galaxy.add_industries(x, y, 21, 20);
    }

    {

        observers.push(() => {
            //
            const colony = db.galaxy.get_colony();
            setIfDiff(publicMoneyLabel, `public money: ${colony.public_money}`);
            setIfDiff(privateMoneyLabel, `private money: ${colony.private_money}`);
            colony.free();
        });

        observers.push(() => { colonyLabel.textContent = db.galaxy.print_dev(); });

        observers.push(() => {
            const availableIndustry = db.galaxy.cal_colony_industry();
            const usedIndustry = db.galaxy.cal_colony_used_industry();
            setIfDiff(industryLabel, `# factories: ${availableIndustry} (${usedIndustry} used)`);
        });

        {
            const fragRows = document.createDocumentFragment();
            for (let y = 0; y < height; y++) {
                const row = fragRows.appendChild(document.createElement("tr"));
                for (let x = 0; x < width; x++) {
                    const data = row.appendChild(document.createElement("td"));
                    data.style.border = "1px solid black";

                    observers.push(() => {
                        if (db.galaxy.is_tile_controlled(x, y)) {
                            data.style.background = "yellow";
                        } else if (db.galaxy.is_tile_controlled_by_others(x, y)) {
                            data.style.background = "orange";
                        } else {
                            data.style.background = null;
                        }
                    });

                    observers.push(() => {
                        const tile = db.galaxy.get_tile_at(x, y);
                        const garrison = db.galaxy.get_garrison(x, y);

                        const text = `K:${tile.kind}, F:${tile.factories}, G:${garrison}`;

                        tile.free();

                        setIfDiff(data, text);
                    });

                    data.onclick = () => {
                        db.galaxy.add_industries(x, y, 1);
                    };
                }
            }

            tileTable.appendChild(fragRows);
        }

        {
            const fragRows = document.createDocumentFragment();

            {
                const header = fragRows.appendChild(document.createElement("tr"));
                header.appendChild(document.createElement("td")).textContent = "Product";

                header.appendChild(document.createElement("td")).textContent = "Capacity";

                header.appendChild(document.createElement("td")).textContent = "Qty";
            }

            for (const product of allProducts()) {
                const row = fragRows.appendChild(document.createElement("tr"));
                const productName = row.appendChild(document.createElement("td"));
                const productionCapacity = row.appendChild(document.createElement("td"));
                const qty = row.appendChild(document.createElement("td"));
                const change = row.appendChild(document.createElement("td"));

                const addButton = change.appendChild(document.createElement("button"));
                addButton.textContent = "+";
                addButton.onclick = () => {
                    db.galaxy.add_industry(product);
                };

                const removeButton = change.appendChild(document.createElement("button"));
                removeButton.textContent = "-"; removeButton.onclick = () => {
                    db.galaxy.remove_industry(product);
                };

                observers.push(() => {
                    const galaxy = db.galaxy;
                    const availableIndustry = galaxy.cal_colony_industry();
                    const usedIndustry = galaxy.cal_colony_used_industry();
                    addButton.disabled = availableIndustry === usedIndustry;

                    const products = galaxy.get_colony_storage(product);
                    removeButton.disabled = products.production_capacity === 0;
                    products.free();
                });

                productName.textContent = getProductName(product);

                observers.push(() => {
                    const productData = db.galaxy.get_colony_storage(product);
                    setIfDiff(productionCapacity, productData.production_capacity.toString());
                    setIfDiff(qty, productData.qty.toString());

                    productData.free();
                });
            }
            productTable.appendChild(fragRows);
        }
    }
    */
    const test = {
        update() {
            for (const observer of observers) {
                observer();
            }
        },
    };
    // elements ordering
    restPanel.appendChild(breakpointButton);
    restPanel.appendChild(endTurnButton);
    //  root.appendChild(testPanel);
    root.appendChild(switchView);
    root.appendChild(restPanel);
    // subsribe components and then start drawing
    db.add(test, switchView);
    // start the game
    setInterval(() => db.tick(), _model_def__WEBPACK_IMPORTED_MODULE_2__["TICK_PERIOD"]); // update game world
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./build/model/def.js":
/*!****************************!*\
  !*** ./build/model/def.js ***!
  \****************************/
/*! exports provided: TICK_PERIOD, allProducts, getProductName */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TICK_PERIOD", function() { return TICK_PERIOD; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "allProducts", function() { return allProducts; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getProductName", function() { return getProductName; });
/* harmony import */ var _galaxy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../galaxy */ "./galaxy.js");

const TICKS_PER_SECOND = Object(_galaxy__WEBPACK_IMPORTED_MODULE_0__["get_ticks_per_second"])();
const TICK_PERIOD = 1000 / TICKS_PER_SECOND; // in milliseconds, used in setInterval()
console.log(TICK_PERIOD);
const productValues = Object
    .keys(_galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"])
    .filter((k) => typeof _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"][k] === "number")
    .map((k) => Number(_galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"][k]))
    .sort((a, b) => a - b);
function allProducts() {
    return productValues.slice();
}
function getProductName(product) {
    switch (product) {
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Accessory: return "Accessory";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Apparel: return "Apparel";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Crop: return "Crop";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Metal: return "Metal";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Concrete: return "Concrete";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Supply: return "Supply";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Alloy: return "Alloy";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Gem: return "Gem";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Fuel: return "Fuel";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Fiber: return "Fiber";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Chemical: return "Chemical";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Circuit: return "Circuit";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Computer: return "Computer";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Food: return "Food";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Medicine: return "Medicine";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Furniture: return "Furniture";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Vehicle: return "Vehicle";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Machine: return "Machine";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Tool: return "Tool";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Hull: return "Hull";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Engine: return "Engine";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Weapon: return "Weapon";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Shield: return "Shield";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Armor: return "Armor";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Countermeasure: return "Countermeasure";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Rifle: return "Rifle";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Uniform: return "Uniform";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Saber: return "Saber";
        case _galaxy__WEBPACK_IMPORTED_MODULE_0__["Product"].Exoskeleton: return "Exoskeleton";
        default:
            throw new Error("not handled");
    }
}
try {
    allProducts().map((x) => getProductName(x));
}
catch (e) {
    console.assert(false, "sanity check failed");
}
//# sourceMappingURL=def.js.map

/***/ }),

/***/ "./build/view/CanvasOperator.js":
/*!**************************************!*\
  !*** ./build/view/CanvasOperator.js ***!
  \**************************************/
/*! exports provided: CanvasOperator */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CanvasOperator", function() { return CanvasOperator; });
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! myalgo-ts */ "../myalgo-ts/dist/index.js");
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _galaxy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../galaxy */ "./galaxy.js");
/* harmony import */ var _def__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./def */ "./build/view/def.js");



class CanvasOperator {
    constructor(canvas, viewData) {
        this.canvas = canvas;
        this.viewData = viewData;
    }
    toVpCoor([x, y]) {
        console.assert(Number.isFinite(x));
        console.assert(Number.isFinite(y));
        const viewData = this.viewData;
        const { center, gridSize } = viewData;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const [cx, cy] = center;
        const canvasWidth = width / 2;
        const canvasHeight = height / 2;
        const retX = Math.floor((x + cx) * gridSize + canvasWidth);
        const retY = Math.floor((y + cy) * gridSize + canvasHeight);
        console.assert(Number.isFinite(retX));
        console.assert(Number.isFinite(retY));
        return [retX, retY];
    }
    toGameCoor([vpX, vpY]) {
        const { center, gridSize } = this.viewData;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const canvasWidth2 = width / 2;
        const canvasHeight2 = height / 2;
        const [cx, cy] = center;
        return [
            (vpX - canvasWidth2) / gridSize - cx,
            (vpY - canvasHeight2) / gridSize - cy,
        ];
    }
    vpCenter() {
        const viewData = this.viewData;
        const { center } = viewData;
        return this.toVpCoor(center);
    }
    isCircleInView(vpCoor, radius) {
        // use a cheap check by treating the circle as a square
        const twoR = 2 * radius;
        const topLeft = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])(vpCoor, [radius, radius]);
        return this.isRectInView(topLeft, twoR, twoR);
    }
    isPointInView([vpX, vpY]) {
        return vpX >= 0 && vpX <= this.canvas.width && vpY >= 0 && vpY <= this.canvas.height;
    }
    isSegmentIntersectSegment(p1, p2, q1, q2) {
        const r = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])(p2, p1);
        console.assert(Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["norm"])(r) > 0);
        const s = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])(q2, q1);
        console.assert(Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["norm"])(s) > 0);
        const qMinusP = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])(p1, q1);
        const qMinusPCrossR = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["determinant"])(qMinusP, r);
        const rCrossS = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["determinant"])(r, s);
        if (qMinusPCrossR === 0 && rCrossS === 0) {
            // collinear
            //   t0 = (q − p) · r / (r · r)
            //   t1 = (q + s − p) · r / (r · r) = t0 + s · r / (r · r)
            const rSquared = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["dot"])(r, r);
            const sDotr = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["dot"])(s, r);
            const t0 = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["dot"])(qMinusP, r) / rSquared;
            const t1 = t0 + sDotr / rSquared;
            return (t0 >= 0 && t0 <= 1) || (t1 >= 0 && t1 <= 1); // collinear and overlapping if true
        }
        if (rCrossS === 0) { // implicitly qMinusPCrossR !== 0
            return false; // parallel and non-overlapping
        }
        // t = (q − p) × s / (r × s)
        const t = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["determinant"])(qMinusP, s) / rCrossS;
        // u = (q − p) × r / (r × s)
        const u = qMinusPCrossR / rCrossS;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
    isSegmentInView(vp1, vp2) {
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;
        return this.isSegmentIntersectSegment(vp1, vp2, [0, 0], [0, width]) ||
            this.isSegmentIntersectSegment(vp1, vp2, [0, 0], [0, height]) ||
            this.isSegmentIntersectSegment(vp1, vp2, [width, 0], [0, height]) ||
            this.isSegmentIntersectSegment(vp1, vp2, [width, 0], [width, height]);
        // return this.isPointInView(vpCoor1) || this.isPointInView(vpCoor2);
    }
    isRectInView(vpCoor, width, height) {
        // https://stackoverflow.com/a/306332
        const ax1 = 0;
        const ay1 = 0;
        const canvas = this.canvas;
        const ax2 = canvas.width;
        const ay2 = canvas.height;
        const [bx1, by1] = vpCoor;
        const bx2 = bx1 + width;
        const by2 = by1 + height;
        return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
    }
    getOffsetFromTopLeft(e) {
        const bb = e.target.getBoundingClientRect();
        return [
            e.center.x - bb.left,
            e.center.y - bb.top,
        ];
    }
    getOffsetFromCenter(e) {
        const canvas = this.canvas;
        return [
            e.center.x - canvas.offsetLeft - canvas.width / 2,
            e.center.y - canvas.offsetTop - canvas.height / 2,
        ];
    }
    /**
     * Returns an animation function. The animation function should be deregistered when it returns true.
     */
    panTo(vpOffset) {
        const viewData = this.viewData;
        const vpCenter = this.vpCenter();
        const center = this.toGameCoor(vpCenter);
        const vpCoor = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["add"])(vpOffset, vpCenter);
        const to = this.toGameCoor(vpCoor);
        const offset = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])(to, center);
        const dist = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["norm"])(offset);
        let i = 0;
        const numPans = 30;
        const speed = dist / numPans;
        return () => {
            if (dist < 1 || ++i === numPans) {
                return true;
            }
            const proj = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["project"])(offset, speed);
            viewData.center = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])(viewData.center, proj);
            return false;
        };
    }
    zoom(e, min = _def__WEBPACK_IMPORTED_MODULE_2__["MIN_GRID_SIZE"], max = _def__WEBPACK_IMPORTED_MODULE_2__["MAX_GRID_SIZE"]) {
        console.assert(min <= max);
        const viewData = this.viewData;
        const isZoomingIn = e.deltaY < 0;
        const gridSize = viewData.gridSize;
        const val = 1;
        if (isZoomingIn) {
            viewData.gridSize = Math.min(max, gridSize + val);
        }
        else {
            viewData.gridSize = Math.max(min, gridSize - val);
        }
    }
}
CanvasOperator.planetVertexDist = Object(_galaxy__WEBPACK_IMPORTED_MODULE_1__["get_planet_vertex_dist"])();
//# sourceMappingURL=CanvasOperator.js.map

/***/ }),

/***/ "./build/view/GalaxyView.js":
/*!**********************************!*\
  !*** ./build/view/GalaxyView.js ***!
  \**********************************/
/*! exports provided: GalaxyView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GalaxyView", function() { return GalaxyView; });
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! myalgo-ts */ "../myalgo-ts/dist/index.js");
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(myalgo_ts__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _galaxy__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../galaxy */ "./galaxy.js");
/* harmony import */ var _CanvasOperator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CanvasOperator */ "./build/view/CanvasOperator.js");
/* harmony import */ var _def__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./def */ "./build/view/def.js");





// tslint:disable-next-line:max-classes-per-file
class GalaxyView extends HTMLCanvasElement {
    constructor(db) {
        super();
        this.db = db;
        this.ctx = this.getContext("2d");
        this.cachedGrid = document.createElement("canvas");
        this.shouldUpdateGrid = true;
        this.shouldRedrawView = true;
        this.draw = () => {
            this.resizeCanvas();
            if (this.updatePanAnimation) {
                if (this.updatePanAnimation()) {
                    this.updatePanAnimation = undefined;
                }
                this.shouldUpdateGrid = true;
                this.shouldRedrawView = true;
            }
            if (this.shouldUpdateGrid) {
                this.updateCachedGrid();
            }
            const canvas = this;
            const ctx = this.ctx;
            if (this.shouldRedrawView &&
                canvas.width !== 0 && canvas.height !== 0) {
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.drawImage(this.cachedGrid, 0, 0);
                this.drawObjects();
            }
            this.shouldRedrawView = false;
            this.shouldUpdateGrid = false;
            this.frameRequestId = requestAnimationFrame(this.draw);
        };
        /** Return true if resized; false otherwise */
        this.resizeCanvas = () => {
            const canvas = this;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            if (canvas.width !== width ||
                canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                this.cachedGrid.width = width;
                this.cachedGrid.height = height;
                this.shouldUpdateGrid = true;
                this.shouldRedrawView = true;
            }
        };
        this.doubleClick = (e) => {
            const vpOffset = this.getOffsetFromCenter(e);
            this.panTo(vpOffset);
        };
        this.singleClick = (e) => {
            const vpOffset = this.getOffsetFromTopLeft(e);
            const [x, y] = this.operator.toGameCoor(vpOffset);
            const db = this.db;
            db.handleCoorSearch(x, y);
        };
        this.wheel = (e) => {
            this.updatePanAnimation = undefined;
            this.operator.zoom(e);
            this.shouldUpdateGrid = true;
            this.shouldRedrawView = true;
        };
        this.pan = (e) => {
            this.panTo([e.deltaX, e.deltaY]);
        };
        console.assert(this.ctx !== undefined);
        const canvas = this;
        canvas.className = "map";
        window.addEventListener("resize", this.resizeCanvas, true);
        const gesture = new hammerjs__WEBPACK_IMPORTED_MODULE_0__["Manager"](this);
        const double = new hammerjs__WEBPACK_IMPORTED_MODULE_0__["Tap"]({ event: "doubletap", taps: 2 });
        const single = new hammerjs__WEBPACK_IMPORTED_MODULE_0__["Tap"]({ event: "singletap" });
        const pan = new hammerjs__WEBPACK_IMPORTED_MODULE_0__["Pan"]().set({ direction: hammerjs__WEBPACK_IMPORTED_MODULE_0__["DIRECTION_ALL"] });
        gesture.add([
            double,
            single,
            pan,
        ]);
        double.recognizeWith(single);
        single.requireFailure(double);
        // setup events
        gesture.on("singletap", this.singleClick);
        gesture.on("doubletap", this.doubleClick);
        gesture.on("pan", this.pan);
        this.addEventListener("wheel", this.wheel, { passive: true });
        this.operator = new _CanvasOperator__WEBPACK_IMPORTED_MODULE_3__["CanvasOperator"](this, db.galaxyViewData);
        this.draw();
    }
    update(flags) {
        if (flags.has(0 /* Galaxy */)) {
            this.shouldRedrawView = true;
        }
    }
    suspend() {
        if (this.frameRequestId === undefined) {
            console.assert(false);
            throw new Error("no need to suspend drawing");
        }
        window.cancelAnimationFrame(this.frameRequestId);
        this.frameRequestId = undefined;
    }
    resume() {
        if (this.frameRequestId !== undefined) {
            console.assert(false);
            throw new Error("no need to resume drawing");
        }
        this.draw();
    }
    getOffsetFromTopLeft(e) {
        const bb = e.target.getBoundingClientRect();
        return [
            e.center.x - bb.left,
            e.center.y - bb.top,
        ];
    }
    getOffsetFromCenter(e) {
        return [
            e.center.x - this.width / 2,
            e.center.y - this.height / 2,
        ];
    }
    drawPlanet(name, coor, radius, centerCoor) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const scaledRadius = radius * gridSize;
        const ctx = this.ctx;
        ctx.save();
        const vpCoor = this.operator.toVpCoor(coor);
        const [vpX, vpY] = vpCoor;
        // draw orbit
        console.assert(centerCoor !== undefined);
        const cVpCoor = this.operator.toVpCoor(centerCoor);
        const cRadius = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_1__["distance"])(cVpCoor, vpCoor);
        const [cVpX, cVpY] = cVpCoor;
        if (this.isCircleInView(cVpCoor, cRadius)) {
            ctx.beginPath();
            ctx.arc(cVpX, cVpY, cRadius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
            ctx.stroke();
        }
        // draw planets
        if (this.isCircleInView(vpCoor, scaledRadius)) {
            ctx.beginPath();
            ctx.arc(vpX, vpY, scaledRadius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
            ctx.fill();
        }
        // draw planet names
        const metric = ctx.measureText(name);
        const height = 20; // an estimate
        const width = metric.width;
        const tVpX = vpX;
        const tVpY = vpY - scaledRadius - 5;
        const testCoor = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_1__["subtract"])([tVpX, tVpY], [width / 2, height / 2]);
        if (this.isRectInView(testCoor, metric.width, height)) {
            ctx.fillText(name, tVpX, tVpY);
        }
        ctx.restore();
    }
    isCircleInView(vpCoor, radius) {
        // use a cheap check by treating the circle as a square
        const twoR = 2 * radius;
        const topLeft = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_1__["subtract"])(vpCoor, [radius, radius]);
        return this.isRectInView(topLeft, twoR, twoR);
    }
    isRectInView(vpCoor, width, height) {
        // https://stackoverflow.com/a/306332
        const ax1 = 0;
        const ay1 = 0;
        const ax2 = this.width;
        const ay2 = this.height;
        const [bx1, by1] = vpCoor;
        const bx2 = bx1 + width;
        const by2 = by1 + height;
        return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
    }
    drawStar(name, radiusGame, x, y) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const ctx = this.ctx;
        const [vpX, vpY] = this.operator.toVpCoor([x, y]);
        const radius = Math.max(1, radiusGame * gridSize);
        ctx.beginPath();
        ctx.arc(vpX, vpY, radius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
        ctx.fill();
        const metric = ctx.measureText(name);
        const height = 20; // an estimate
        const width = metric.width;
        const tVpX = vpX;
        const tVpY = vpY - radius - 5;
        const testCoor = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_1__["subtract"])([tVpX, tVpY], [width / 2, height / 2]);
        if (this.isRectInView(testCoor, metric.width, height)) {
            ctx.fillText(name, tVpX, tVpY);
        }
    }
    drawShip(radiusGame, x, y) {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const ctx = this.ctx;
        const [vpX, vpY] = this.operator.toVpCoor([x, y]);
        const radius = Math.max(1, radiusGame * gridSize);
        if (radius < 1) {
            return;
        }
        ctx.beginPath();
        ctx.arc(vpX, vpY, radius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
        ctx.fill();
    }
    drawObjects() {
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        // extract boundary and search it in the index
        const [tlX, tlY] = this.operator.toGameCoor([0, 0]);
        const [brX, brY] = this.operator.toGameCoor([this.width, this.height]);
        const drawData = db.calDrawData(tlX, tlY, brX, brY, gridSize);
        const ctx = this.ctx;
        ctx.save();
        // star
        ctx.fillStyle = "yellow";
        // star label
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const { name, radius, x, y } of drawData.stars) {
            this.drawStar(name, radius, x, y);
        }
        // orbit
        ctx.strokeStyle = "white";
        ctx.setLineDash([5, 3]);
        // planet
        ctx.fillStyle = "green";
        // planet label
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const { name, radius, x, y, cx, cy } of drawData.planets) {
            const coor = [x, y];
            const centerCoor = [cx, cy];
            this.drawPlanet(name, coor, radius, centerCoor);
        }
        for (const { kind, radius, x, y } of drawData.ships) {
            console.log("{0} {1}", kind, _galaxy__WEBPACK_IMPORTED_MODULE_2__["SpacecraftKind"][kind]);
            this.drawShip(radius, x, y);
        }
        ctx.restore();
    }
    updateCachedGrid() {
        const canvas = this.cachedGrid;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("cannot create context");
        }
        const db = this.db;
        const viewData = db.galaxyViewData;
        const gridSize = viewData.gridSize;
        const center = viewData.center;
        const gridColor = "#0c0c0c";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = gridColor;
        ctx.translate(0.5, 0.5);
        const [cx, cy] = center;
        // truncate to the nearest integer (every lines on the grid lie on the integers)
        const x = Math.floor(cx);
        const y = Math.floor(cy);
        const [vpX, vpY] = this.operator.toVpCoor([x, y]);
        // draw small grid
        ctx.beginPath();
        if (gridSize >= _def__WEBPACK_IMPORTED_MODULE_4__["MIN_SHOW_GRID_SIZE"]) {
            // draw all vertical lines
            const numVert = Math.ceil(this.width / gridSize);
            let curVpX = vpX % gridSize;
            for (let i = 0; i <= numVert; i++) {
                ctx.moveTo(curVpX, 0);
                ctx.lineTo(curVpX, canvas.height);
                curVpX += gridSize;
            }
            // draw all horizontal lines
            const numHori = Math.ceil(this.height / gridSize);
            let curVpY = vpY % gridSize;
            for (let i = 0; i <= numHori; i++) {
                ctx.moveTo(0, curVpY);
                ctx.lineTo(canvas.width, curVpY);
                curVpY += gridSize;
            }
        }
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.translate(0.5, 0.5);
        if (gridSize >= _def__WEBPACK_IMPORTED_MODULE_4__["MIN_SHOW_GRID_SIZE"]) {
            ctx.strokeStyle = "#282828";
        }
        else {
            ctx.strokeStyle = gridColor;
        }
        {
            const xBig = x - (x % _def__WEBPACK_IMPORTED_MODULE_4__["BIG_GRID_FACTOR"]);
            const yBig = y - (y % _def__WEBPACK_IMPORTED_MODULE_4__["BIG_GRID_FACTOR"]);
            const bigGridSize = _def__WEBPACK_IMPORTED_MODULE_4__["BIG_GRID_FACTOR"] * gridSize;
            const [vpXBig, vpYBig] = this.operator.toVpCoor([xBig, yBig]);
            ctx.beginPath();
            const numVert = Math.ceil(this.width / bigGridSize);
            let curVpX = vpXBig % bigGridSize;
            for (let i = 0; i <= numVert; i++) {
                ctx.moveTo(curVpX, 0);
                ctx.lineTo(curVpX, canvas.height);
                curVpX += bigGridSize;
            }
            // draw all horizontal lines
            const numHori = Math.ceil(this.height / bigGridSize);
            let curVpY = vpYBig % bigGridSize;
            for (let i = 0; i <= numHori; i++) {
                ctx.moveTo(0, curVpY);
                ctx.lineTo(canvas.width, curVpY);
                curVpY += bigGridSize;
            }
            ctx.stroke();
        }
        ctx.restore();
    }
    panTo(vpOffset) {
        this.updatePanAnimation = this.operator.panTo(vpOffset);
    }
}
customElements.define("map-view", GalaxyView, { extends: "canvas" });
//# sourceMappingURL=GalaxyView.js.map

/***/ }),

/***/ "./build/view/NationView.js":
/*!**********************************!*\
  !*** ./build/view/NationView.js ***!
  \**********************************/
/*! exports provided: NationView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NationView", function() { return NationView; });
const TEMPLATE = document.getElementById("nationView");
console.assert(TEMPLATE !== null);
class NationView extends HTMLElement {
    constructor(db) {
        super();
        this.db = db;
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    }
    update(_) {
        //
    }
}
customElements.define("nation-view", NationView);
//# sourceMappingURL=NationView.js.map

/***/ }),

/***/ "./build/view/PeopleView.js":
/*!**********************************!*\
  !*** ./build/view/PeopleView.js ***!
  \**********************************/
/*! exports provided: PeopleView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PeopleView", function() { return PeopleView; });
const TEMPLATE = document.getElementById("peopleView");
console.assert(TEMPLATE !== null);
class PeopleView extends HTMLElement {
    constructor(db) {
        super();
        this.db = db;
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    }
    update(_) {
        //
    }
}
customElements.define("people-view", PeopleView);
//# sourceMappingURL=PeopleView.js.map

/***/ }),

/***/ "./build/view/PlanetView.js":
/*!**********************************!*\
  !*** ./build/view/PlanetView.js ***!
  \**********************************/
/*! exports provided: PlanetView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlanetView", function() { return PlanetView; });
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! myalgo-ts */ "../myalgo-ts/dist/index.js");
/* harmony import */ var myalgo_ts__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _galaxy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../galaxy */ "./galaxy.js");
/* harmony import */ var _galaxy_bg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../galaxy_bg */ "./galaxy_bg.wasm");
/* harmony import */ var _CanvasOperator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CanvasOperator */ "./build/view/CanvasOperator.js");
/* harmony import */ var _def__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./def */ "./build/view/def.js");
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./helper */ "./build/view/helper.js");






const TEMPLATE = document.getElementById("planetView");
console.assert(TEMPLATE !== null);
function getColor(nationId) {
    // https://en.wikipedia.org/wiki/Linear_congruential_generator
    const modulus = Math.pow(2, 31);
    const a = 1103515245;
    const c = 12345;
    const mix = (a * nationId + c) % modulus;
    // https://stackoverflow.com/a/1152054
    return "#" + (0x1000000 + mix * 0xffffff).toString(16).substr(1, 6);
}
class PlanetView extends HTMLElement {
    constructor(db, planetId) {
        super();
        this.db = db;
        this.planetId = planetId;
        this.planetViewData = {
            center: [0, 0],
            gridSize: _def__WEBPACK_IMPORTED_MODULE_4__["MIN_GRID_SIZE"],
        };
        this.shouldRedrawView = true;
        this.planetDim = this.db.galaxy.cal_planet_dim(this.planetId);
        this.doubleClick = (e) => {
            const vpOffset = this.operator.getOffsetFromCenter(e);
            this.panTo(vpOffset);
        };
        this.singleClick = (e) => {
            const vpOffset = this.operator.getOffsetFromTopLeft(e);
            const [x, y] = this.operator.toGameCoor(vpOffset);
            // TODO
            const str = this.db.galaxy.cal_planet_click(this.planetId, x, y);
            console.log(str + " " + x + " " + y);
        };
        this.resizeCanvas = () => {
            const canvas = this.canvas;
            const width = 400;
            const height = 400;
            this.canvas.style.height = height.toString();
            this.canvas.style.width = width.toString();
            if (canvas.width !== width ||
                canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                this.shouldRedrawView = true;
            }
        };
        this.draw = () => {
            this.resizeCanvas();
            if (this.updatePanAnimation) {
                if (this.updatePanAnimation()) {
                    this.updatePanAnimation = undefined;
                }
                this.shouldRedrawView = true;
            }
            if (this.shouldRedrawView) {
                // note: need to copy the data because memory may invalidate upon calling (any wasm object's) free()
                const points = this.db.getPlanetPoints(this.planetId);
                const points2 = [];
                for (let i = 0; i < points.length; i += 2) {
                    const x = points[i];
                    const y = points[i + 1];
                    const gameCoor = [x, y];
                    const vpCoor = this.operator.toVpCoor(gameCoor);
                    points2.push({ gameCoor, vpCoor });
                }
                const colonized = this.getColonizedMap();
                this.drawMap(points2, colonized);
            }
            this.shouldRedrawView = false;
            requestAnimationFrame(this.draw);
        };
        this.drawMap = (points, colonized) => {
            const ctx = this.ctx;
            const db = this.db;
            const galaxy = db.galaxy;
            const normalizedCityRadiusLimit = PlanetView.cityRadiusLimit * this.planetViewData.gridSize;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // draw detailed cities, if zoomed enough
            points.forEach(({ gameCoor: [cityX, cityY], vpCoor: vpCity }, vertexIdx) => {
                if (colonized[vertexIdx] < 0) {
                    return;
                }
                if (!this.operator.isCircleInView(vpCity, normalizedCityRadiusLimit)) {
                    return;
                }
                const baseStructureSize = normalizedCityRadiusLimit / 50;
                // draw fancy detailed city (when zoomed enough)
                if (baseStructureSize >= 1) {
                    const graph = this.db.galaxy.cal_city_graph(this.planetId, vertexIdx);
                    const numStructures = graph.num_structures;
                    if (numStructures > 0) {
                        const detailCityPoints = new Float32Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_2__["memory"].buffer, graph.get_points(), 2 * numStructures);
                        const dims = new Uint8Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_2__["memory"].buffer, graph.get_dims(), 2 * numStructures);
                        const roads = new Uint32Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_2__["memory"].buffer, graph.get_roads(), (numStructures - 1) * 2); // n-1 edges in a tree with n vertices
                        ctx.save();
                        ctx.beginPath();
                        ctx.strokeStyle = "gray";
                        ctx.fillStyle = "black";
                        ctx.lineWidth = 1;
                        for (let j = 0; j < roads.length; j += 2) {
                            console.assert(roads[j] !== roads[j + 1]);
                            const uIdx = 2 * roads[j];
                            const vIdx = 2 * roads[j + 1];
                            console.assert(uIdx !== vIdx);
                            const x0 = detailCityPoints[uIdx];
                            const y0 = detailCityPoints[uIdx + 1];
                            const x1 = detailCityPoints[vIdx];
                            const y1 = detailCityPoints[vIdx + 1];
                            console.assert(Number.isFinite(x0));
                            console.assert(Number.isFinite(x1));
                            console.assert(Number.isFinite(y0));
                            console.assert(Number.isFinite(y1));
                            console.assert(x0 !== x1 && y0 !== y1);
                            const [vpX0, vpY0] = this.operator.toVpCoor([cityX + x0, cityY + y0]);
                            const [vpX1, vpY1] = this.operator.toVpCoor([cityX + x1, cityY + y1]);
                            if ((vpX0 === vpX1 && vpY0 === vpY1)) { // segment too short
                                continue;
                            }
                            ctx.moveTo(vpX0, vpY0);
                            ctx.lineTo(vpX1, vpY1);
                        }
                        ctx.stroke();
                        for (let j = 0; j < detailCityPoints.length; j += 2) {
                            const x = detailCityPoints[j];
                            const y = detailCityPoints[j + 1];
                            const w = Math.max(1, dims[j] * baseStructureSize);
                            const h = Math.max(1, dims[j + 1] * baseStructureSize);
                            const [vpX, vpY] = this.operator.toVpCoor([cityX + x, cityY + y]);
                            if (!this.operator.isRectInView([vpX, vpY], w, h)) {
                                continue;
                            }
                            ctx.rect(vpX, vpY, w, h);
                        }
                        ctx.fill();
                        ctx.restore();
                    }
                    graph.free();
                }
            });
            ctx.save();
            // edges
            const edges = db.getPlanetEdges(this.planetId);
            ctx.save();
            {
                ctx.beginPath();
                ctx.strokeStyle = "gray";
                ctx.fillStyle = "white";
                ctx.lineWidth = 2;
                for (let i = 0; i < edges.length; i += 2) {
                    const idx0 = edges[i];
                    const idx1 = edges[i + 1];
                    const [vpX0, vpY0] = points[idx0].vpCoor;
                    const [vpX1, vpY1] = points[idx1].vpCoor;
                    ctx.moveTo(vpX0, vpY0);
                    ctx.lineTo(vpX1, vpY1);
                }
                ctx.stroke();
            }
            ctx.restore();
            const ownNationId = 0; // TODO
            // colonized vertices (own nation)
            ctx.save();
            {
                ctx.fillStyle = "green";
                ctx.lineWidth = 5;
                points.forEach(({ vpCoor }, vertexIdx) => {
                    const targetNationId = colonized[vertexIdx];
                    if (targetNationId !== ownNationId) {
                        return;
                    }
                    const [vpX, vpY] = vpCoor;
                    const radius = 10;
                    if (!this.operator.isCircleInView(vpCoor, radius)) {
                        return;
                    }
                    ctx.beginPath();
                    ctx.strokeStyle = getColor(targetNationId);
                    ctx.arc(vpX, vpY, radius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                });
            }
            ctx.restore();
            // colonized vertices (neutral)
            ctx.save();
            {
                ctx.fillStyle = "yellow";
                ctx.lineWidth = 5;
                points.forEach(({ vpCoor }, vertexIdx) => {
                    const targetNationId = colonized[vertexIdx];
                    if (targetNationId < 0 || targetNationId === ownNationId || galaxy.is_at_war_with(ownNationId, targetNationId)) {
                        return;
                    }
                    const [vpX, vpY] = vpCoor;
                    const radius = 10;
                    if (!this.operator.isCircleInView(vpCoor, radius)) {
                        return;
                    }
                    ctx.beginPath();
                    ctx.strokeStyle = getColor(targetNationId);
                    ctx.arc(vpX, vpY, radius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                });
            }
            ctx.restore();
            // colonized vertices (hostile)
            ctx.save();
            {
                ctx.fillStyle = "red";
                ctx.lineWidth = 5;
                ctx.beginPath();
                points.forEach(({ vpCoor }, vertexIdx) => {
                    const targetNationId = colonized[vertexIdx];
                    if (targetNationId < 0 || targetNationId === ownNationId || !galaxy.is_at_war_with(ownNationId, targetNationId)) {
                        return;
                    }
                    const [vpX, vpY] = vpCoor;
                    const radius = 10;
                    if (!this.operator.isCircleInView(vpCoor, radius)) {
                        return;
                    }
                    ctx.beginPath();
                    ctx.strokeStyle = getColor(targetNationId);
                    ctx.arc(vpX, vpY, radius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
                    ctx.closePath();
                    ctx.stroke();
                    ctx.fill();
                });
            }
            ctx.restore();
            // uncolonized vertices
            ctx.save();
            {
                ctx.fillStyle = "white";
                ctx.beginPath();
                points.forEach(({ vpCoor }, vertexIdx) => {
                    if (colonized[vertexIdx] >= 0) {
                        return;
                    }
                    const [vpX, vpY] = vpCoor;
                    const radius = 10;
                    if (!this.operator.isCircleInView(vpCoor, radius)) {
                        return;
                    }
                    ctx.arc(vpX, vpY, radius, 0, _def__WEBPACK_IMPORTED_MODULE_4__["TWO_PI"]);
                    ctx.closePath();
                });
                ctx.fill();
            }
            ctx.restore();
            // draw units
            const soldierWidth = 5;
            const soldierHeight = 10;
            ctx.save();
            {
                ctx.beginPath();
                ctx.fillStyle = "purple";
                points.map(({ vpCoor }, i) => {
                    if (!galaxy.has_division(this.planetId, i)) {
                        return;
                    }
                    const [vpX, vpY] = vpCoor;
                    const vpFinal = [vpX, vpY - 10];
                    const [vpXFinal, vpYFinal] = vpFinal;
                    if (!this.operator.isRectInView(vpFinal, soldierWidth, soldierHeight)) {
                        return;
                    }
                    ctx.rect(vpXFinal, vpYFinal, soldierWidth, soldierHeight);
                });
                ctx.fill();
            }
            ctx.restore();
            ctx.beginPath();
            ctx.textAlign = "center";
            points.map(({ vpCoor }, i) => {
                const text = `${i}(${db.galaxy.get_city_idx(this.planetId, i)})`;
                const metric = ctx.measureText(text);
                const height = 20; // an estimate
                const width = metric.width;
                const [vpX, vpY] = vpCoor;
                const tVpX = vpX;
                const tVpY = vpY - 8;
                const testCoor = Object(myalgo_ts__WEBPACK_IMPORTED_MODULE_0__["subtract"])([tVpX, tVpY], [width / 2, height / 2]);
                if (this.operator.isRectInView(testCoor, metric.width, height)) {
                    ctx.fillText(text, tVpX, tVpY);
                }
            });
            ctx.restore();
        };
        this.pan = (e) => {
            this.panTo([e.deltaX, e.deltaY]);
        };
        this.wheel = (e) => {
            e.preventDefault();
            this.updatePanAnimation = undefined;
            this.operator.zoom(e);
            this.shouldRedrawView = true;
        };
        this.setClickTileIdx = (idx) => () => {
            this.tileId = idx;
        };
        console.assert(this.planetDim > 0);
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this.canvas = shadowRoot.querySelector(".map");
        console.assert(this.canvas !== null);
        this.ctx = this.canvas.getContext("2d");
        this.operator = new _CanvasOperator__WEBPACK_IMPORTED_MODULE_3__["CanvasOperator"](this.canvas, this.planetViewData);
        this.planetName = shadowRoot.querySelector(".name");
        console.assert(this.canvas !== null);
        this.tile = shadowRoot.querySelector(".tile");
        console.assert(this.tile !== null);
        this.polOwner = shadowRoot.querySelector(".polOwner");
        console.assert(this.polOwner !== null);
        this.container = shadowRoot.querySelector(".container");
        console.assert(this.container !== null);
        const gesture = new Hammer.Manager(this.canvas);
        const double = new Hammer.Tap({ event: "doubletap", taps: 2 });
        const single = new Hammer.Tap({ event: "singletap" });
        const pan = new Hammer.Pan().set({ direction: Hammer.DIRECTION_ALL });
        gesture.add([
            double,
            single,
            pan,
        ]);
        double.recognizeWith(single);
        single.requireFailure(double);
        // setup events
        gesture.on("singletap", this.singleClick);
        gesture.on("doubletap", this.doubleClick);
        gesture.on("pan", this.pan);
        this.canvas.addEventListener("wheel", this.wheel);
        this.layout();
        this.draw();
    }
    update(flags) {
        this.shouldRedrawView = true;
    }
    getColonizedMap() {
        return this.db.galaxy.get_colonized_map(this.planetId);
    }
    panTo(vpOffset) {
        this.updatePanAnimation = this.operator.panTo(vpOffset);
    }
    /*
    private updateColonyView(colonyId: IColonyId | null, flags: Set<ChannelKind>) {

        const db = this.db;

        if (colonyId !== null) {
            if (this.colonyView === undefined) {
                this.colonyView = new ColonyView(db, colonyId);
                this.container.appendChild(this.colonyView);
            } else if (colonyId !== this.colonyView.colonyId) {
                this.colonyView.remove();
                this.colonyView = new ColonyView(db, colonyId);
                this.container.appendChild(this.colonyView);
            }
        }
        if (this.colonyView !== undefined) {
            this.colonyView.update(flags);
        }
    }
    */
    layout() {
        Object(_helper__WEBPACK_IMPORTED_MODULE_5__["clearChildren"])(this.canvas);
        const planetId = this.planetId;
        const db = this.db;
        //  const info = db.getPlanetInfo(this.planetId);
        //   setIfDiff(this.planetName, info.name);
    }
}
PlanetView.cityRadiusLimit = _galaxy__WEBPACK_IMPORTED_MODULE_1__["Galaxy"].get_city_radius_limit();
customElements.define("planet-view", PlanetView);
//# sourceMappingURL=PlanetView.js.map

/***/ }),

/***/ "./build/view/PlayerView.js":
/*!**********************************!*\
  !*** ./build/view/PlayerView.js ***!
  \**********************************/
/*! exports provided: PlayerView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlayerView", function() { return PlayerView; });
const TEMPLATE = document.getElementById("playerView");
console.assert(TEMPLATE !== null);
class PlayerView extends HTMLElement {
    constructor(db) {
        super();
        this.db = db;
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
    }
    update(_) {
        //
    }
}
customElements.define("player-view", PlayerView);
//# sourceMappingURL=PlayerView.js.map

/***/ }),

/***/ "./build/view/SearchView.js":
/*!**********************************!*\
  !*** ./build/view/SearchView.js ***!
  \**********************************/
/*! exports provided: SearchView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SearchView", function() { return SearchView; });
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helper */ "./build/view/helper.js");

const TEMPLATE = document.getElementById("searchView");
console.assert(TEMPLATE !== null);
const RESULT_ITEM = document.getElementById("resultItem");
console.assert(RESULT_ITEM !== null);
class SearchView extends HTMLElement {
    constructor(db) {
        super();
        this.db = db;
        this.handleKeyup = () => {
            const db = this.db;
            const term = this.searchTerm.value;
            db.searchName = term;
        };
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this.searchTerm = shadowRoot.querySelector(".searchTerm");
        console.assert(this.searchTerm !== null);
        this.searchTerm.onkeyup = this.handleKeyup;
        this.searchResult = shadowRoot.querySelector(".result");
        console.assert(this.searchResult !== null);
        this.refreshResults();
    }
    update(flags) {
        const db = this.db;
        if (flags.has(3 /* NameSearchUpdate */)) {
            this.refreshResults();
        }
    }
    refreshResults() {
        Object(_helper__WEBPACK_IMPORTED_MODULE_0__["clearChildren"])(this.searchResult);
        const db = this.db;
        const fragment = document.createDocumentFragment();
        for (const result of db.searchNameResult) {
            const inner = document.createDocumentFragment();
            inner.appendChild(RESULT_ITEM.content.cloneNode(true));
            const resultItem = inner.querySelector(".resultItem");
            console.assert(resultItem !== null);
            const nameField = inner.querySelector(".name");
            console.assert(nameField !== null);
            nameField.textContent = result.name;
            const id = result.id;
            if (id.Planet !== undefined) {
                const planetId = id;
                resultItem.onclick = () => db.switchPlanetTab(planetId);
            }
            else if (id.Star !== undefined) {
                // TODO
            }
            else if (id.Nation !== undefined) {
                // TODO
            }
            else if (id.Corporation !== undefined) {
                // TODO
            }
            else {
                throw new Error("not handled");
            }
            fragment.appendChild(inner);
        }
        this.searchResult.appendChild(fragment);
    }
}
customElements.define("search-view", SearchView);
//# sourceMappingURL=SearchView.js.map

/***/ }),

/***/ "./build/view/StationView.js":
/*!***********************************!*\
  !*** ./build/view/StationView.js ***!
  \***********************************/
/*! exports provided: StationView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "StationView", function() { return StationView; });
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helper */ "./build/view/helper.js");

const TEMPLATE = document.getElementById("stationView");
console.assert(TEMPLATE !== null);
class StationView extends HTMLElement {
    constructor(db) {
        super();
        this.db = db;
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this.tbody = shadowRoot.querySelector(".map");
        console.assert(this.tbody !== null);
        this.name = shadowRoot.querySelector(".name");
        console.assert(this.tbody !== null);
        this.layout();
    }
    update(flags) {
        if (this.updateHandler) {
            this.updateHandler(flags);
        }
    }
    layout() {
        Object(_helper__WEBPACK_IMPORTED_MODULE_0__["clearChildren"])(this.tbody);
        Object(_helper__WEBPACK_IMPORTED_MODULE_0__["setIfDiff"])(this.name, "Station 1");
        const width = 2;
        const height = 1;
        const fragment = document.createDocumentFragment();
        for (let h = 0; h < height; h++) {
            const row = document.createElement("tr");
            fragment.appendChild(row);
            for (let w = 0; w < width; w++) {
                const data = document.createElement("td");
                row.appendChild(data);
                data.textContent = "A";
            }
        }
        this.tbody.appendChild(fragment);
    }
}
customElements.define("station-view", StationView);
//# sourceMappingURL=StationView.js.map

/***/ }),

/***/ "./build/view/SwitchView.js":
/*!**********************************!*\
  !*** ./build/view/SwitchView.js ***!
  \**********************************/
/*! exports provided: SwitchView */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SwitchView", function() { return SwitchView; });
/* harmony import */ var _GalaxyView__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GalaxyView */ "./build/view/GalaxyView.js");
/* harmony import */ var _helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helper */ "./build/view/helper.js");
/* harmony import */ var _NationView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./NationView */ "./build/view/NationView.js");
/* harmony import */ var _PeopleView__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PeopleView */ "./build/view/PeopleView.js");
/* harmony import */ var _PlanetView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PlanetView */ "./build/view/PlanetView.js");
/* harmony import */ var _PlayerView__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./PlayerView */ "./build/view/PlayerView.js");
/* harmony import */ var _SearchView__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./SearchView */ "./build/view/SearchView.js");
/* harmony import */ var _StationView__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./StationView */ "./build/view/StationView.js");








const TEMPLATE = document.getElementById("switchView");
console.assert(TEMPLATE !== null);
class SwitchView extends HTMLElement {
    constructor(db) {
        super();
        this.db = db;
        this.tabChildren = new Map();
        this.switch = (data) => {
            const db = this.db;
            if (this.curView === undefined) {
                this.switchHelper(this.createGalaxyView());
            }
            else {
                switch (data.kind) {
                    case 0 /* Galaxy */:
                        if (this.curView.kind !== data.kind) {
                            this.switchHelper(this.createGalaxyView());
                        }
                        break;
                    case 1 /* Planet */:
                        // cleanup
                        switch (this.curView.kind) {
                            case 1 /* Planet */:
                                if (this.curView.planetId === data.planetId) {
                                    return; // no need to switch
                                }
                                break;
                            case 0 /* Galaxy */:
                                this.curView.view.suspend();
                                break;
                        }
                        this.switchHelper(Object.assign({}, data, { view: new _PlanetView__WEBPACK_IMPORTED_MODULE_4__["PlanetView"](db, data.planetId.Planet) }));
                        break;
                    case 2 /* Search */:
                        // cleanup
                        switch (this.curView.kind) {
                            case 0 /* Galaxy */:
                                this.curView.view.suspend();
                                break;
                            case 2 /* Search */:
                                return; // no need to switch
                        }
                        this.switchHelper(Object.assign({}, data, { view: new _SearchView__WEBPACK_IMPORTED_MODULE_6__["SearchView"](db) }));
                        break;
                    case 3 /* Player */:
                        // cleanup
                        switch (this.curView.kind) {
                            case 0 /* Galaxy */:
                                this.curView.view.suspend();
                                break;
                            case 3 /* Player */:
                                return; // no need to switch
                        }
                        this.switchHelper(Object.assign({}, data, { view: new _PlayerView__WEBPACK_IMPORTED_MODULE_5__["PlayerView"](db) }));
                        break;
                    case 4 /* Nation */:
                        // cleanup
                        switch (this.curView.kind) {
                            case 0 /* Galaxy */:
                                this.curView.view.suspend();
                                break;
                            case 4 /* Nation */:
                                return; // no need to switch
                        }
                        this.switchHelper(Object.assign({}, data, { view: new _NationView__WEBPACK_IMPORTED_MODULE_2__["NationView"](db) }));
                        break;
                    case 5 /* Station */:
                        // cleanup
                        switch (this.curView.kind) {
                            case 0 /* Galaxy */:
                                this.curView.view.suspend();
                                break;
                            case 5 /* Station */:
                                return; // no need to switch
                        }
                        this.switchHelper(Object.assign({}, data, { view: new _StationView__WEBPACK_IMPORTED_MODULE_7__["StationView"](db) }));
                        break;
                    case 6 /* People */:
                        // cleanup
                        switch (this.curView.kind) {
                            case 0 /* Galaxy */:
                                this.curView.view.suspend();
                                break;
                            case 6 /* People */:
                                return; // no need to switch
                        }
                        this.switchHelper(Object.assign({}, data, { view: new _PeopleView__WEBPACK_IMPORTED_MODULE_3__["PeopleView"](db) }));
                        break;
                    default:
                        throw new Error("not handled");
                }
            }
            db.moveTabToFront(data.tabId);
            this.updateTabs();
            const curTabId = db.tabId;
            for (const [tabId, element] of this.tabChildren) {
                if (tabId === curTabId) {
                    element.classList.add("selected");
                }
                else {
                    element.classList.remove("selected");
                }
            }
        };
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));
        this.tabs = shadowRoot.querySelector(".tabs");
        console.assert(this.tabs !== null);
        this.container = shadowRoot.querySelector(".container");
        console.assert(this.container !== null);
        const tabData = db.tabs[0];
        console.assert(tabData.kind === 0 /* Galaxy */);
        this.switch(tabData);
    }
    update(flags) {
        if (flags.has(1 /* Tabs */)) {
            this.updateTabs();
        }
        if (flags.has(2 /* SwitchTab */)) {
            const db = this.db;
            if (db.tabId !== this.curView.tabId) {
                const tabData = db.tabs.find((x) => x.tabId === db.tabId);
                console.assert(tabData !== undefined);
                this.switch(tabData);
            }
        }
        this.curView.view.update(flags);
    }
    updateTabs() {
        const db = this.db;
        Object(_helper__WEBPACK_IMPORTED_MODULE_1__["clearChildren"])(this.tabs);
        const oldTabChildren = this.tabChildren;
        this.tabChildren = new Map();
        for (const data of this.db.tabs) {
            // try to get or create the tab
            let tab = oldTabChildren.get(data.tabId);
            if (tab) {
                this.tabChildren.set(data.tabId, tab);
            }
            else {
                tab = document.createElement("div");
                tab.onclick = () => this.db.tabId = data.tabId;
                switch (data.kind) {
                    case 0 /* Galaxy */:
                        tab.textContent = "Galaxy";
                        break;
                    case 1 /* Planet */:
                        {
                            const planetName = db.getPlanetName(data.planetId);
                            tab.textContent = planetName;
                        }
                        break;
                    case 2 /* Search */:
                        tab.textContent = "Search";
                        break;
                    case 3 /* Player */:
                        tab.textContent = "Player";
                        break;
                    case 4 /* Nation */:
                        tab.textContent = "Nation";
                        break;
                    case 5 /* Station */:
                        tab.textContent = "Station";
                        break;
                    case 6 /* People */:
                        tab.textContent = "People";
                        break;
                    default:
                        throw new Error("not handled");
                }
                this.tabChildren.set(data.tabId, tab);
            }
            this.tabs.appendChild(tab);
        }
    }
    switchHelper(view) {
        Object(_helper__WEBPACK_IMPORTED_MODULE_1__["clearChildren"])(this.container);
        this.curView = view;
        this.container.appendChild(view.view);
    }
    createGalaxyView() {
        const db = this.db;
        console.assert(db.tabs.length > 0 && db.tabs[0].kind === 0 /* Galaxy */);
        const tabId = db.tabs[0].tabId;
        return {
            kind: 0 /* Galaxy */,
            tabId,
            view: new _GalaxyView__WEBPACK_IMPORTED_MODULE_0__["GalaxyView"](this.db),
        };
    }
}
customElements.define("switch-view", SwitchView);
//# sourceMappingURL=SwitchView.js.map

/***/ }),

/***/ "./build/view/def.js":
/*!***************************!*\
  !*** ./build/view/def.js ***!
  \***************************/
/*! exports provided: MAX_GRID_SIZE, MIN_GRID_SIZE, MIN_SHOW_GRID_SIZE, BIG_GRID_FACTOR, TWO_PI */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MAX_GRID_SIZE", function() { return MAX_GRID_SIZE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MIN_GRID_SIZE", function() { return MIN_GRID_SIZE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MIN_SHOW_GRID_SIZE", function() { return MIN_SHOW_GRID_SIZE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BIG_GRID_FACTOR", function() { return BIG_GRID_FACTOR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TWO_PI", function() { return TWO_PI; });
const MAX_GRID_SIZE = 40;
const MIN_GRID_SIZE = 1;
const MIN_SHOW_GRID_SIZE = 10;
const BIG_GRID_FACTOR = 40;
const TWO_PI = 2 * Math.PI;
//# sourceMappingURL=def.js.map

/***/ }),

/***/ "./build/view/helper.js":
/*!******************************!*\
  !*** ./build/view/helper.js ***!
  \******************************/
/*! exports provided: setIfDiff, clearChildren, batchChildren */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setIfDiff", function() { return setIfDiff; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearChildren", function() { return clearChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "batchChildren", function() { return batchChildren; });
function setIfDiff(element, val) {
    const str = val.toString();
    if (element.textContent !== str) {
        element.textContent = str;
    }
}
function clearChildren(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}
function batchChildren(it) {
    const fragment = document.createDocumentFragment();
    for (const e of it) {
        fragment.appendChild(e);
    }
    return fragment;
}
//# sourceMappingURL=helper.js.map

/***/ }),

/***/ "./galaxy.js":
/*!*******************!*\
  !*** ./galaxy.js ***!
  \*******************/
/*! exports provided: __wbg_log_c6333848a0d98630, get_planet_vertex_dist, get_ticks_per_second, SquadKind, CombatStyle, Direction, AccessRight, Product, SpacecraftKind, bootstrap, __wbg_error_cc95a3d302735ca3, __wbg_random_fabf73e8a709437c, NationId, NeighbourNations, Soldiers, ProductParams, Galaxy, CityGraph, __wbindgen_object_drop_ref, __wbindgen_json_parse, __wbindgen_json_serialize, __wbindgen_throw */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbg_log_c6333848a0d98630", function() { return __wbg_log_c6333848a0d98630; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_planet_vertex_dist", function() { return get_planet_vertex_dist; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_ticks_per_second", function() { return get_ticks_per_second; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SquadKind", function() { return SquadKind; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CombatStyle", function() { return CombatStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Direction", function() { return Direction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AccessRight", function() { return AccessRight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Product", function() { return Product; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SpacecraftKind", function() { return SpacecraftKind; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bootstrap", function() { return bootstrap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbg_error_cc95a3d302735ca3", function() { return __wbg_error_cc95a3d302735ca3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbg_random_fabf73e8a709437c", function() { return __wbg_random_fabf73e8a709437c; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NationId", function() { return NationId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NeighbourNations", function() { return NeighbourNations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Soldiers", function() { return Soldiers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ProductParams", function() { return ProductParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Galaxy", function() { return Galaxy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CityGraph", function() { return CityGraph; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_object_drop_ref", function() { return __wbindgen_object_drop_ref; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_json_parse", function() { return __wbindgen_json_parse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_json_serialize", function() { return __wbindgen_json_serialize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__wbindgen_throw", function() { return __wbindgen_throw; });
/* harmony import */ var _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./galaxy_bg */ "./galaxy_bg.wasm");
/* tslint:disable */


let cachegetUint16Memory = null;
function getUint16Memory() {
    if (cachegetUint16Memory === null || cachegetUint16Memory.buffer !== _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer) {
        cachegetUint16Memory = new Uint16Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer);
    }
    return cachegetUint16Memory;
}

function passArray16ToWasm(arg) {
    const ptr = _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_malloc"](arg.length * 2);
    getUint16Memory().set(arg, ptr / 2);
    return [ptr, arg.length];
}

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer) {
        cachegetUint32Memory = new Uint32Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer);
    }
    return cachegetUint32Memory;
}

function getArrayU32FromWasm(ptr, len) {
    return getUint32Memory().subarray(ptr / 4, ptr / 4 + len);
}

let cachedGlobalArgumentPtr = null;
function globalArgumentPtr() {
    if (cachedGlobalArgumentPtr === null) {
        cachedGlobalArgumentPtr = _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_global_argument_ptr"]();
    }
    return cachedGlobalArgumentPtr;
}

const stack = [];

const slab = [{ obj: undefined }, { obj: null }, { obj: true }, { obj: false }];

function getObject(idx) {
    if ((idx & 1) === 1) {
        return stack[idx >> 1];
    } else {
        const val = slab[idx >> 1];

        return val.obj;

    }
}

let slab_next = slab.length;

function dropRef(idx) {

    idx = idx >> 1;
    if (idx < 4) return;
    let obj = slab[idx];

    obj.cnt -= 1;
    if (obj.cnt > 0) return;

    // If we hit 0 then free up our space in the slab
    slab[idx] = slab_next;
    slab_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropRef(idx);
    return ret;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? __webpack_require__(/*! util */ "./node_modules/util/util.js").TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer) {
        cachegetUint8Memory = new Uint8Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer);
    }
    return cachegetUint8Memory;
}

function passStringToWasm(arg) {

    const buf = cachedTextEncoder.encode(arg);
    const ptr = _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_malloc"](buf.length);
    getUint8Memory().set(buf, ptr);
    return [ptr, buf.length];
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer) {
        cachegetInt32Memory = new Int32Array(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["memory"].buffer);
    }
    return cachegetInt32Memory;
}

function getArrayI32FromWasm(ptr, len) {
    return getInt32Memory().subarray(ptr / 4, ptr / 4 + len);
}

function addHeapObject(obj) {
    if (slab_next === slab.length) slab.push(slab.length + 1);
    const idx = slab_next;
    const next = slab[idx];

    slab_next = next;

    slab[idx] = { obj, cnt: 1 };
    return idx << 1;
}

function getArrayU8FromWasm(ptr, len) {
    return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? __webpack_require__(/*! util */ "./node_modules/util/util.js").TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

const __wbg_log_c6333848a0d98630_target = console.log;

function __wbg_log_c6333848a0d98630(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);
    __wbg_log_c6333848a0d98630_target(varg0);
}
/**
* @returns {number}
*/
function get_planet_vertex_dist() {
    return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["get_planet_vertex_dist"]();
}

/**
* @returns {number}
*/
function get_ticks_per_second() {
    return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["get_ticks_per_second"]();
}

/**
*/
const SquadKind = Object.freeze({ Infantry:0,Robot:1,Tank:2,Wagon:3,Colonist:4, });
/**
*/
const CombatStyle = Object.freeze({ Push:0,Fill:1,Overrun:2,Avoid:3, });
/**
*/
const Direction = Object.freeze({ North:0,South:1,East:2,West:3, });
/**
*/
const AccessRight = Object.freeze({ None:0,Civilian:1,Military:2, });
/**
*/
const Product = Object.freeze({ Crop:0,Metal:1,Gem:2,Fuel:3,Concrete:4,Supply:5,Alloy:6,Fiber:7,Chemical:8,Circuit:9,Food:10,Apparel:11,Medicine:12,Computer:13,Accessory:14,Furniture:15,Vehicle:16,Machine:17,Tool:18,Hull:19,Engine:20,Weapon:21,Shield:22,Armor:23,Countermeasure:24,Rifle:25,Uniform:26,Saber:27,Exoskeleton:28, });
/**
*/
const SpacecraftKind = Object.freeze({ Freighter:0,Fighter:1,Bomber:2,Trooper:3,Destroyer:4,BombardCraft:5,Battleship:6,Station:7,Fortress:8,Carrier:9,Shipyard:10,Constructor:11, });
/**
* @returns {void}
*/
function bootstrap() {
    return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["bootstrap"]();
}

const __wbg_error_cc95a3d302735ca3_target = console.error;

function __wbg_error_cc95a3d302735ca3(arg0, arg1) {
    let varg0 = getStringFromWasm(arg0, arg1);

    varg0 = varg0.slice();
    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](arg0, arg1 * 1);

    __wbg_error_cc95a3d302735ca3_target(varg0);
}

const __wbg_random_fabf73e8a709437c_target = Math.random;

function __wbg_random_fabf73e8a709437c() {
    return __wbg_random_fabf73e8a709437c_target();
}

function freeNationId(ptr) {

    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_nationid_free"](ptr);
}
/**
*/
class NationId {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeNationId(ptr);
    }
}

function freeNeighbourNations(ptr) {

    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_neighbournations_free"](ptr);
}
/**
*/
class NeighbourNations {

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeNeighbourNations(ptr);
    }
    /**
    * @returns {Uint32Array}
    */
    get_nation_ids() {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["neighbournations_get_nation_ids"](retptr, this.ptr);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayU32FromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 4);
        return realRet;

    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    get_num_border_tiles(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["neighbournations_get_num_border_tiles"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @returns {Uint32Array}
    */
    get_border_tiles(arg0) {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["neighbournations_get_border_tiles"](retptr, this.ptr, arg0);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayU32FromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 4);
        return realRet;

    }
}

function freeSoldiers(ptr) {

    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_soldiers_free"](ptr);
}
/**
*/
class Soldiers {
    /**
    * @returns {number}
    */
    get troops() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_soldiers_troops"](this.ptr);
    }
    set troops(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_soldiers_troops"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get rifle() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_soldiers_rifle"](this.ptr);
    }
    set rifle(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_soldiers_rifle"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get uniform() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_soldiers_uniform"](this.ptr);
    }
    set uniform(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_soldiers_uniform"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get saber() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_soldiers_saber"](this.ptr);
    }
    set saber(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_soldiers_saber"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get exoskeleton() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_soldiers_exoskeleton"](this.ptr);
    }
    set exoskeleton(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_soldiers_exoskeleton"](this.ptr, arg0);
    }
    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeSoldiers(ptr);
    }
}

function freeProductParams(ptr) {

    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_productparams_free"](ptr);
}
/**
*/
class ProductParams {
    /**
    * @returns {number}
    */
    get production_capacity() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_productparams_production_capacity"](this.ptr);
    }
    set production_capacity(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_productparams_production_capacity"](this.ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get qty() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_productparams_qty"](this.ptr);
    }
    set qty(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_productparams_qty"](this.ptr, arg0);
    }
    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeProductParams(ptr);
    }
}

function freeGalaxy(ptr) {

    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_galaxy_free"](ptr);
}
/**
*/
class Galaxy {

    static __wrap(ptr) {
        const obj = Object.create(Galaxy.prototype);
        obj.ptr = ptr;

        return obj;
    }

    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeGalaxy(ptr);
    }
    /**
    * @returns {Galaxy}
    */
    static new() {
        return Galaxy.__wrap(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_new"]());
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {number} arg2
    * @returns {void}
    */
    interop_colonize(arg0, arg1, arg2) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_colonize"](this.ptr, arg0, arg1, arg2);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {void}
    */
    justify_war(arg0, arg1) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_justify_war"](this.ptr, arg0, arg1);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {boolean}
    */
    has_war_goal(arg0, arg1) {
        return (_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_has_war_goal"](this.ptr, arg0, arg1)) !== 0;
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {Uint16Array} arg2
    * @param {Uint16Array} arg3
    * @returns {void}
    */
    declare_war(arg0, arg1, arg2, arg3) {
        const [ptr2, len2] = passArray16ToWasm(arg2);
        const [ptr3, len3] = passArray16ToWasm(arg3);
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_declare_war"](this.ptr, arg0, arg1, ptr2, len2, ptr3, len3);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {boolean}
    */
    is_at_war_with(arg0, arg1) {
        return (_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_is_at_war_with"](this.ptr, arg0, arg1)) !== 0;
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {number} arg2
    * @returns {void}
    */
    change_access_right(arg0, arg1, arg2) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_change_access_right"](this.ptr, arg0, arg1, arg2);
    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    static access_threshold(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_access_threshold"](arg0);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {any}
    */
    interop_search(arg0, arg1) {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_search"](this.ptr, arg0, arg1));
    }
    /**
    * @param {string} arg0
    * @returns {any}
    */
    interop_search_name(arg0) {
        const [ptr0, len0] = passStringToWasm(arg0);
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_search_name"](this.ptr, ptr0, len0));
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {number} arg2
    * @param {number} arg3
    * @param {number} arg4
    * @returns {any}
    */
    interop_cal_draw_data(arg0, arg1, arg2, arg3, arg4) {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_cal_draw_data"](this.ptr, arg0, arg1, arg2, arg3, arg4));
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {number}
    */
    get_city_idx(arg0, arg1) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_city_idx"](this.ptr, arg0, arg1);
    }
    /**
    * @returns {number}
    */
    static get_city_radius_limit() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_city_radius_limit"]();
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {CityGraph}
    */
    cal_city_graph(arg0, arg1) {
        return CityGraph.__wrap(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_cal_city_graph"](this.ptr, arg0, arg1));
    }
    /**
    * @param {number} arg0
    * @returns {Int32Array}
    */
    get_colonized_map(arg0) {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_colonized_map"](retptr, this.ptr, arg0);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayI32FromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 4);
        return realRet;

    }
    /**
    * @param {any} arg0
    * @returns {void}
    */
    mock_cal_civilian_demands(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_mock_cal_civilian_demands"](this.ptr, addHeapObject(arg0));
    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    get_nation_relation(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_nation_relation"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {any}
    */
    interop_search_neighbour_nations(arg0, arg1) {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_search_neighbour_nations"](this.ptr, arg0, arg1));
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {boolean}
    */
    has_division(arg0, arg1) {
        return (_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_has_division"](this.ptr, arg0, arg1)) !== 0;
    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    cal_planet_dim(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_cal_planet_dim"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    get_planet_width(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_planet_width"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    get_planet_height(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_planet_height"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @returns {number}
    */
    get_planet_points(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_planet_points"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {boolean} arg2
    * @param {number} arg3
    * @param {number} arg4
    * @returns {Uint8Array}
    */
    get_planet_path(arg0, arg1, arg2, arg3, arg4) {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_planet_path"](retptr, this.ptr, arg0, arg1, arg2 ? 1 : 0, arg3, arg4);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayU8FromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 1);
        return realRet;

    }
    /**
    * @param {number} arg0
    * @returns {Uint8Array}
    */
    get_planet_edges(arg0) {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_planet_edges"](retptr, this.ptr, arg0);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getArrayU8FromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 1);
        return realRet;

    }
    /**
    * @param {number} arg0
    * @returns {string}
    */
    get_planet_name(arg0) {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_planet_name"](retptr, this.ptr, arg0);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getStringFromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 1);
        return realRet;

    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @param {number} arg2
    * @returns {string}
    */
    cal_planet_click(arg0, arg1, arg2) {
        const retptr = globalArgumentPtr();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_cal_planet_click"](retptr, this.ptr, arg0, arg1, arg2);
        const mem = getUint32Memory();
        const rustptr = mem[retptr / 4];
        const rustlen = mem[retptr / 4 + 1];

        const realRet = getStringFromWasm(rustptr, rustlen).slice();
        _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbindgen_free"](rustptr, rustlen * 1);
        return realRet;

    }
    /**
    * @returns {Galaxy}
    */
    cal_next_state() {
        const ptr = this.ptr;
        this.ptr = 0;
        return Galaxy.__wrap(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_cal_next_state"](ptr));
    }
    /**
    * @param {any} arg0
    * @param {number} arg1
    * @param {boolean} arg2
    * @returns {void}
    */
    add_division_template(arg0, arg1, arg2) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_add_division_template"](this.ptr, addHeapObject(arg0), arg1, arg2 ? 1 : 0);
    }
    /**
    * @param {number} arg0
    * @returns {any}
    */
    get_division_template(arg0) {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_division_template"](this.ptr, arg0));
    }
    /**
    * @param {number} arg0
    * @returns {void}
    */
    train_division(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_train_division"](this.ptr, arg0);
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {void}
    */
    interop_move_division(arg0, arg1) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_move_division"](this.ptr, arg0, arg1);
    }
    /**
    * @returns {any}
    */
    get_divisions_in_training() {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_divisions_in_training"](this.ptr));
    }
    /**
    * @returns {any}
    */
    get_divisions_undeployed() {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_divisions_undeployed"](this.ptr));
    }
    /**
    * @returns {any}
    */
    get_all_division_location() {
        return takeObject(_galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_get_all_division_location"](this.ptr));
    }
    /**
    * @param {number} arg0
    * @param {number} arg1
    * @returns {void}
    */
    interop_deploy_division(arg0, arg1) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["galaxy_interop_deploy_division"](this.ptr, arg0, arg1);
    }
}

function freeCityGraph(ptr) {

    _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_citygraph_free"](ptr);
}
/**
*/
class CityGraph {

    static __wrap(ptr) {
        const obj = Object.create(CityGraph.prototype);
        obj.ptr = ptr;

        return obj;
    }

    /**
    * @returns {number}
    */
    get num_structures() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_get_citygraph_num_structures"](this.ptr);
    }
    set num_structures(arg0) {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["__wbg_set_citygraph_num_structures"](this.ptr, arg0);
    }
    free() {
        const ptr = this.ptr;
        this.ptr = 0;
        freeCityGraph(ptr);
    }
    /**
    * @returns {number}
    */
    get_points() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["citygraph_get_points"](this.ptr);
    }
    /**
    * @returns {number}
    */
    get_dims() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["citygraph_get_dims"](this.ptr);
    }
    /**
    * @returns {number}
    */
    get_roads() {
        return _galaxy_bg__WEBPACK_IMPORTED_MODULE_0__["citygraph_get_roads"](this.ptr);
    }
}

function __wbindgen_object_drop_ref(i) {
    dropRef(i);
}

function __wbindgen_json_parse(ptr, len) {
    return addHeapObject(JSON.parse(getStringFromWasm(ptr, len)));
}

function __wbindgen_json_serialize(idx, ptrptr) {
    const [ptr, len] = passStringToWasm(JSON.stringify(getObject(idx)));
    getUint32Memory()[ptrptr / 4] = ptr;
    return len;
}

function __wbindgen_throw(ptr, len) {
    throw new Error(getStringFromWasm(ptr, len));
}



/***/ }),

/***/ "./galaxy_bg.wasm":
/*!************************!*\
  !*** ./galaxy_bg.wasm ***!
  \************************/
/*! exports provided: memory, __indirect_function_table, __heap_base, __data_end, galaxy_new, galaxy_interop_colonize, galaxy_justify_war, galaxy_has_war_goal, galaxy_declare_war, galaxy_is_at_war_with, galaxy_change_access_right, galaxy_access_threshold, __wbg_neighbournations_free, neighbournations_get_nation_ids, neighbournations_get_num_border_tiles, neighbournations_get_border_tiles, galaxy_interop_search, galaxy_interop_search_name, galaxy_interop_cal_draw_data, galaxy_get_city_idx, galaxy_get_city_radius_limit, galaxy_cal_city_graph, galaxy_get_colonized_map, galaxy_mock_cal_civilian_demands, galaxy_get_nation_relation, galaxy_interop_search_neighbour_nations, galaxy_has_division, galaxy_cal_planet_dim, galaxy_get_planet_width, galaxy_get_planet_height, galaxy_get_planet_points, galaxy_get_planet_path, galaxy_get_planet_edges, galaxy_get_planet_name, galaxy_cal_planet_click, galaxy_cal_next_state, __wbindgen_global_argument_ptr, __wbg_citygraph_free, __wbg_get_citygraph_num_structures, __wbg_set_citygraph_num_structures, citygraph_get_points, citygraph_get_dims, citygraph_get_roads, get_planet_vertex_dist, get_ticks_per_second, __wbg_nationid_free, __wbg_galaxy_free, __wbg_productparams_free, __wbg_get_productparams_production_capacity, __wbg_set_productparams_production_capacity, __wbg_get_productparams_qty, __wbg_set_productparams_qty, __wbg_soldiers_free, __wbg_get_soldiers_rifle, __wbg_set_soldiers_rifle, __wbg_get_soldiers_uniform, __wbg_set_soldiers_uniform, __wbg_get_soldiers_saber, __wbg_set_soldiers_saber, __wbg_get_soldiers_exoskeleton, __wbg_set_soldiers_exoskeleton, bootstrap, __wbg_get_soldiers_troops, __wbg_set_soldiers_troops, galaxy_add_division_template, galaxy_get_division_template, galaxy_train_division, galaxy_interop_move_division, galaxy_get_divisions_in_training, galaxy_get_divisions_undeployed, galaxy_get_all_division_location, galaxy_interop_deploy_division, __wbindgen_malloc, __wbindgen_free */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Instantiate WebAssembly module
var wasmExports = __webpack_require__.w[module.i];
__webpack_require__.r(exports);
// export exports from WebAssembly module
for(var name in wasmExports) if(name != "__webpack_init__") exports[name] = wasmExports[name];
// exec imports from WebAssembly module (for esm order)
/* harmony import */ var m0 = __webpack_require__(/*! ./galaxy */ "./galaxy.js");


// exec wasm module
wasmExports["__webpack_init__"]()

/***/ })

}]);
//# sourceMappingURL=0.bundle.js.map