



function suma(a,b)
{
    c= a+b
    // programar
    return c
}


testData = [
    [1,2,3],
    [3,7,10],
    [4,6,10],
    [32,7,39],
    [1,8,9],
    [3,0,3],
    [344,4,348]
]

var count = 0
testData.forEach(data => {
    d = suma(data[0],data[1])
    c = data[2]
    if(d == c)
        count++
    console.log(d == c)
});
console.log(count*100/testData.length)
