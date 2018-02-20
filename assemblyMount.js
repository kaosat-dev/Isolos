const {cylinder} = require('@jscad/csg/api').primitives3d
const {color} = require('@jscad/csg/api').color
const {difference} = require('@jscad/csg/api').booleanOps

module.exports = function assemblyMount (params) {
  const {plateThickness, plateOffset, assemblyMountDia, assemblyMountBoltDia} = params
  return color('gray',
    difference(
      cylinder({h: plateOffset - plateThickness, d: assemblyMountDia}),
      cylinder({h: plateOffset - plateThickness, d: assemblyMountBoltDia})
    )
  )
    .translate([0, 0, plateThickness])
}
