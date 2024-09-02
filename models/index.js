// Selection sort
function selectionSort(arr) {
    for(i = 0; i < arr.length; i++) {
        let minIndex = i;
        for(j = i + 1; j < arr. length; j++){
            if(arr[minIndex] > arr[j]) {
                minIndex = j;
            }
            if(minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            } 
        }
    }
    return arr;
}

const numbers = [100, 500, 200, 300, 100];

const sortedNumbers = selectionSort(numbers);;

console.log(sortedNumbers);

// Cumulative sum
function cumulativeSum(arr) {
    let cumulativeSums = []
    let sum = 0

    for(const num of arr) {
        sum += num
        cumulativeSums.push(sum)
    }
    return cumulativeSums
}

const numbers1 = [10, 120, 33, 4, 66]
const cumulativeSums = cumulativeSum(numbers1);
console.log(cumulativeSums)

