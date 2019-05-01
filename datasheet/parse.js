const fs = require('fs');
const csv = require('csv');

const parseRecipe = csv.parse({ from_line: 2 }, (error, data) => {
  if(error) {
    console.log(error);
    return
  }

  let newData = {};

  data.forEach((element) => {
    let row = {
      output: {},
      input: [],
      time: parseFloat(element[4]),
      building: element[5],
    };

    for(let i = 0; i < 2; i++) {
      if(element[i*2] === '') {
        break
      }
      row.output[element[i*2]] = parseInt(element[i*2+1])
    }

    for(let i = 0; i < 5; i++) {
      if(element[i*2+6] === '') {
        break
      }
      row.input.push({
        name: element[i * 2 + 6],
        quantity: parseInt(element[i * 2 + 7])
      })
    }

    for (let key in row.output) {
      if (row.output.hasOwnProperty(key)) {
        if (!newData[key]) {
          newData[key] = [];
        }
        newData[key].push(row);
      }
    }
  });

  //write
  fs.writeFile('../src/assets/recipe.json',JSON.stringify(newData),(error)=>{
    if(error) {
      console.log(error);
    }
  })
});

const parseSell = csv.parse({ from_line: 2 }, (error, data) => {
  if(error) {
    console.log(error);
    return
  }

  let newData = {};

  data.forEach((element) => {
    let row = {
      item: element[1],
      happiness: parseFloat(element[2]),
      coin: element[3],
      value: parseFloat(element[4]),
    };

    if(!newData[element[0]]) {
      newData[element[0]] = [];
    }

    newData[element[0]].push(row);
  });

  //write
  fs.writeFile('../src/assets/sell.json',JSON.stringify(newData),(error)=>{
    if(error) {
      console.log(error);
    }
  })
});

const parseList = csv.parse((error, data) => {
  if(error) {
    console.log(error);
    return
  }

  let newData = [];

  data.forEach((element, i) => {
    for(let j = 0; j < 10; j++) {
      if(element[j] === '') {
        continue;
      }
      let cell = {
        i: i,
        j: j,
        name: element[j],
      };
      newData.push(cell);
    }
  });

  //write
  fs.writeFile('../src/assets/list.json',JSON.stringify(newData),(error)=>{
    if(error) {
      console.log(error);
    }
  })
});

fs.createReadStream('Factory Town Recipe - Recipe.csv').pipe(parseRecipe);
fs.createReadStream('Factory Town Recipe - Sell.csv').pipe(parseSell);
fs.createReadStream('Factory Town Recipe - List.csv').pipe(parseList);
