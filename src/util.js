module.exports = {
  humanizedNumber(num) {
    if (num > 10.0) {
      return num.toFixed(0)
    }
    return num.toPrecision(2)
  },

  isBuilding(building) {
    return !building.match(/^\(.*\)$/)
  },

  recipeString(r) {
    let inputs = [];
    for (let i of r.input) {
      if (i.quantity === 1) {
        inputs.push(i.name)
      } else {
        inputs.push(i.name + ' x ' + i.quantity)
      }
    }
    return ' by ' + inputs.join(' + ')
  }
};
