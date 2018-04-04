const {cylinder} = require('jscad-tree-experiment').api.primitives3d
const {color} = require('jscad-tree-experiment').api.color
const {difference} = require('jscad-tree-experiment').api.booleanOps
const {translate} = require('jscad-tree-experiment').api.transformations

module.exports = function assemblyMount (params) {
  const {plateThickness, plateOffset, assemblyMountDia, assemblyMountBoltDia} = params
  return translate([0, 0, plateThickness], color('gray',
    difference(
      cylinder({h: plateOffset - plateThickness, d: assemblyMountDia}),
      cylinder({h: plateOffset - plateThickness, d: assemblyMountBoltDia})
    )
  ))
}
