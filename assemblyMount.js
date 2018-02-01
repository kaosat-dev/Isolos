const {cylinder} = require('@jscad/csg/api').primitives3d
const {color} = require('@jscad/csg/api').color
const {difference} = require('@jscad/csg/api').booleanOps

module.exports = function assemblyMount (params) {
  const {bottomThickness, assemblyMountDia, assemblyMountBoltDia} = params
  return color('gray',
    difference(
      cylinder({h: 27 - bottomThickness, d: assemblyMountDia}),
      cylinder({h: 27 - bottomThickness, d: assemblyMountBoltDia})
    )
  )
    .translate([0, 0, bottomThickness])
}
