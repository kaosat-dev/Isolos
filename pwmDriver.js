
const {color} = require('../../core/scad-api/').color
const {cube} = require('../../core/scad-api/').primitives3d

module.exports = function adafruitI2CPwmDriver () {
  const dimensions = [50, 20, 1]
  return color([0.05, 0, 0.9, 0.98], cube({size: dimensions, center: [true, true, false]}))
}
