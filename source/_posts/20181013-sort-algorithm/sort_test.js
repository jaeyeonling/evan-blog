function bubbleSort (input) {
    const len = input.length;
    let tmp = null;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (input[j] > input[j + 1]) {
                // Swap
                tmp = input[j];
                input[j] = input[j + 1];
                input[j + 1] = tmp;
                tmp = null;
            }
        }
    }
    return input;
}

function selectionSort (input) {
    const len = input.length;
    let tmp = null;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (input[i] < input[j]) {
                // Swap
                tmp = input[j];
                input[j] = input[i];
                input[i] = tmp;
                tmp = null;
            }
        }
    }
    return input;
}

function insertionSort (input) {
    const len = input.length;
    for (let i = 1; i < len; i++) { // 두번째 카드부터 시작
        const value = input[i]; // 카드를 잡는다
        let j = i-1;
        for (;j > -1 && input[j] > value; j--) {
            // 이미 정렬된 카드들을 뒤에서부터 살펴보다가
            // 살펴본 카드가 현재 카드보다 크다면
            // 살펴본 카드를 뒤로 한칸 보낸다
            input[j+1] = input[j];
        }
        // 뒤로 보내는 행위가 끝나면
        // 현재 카드보다 작은 카드의 한칸 뒤에
        // 현재 카드를 위치시킨다
        input[j+1] = value;
    }
    return input;
}

function merge (left, right) {
    const result = [];
    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        }
        else {
            result.push(right.shift());
        }
    }
    while (left.length) {
        result.push(left.shift());
    }
    while(right.length) {
        result.push(right.shift());
    }
    return result;
}
function mergeSort (input) {
    if (input.length < 2) {
        return input;
    }
    const middle = parseInt(input.length / 2);
    const left = input.slice(0, middle);
    const right = input.slice(middle, input.length);
    return merge(mergeSort(left), mergeSort(right));
}

function getInput () {
    const input = [];
    for (let i = 0; i < 30000; i++) {
        const num = Math.floor(100000 + Math.random() * 900000);
        input.push(num);
    }
    return input;
}
const test = getInput();
function getTestInput () {
    return JSON.parse(JSON.stringify(test));
}

console.time('bubbleSort');
bubbleSort(getTestInput());
console.timeEnd('bubbleSort');
console.time('selectionSort');
selectionSort(getTestInput());
console.timeEnd('selectionSort');
console.time('insertionSort');
insertionSort(getTestInput());
console.timeEnd('insertionSort');
console.time('mergeSort');
mergeSort(getTestInput());
console.timeEnd('mergeSort');