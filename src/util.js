module.exports = {
  humanizedNumber(num) {
    if (num > 10.0) {
      return num.toFixed(0)
    }
    return num.toPrecision(2)
  }
};
