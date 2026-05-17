function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

module.exports = { money };