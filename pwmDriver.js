
const {color} = require('jscad-tree-experiment').api.color
const {cube} = require('jscad-tree-experiment').api.primitives3d

module.exports = function adafruitI2CPwmDriver () {
  const dimensions = [62.23, 25.908, 1]
  return color([0.05, 0.7, 0.9], cube({size: dimensions, center: [true, true, false]}))
}
