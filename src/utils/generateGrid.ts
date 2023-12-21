export default function (rows: number, cols: number) {
    const areaArr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        areaArr[i] = new Array(cols).fill(-1);
    }

    let width = 0, height = 0
    let footer = 0
    for (let i = 0; i < areaArr.length; i++) {
        for (let j = 0; j < areaArr[i].length; j++) {
            // 这里找到了横向的第一个空位
            if (areaArr[i][j] === -1) {
                const start = j
                // 接下来要找横向最多只能到哪里,因为可能上面有很高的盒子挡住了去路
                let end = start
                for (; end < areaArr[i].length; end++) {
                    // 如果一旦发现有不是-1的值，则代表最远只能到这里
                    if (areaArr[i][end] !== -1) {
                        break
                    }
                }
                // 最大长度为两个值相减
                const maxWidth = end - start
                width = randomInt(1, maxWidth)
                // 最大高度为最大高度和宽度中的最小值，也就是高度不能超过宽度
                const nowHeight = areaArr.length - i - 1
                const maxHeight = Math.min(nowHeight, width)
                height = randomInt(1, maxHeight)

                // 用拿到的宽高去填充数组
                for (let h = 0; h < height; h++) {
                    for (let w = 0; w < width; w++) {
                        areaArr[i + h][j + w] = `item_${footer}`
                    }
                }


                footer++
            }
        }
    }
    return {
        length: footer,
        grid: areaArr
    }
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}